# CoreInventory - Enterprise Stock Management System

CoreInventory is a robust, full-stack inventory management solution designed to handle real-time stock tracking, multi-warehouse operations, and secure audit logging. It features a lightweight, lightning-fast vanilla JavaScript frontend paired with a secure Node.js and PostgreSQL backend.

## 🚀 Features

* **Secure Authentication:** User registration and login utilizing JWT (JSON Web Tokens) and bcrypt password hashing. Role-based access control (Manager vs. Warehouse Staff).
* **Real-Time Dashboard:** Interactive analytics using Chart.js, KPI tracking, and automated "Critical Low Stock" alerts based on custom reorder rules.
* **Product Management:** Create and manage SKUs, categories, and unit measurements across multiple storage locations (e.g., Main Store, Production Rack).
* **Stock Operations:** Seamlessly process Inbound Receipts, Outbound Deliveries, Internal Transfers, and Manual Adjustments.
* **Immutable Audit Ledger:** Every transaction is logged instantly to a PostgreSQL database using ACID-compliant transactions, ensuring complete data integrity.
* **Instant PDF Manifests:** Generate and download professional, formatted PDF receipts for stock movements using jsPDF.

## 🛠️ Tech Stack

**Frontend:**
* HTML5 & CSS3 (Custom Enterprise-grade UI)
* Vanilla JavaScript (ES6+)
* Chart.js (Analytics)
* jsPDF (PDF Generation)

**Backend:**
* Node.js & Express.js (REST API)
* PostgreSQL (Relational Database)
* `pg` (node-postgres client)
* `jsonwebtoken` (Auth) & `bcrypt` (Security)

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v16 or higher)
* [PostgreSQL](https://www.postgresql.org/) (v12 or higher)
* pgAdmin (Optional, but recommended for database management)
* VS Code with the "Live Server" extension installed.

---

## 📦 Installation & Setup

### 1. Database Configuration
1. Open pgAdmin or your PostgreSQL command line.
2. Create a new database named `core_inventory`.
3. Open a Query Tool for `core_inventory` and run the following SQL script to generate the tables:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100),
    unit VARCHAR(50),
    reorder_rule INT DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_stocks (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    location_name VARCHAR(100) NOT NULL,
    quantity INT DEFAULT 0,
    UNIQUE(product_id, location_name)
);

CREATE TABLE stock_ledger (
    id SERIAL PRIMARY KEY,
    transaction_type VARCHAR(50),
    description TEXT,
    qty_change INT,
    location VARCHAR(100),
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
