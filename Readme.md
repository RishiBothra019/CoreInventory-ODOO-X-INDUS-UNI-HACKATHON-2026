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


STRUCTURE:-
CoreInventoryApp/
│
├── backend/                  # Node.js Server & Database Logic
│   ├── .env                  # Environment variables (Ignored by Git)
│   ├── db.js                 # PostgreSQL connection setup
│   ├── middleware.js         # JWT Security checks
│   ├── package.json          # Backend dependencies
│   ├── routes.js             # API Endpoints
│   └── server.js             # Main server entry point
│
├── frontend/                 # User Interface
│   └── index.html            # Main App HTML, CSS, and JS
│
├── .gitignore                # Tells Git which files to hide
└── README.md                 # Project documentation
```


NOTE:- 

Unlike projects that rely on generic Backend-as-a-Service (BaaS) platforms, CoreInventory operates on a custom-built RESTful API and integrates seamlessly with native and third-party web APIs to deliver a full enterprise experience.

1. Custom REST API (Node.js & Express)
The core of the application is a dedicated backend API built from scratch to securely handle PostgreSQL database transactions. Key endpoint structures include:
• /api/auth/*: Handles secure user onboarding and authentication using bcrypt and issues JSON Web Tokens (JWT).
• /api/products/*: Manages the CRUD operations for the master asset catalog and calculates real-time stock levels using PostgreSQL aggregate functions.
• /api/inventory/transaction: The operational engine that uses ACID-compliant database transactions to simultaneously update stock quantities and write to the immutable audit ledger.
• /api/inventory/ledger: Serves paginated, chronological audit trails for the dashboard and history views.


2. Native Web APIs
The frontend consumes the custom backend using modern, built-in browser APIs to ensure a lightweight footprint:
• Fetch API: Utilized for all asynchronous HTTP requests (GET, POST) to ensure the UI updates instantly without requiring page reloads.
• Web Storage API: localStorage is used to securely persist the user's JWT, maintaining their authenticated session across the application.
• DOM API: Heavily leveraged to dynamically construct tables, update KPI metrics, and trigger UI state changes the millisecond data is returned from the server.


3. Third-Party Integrations
To enhance data visualization and reporting, the application consumes external libraries via CDNs:
• Chart.js API: Transforms raw numerical stock arrays from the database into responsive, interactive line charts on the main dashboard.
• jsPDF API: Programmatically draws text, lines, and transactional variables onto a canvas to generate downloadable, formatted PDF manifests directly in the client's browser.

