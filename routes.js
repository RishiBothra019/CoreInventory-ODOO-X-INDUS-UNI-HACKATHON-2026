const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const { verifyToken } = require('./middleware');

// --- AUTHENTICATION ---
router.post('/auth/signup', async (req, res) => {
    const { email, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query(
            "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role",
            [email, hashedPassword, role || 'staff']
        );
        res.json(newUser.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length === 0) return res.status(404).json({ error: "User not found" });

        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!validPassword) return res.status(401).json({ error: "Invalid password" });

        const token = jwt.sign({ id: user.rows[0].id, role: user.rows[0].role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, role: user.rows[0].role });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- PRODUCT MANAGEMENT ---
router.get('/products', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.*, json_object_agg(ps.location_name, ps.quantity) as stock
            FROM products p
            LEFT JOIN product_stocks ps ON p.id = ps.product_id
            GROUP BY p.id ORDER BY p.id DESC
        `);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/products', verifyToken, async (req, res) => {
    const { name, sku, category, unit, reorder_rule, initial_stock } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO products (name, sku, category, unit, reorder_rule) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [name, sku, category, unit, reorder_rule]
        );
        const p = result.rows[0];
        
        // Create initial stock rows for this product
        await pool.query(
            "INSERT INTO product_stocks (product_id, location_name, quantity) VALUES ($1, 'Main Store', $2), ($1, 'Production Rack', 0)", 
            [p.id, initial_stock || 0]
        );
        res.json(p);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- INVENTORY OPERATIONS (Receipts, Deliveries, Transfers, Adjustments) ---
router.post('/inventory/transaction', verifyToken, async (req, res) => {
    const { type, productId, qty, location, description, targetLocation } = req.body;
    
    // We use a PostgreSQL "Transaction" (BEGIN/COMMIT) to ensure if stock updates, the log updates too.
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        if (type === 'Receipt') {
            await client.query("UPDATE product_stocks SET quantity = quantity + $1 WHERE product_id = $2 AND location_name = $3", [qty, productId, location]);
        } else if (type === 'Delivery') {
            await client.query("UPDATE product_stocks SET quantity = quantity - $1 WHERE product_id = $2 AND location_name = $3", [qty, productId, location]);
        } else if (type === 'Transfer') {
            // Remove from source, add to target
            await client.query("UPDATE product_stocks SET quantity = quantity - $1 WHERE product_id = $2 AND location_name = $3", [qty, productId, location]);
            await client.query("UPDATE product_stocks SET quantity = quantity + $1 WHERE product_id = $2 AND location_name = $4", [qty, productId, targetLocation]);
        }
        
        // Save to Audit Ledger
        await client.query("INSERT INTO stock_ledger (transaction_type, description) VALUES ($1, $2)", [type, description]);
        
        await client.query('COMMIT');
        res.json({ success: true });
    } catch (err) { 
        await client.query('ROLLBACK'); 
        res.status(500).json({ error: err.message }); 
    } finally { 
        client.release(); 
    }
});

// --- FETCH AUDIT LEDGER ---
router.get('/inventory/ledger', verifyToken, async (req, res) => {
    try {
        const result = await pool.query("SELECT created_at as time, transaction_type as type, description as desc, status FROM stock_ledger ORDER BY created_at DESC LIMIT 20");
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;