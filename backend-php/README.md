# Charitage Foundation - PHP Backend API

Production-ready PHP backend with **Razorpay Payment Gateway integration**, **JWT Authentication**, and **MySQL Database**.

Designed as a **100% drop-in replacement** for the React frontend application (`frontend/`).

---

## 📁 Directory Structure

```text
backend-php/
├── .env                  # Environment configuration (DB, Razorpay, JWT)
├── .env.example          # Environment template
├── .htaccess             # Apache / cPanel / XAMPP rewrite rules
├── composer.json         # PHP project manifest
├── index.php             # Unified API Gateway & Router
├── schema.sql            # Complete MySQL database table definitions
├── seed.sql              # Initial database records (campaigns, users, blogs)
├── config/
│   ├── config.php        # Configuration & .env parser
│   └── database.php      # PDO database connection & auto-migration
├── helpers/
│   ├── jwt.php           # Pure-PHP HS256 JWT encoder/decoder
│   ├── razorpay.php      # Razorpay Orders, Subscriptions, & Signature verification
│   └── response.php      # JSON response & CORS middleware
└── routes/
    ├── auth.php          # Register, Login, Me, Forgot-Password
    ├── campaigns.php     # Campaign CRUD & category queries
    ├── donations.php     # Razorpay Orders, Verification, Top Donors, Receipts
    ├── blogs.php         # Blog posts & slugs
    ├── activities.php    # Field activities & gallery
    ├── stories.php       # Beneficiary impact stories
    ├── news.php          # Press releases & news updates
    ├── interactions.php  # Volunteers, Inquiries, Memberships, Stats
    └── admin.php         # Admin analytics & moderation
```

---

## 🚀 Quick Start (Local Development)

### 1. Start MySQL Database
If using **XAMPP**:
1. Open XAMPP Control Panel and start **MySQL** and **Apache**.
2. Open `http://localhost/phpmyadmin`.
3. Create database `charitage` (or it will be auto-created).
4. In phpMyAdmin, click **Import** and select:
   - First: `schema.sql`
   - Second: `seed.sql`

*(Alternatively, via command line:)*
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS charitage;"
mysql -u root -p charitage < schema.sql
mysql -u root -p charitage < seed.sql
```

### 2. Configure Environment (`.env`)
Verify `backend-php/.env`:
```ini
DB_HOST=localhost
DB_PORT=3306
DB_NAME=charitage
DB_USER=root
DB_PASS=

JWT_SECRET_KEY=a3f8c2e1d94b7056f1e2a3c4d5b6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4
RAZORPAY_KEY_ID=rzp_test_SP6qUkjR3eUzoI
RAZORPAY_KEY_SECRET=Os0gyXK42VjJDCJRbYFKaCUb
CORS_ORIGINS=*
```

### 3. Run the PHP Server
From the `backend-php/` directory:
```bash
php -S 127.0.0.1:8000 index.php
```

Your API is now live on `http://127.0.0.1:8000`!

---

## 🌐 Deployment to cPanel / Shared Hosting (Hostinger, GoDaddy, Namecheap)

1. **Upload Files**:
   - Compress the contents of `backend-php/` into a `.zip` file.
   - In cPanel **File Manager**, upload and extract into your target folder (e.g., `public_html/api` or a subdomain `api.charitage.org`).
2. **Create MySQL Database in cPanel**:
   - Go to **MySQL Databases** → Create a database (e.g., `u12345_charitage`).
   - Create a database user, assign it to the database with **ALL PRIVILEGES**.
3. **Import Database**:
   - Open **phpMyAdmin** in cPanel.
   - Select your database and import `schema.sql` and `seed.sql`.
4. **Update `.env`**:
   - Edit `.env` in cPanel File Manager with your database name, username, and password:
     ```ini
     DB_NAME=u12345_charitage
     DB_USER=u12345_user
     DB_PASS=your_strong_password
     RAZORPAY_KEY_ID=rzp_live_...
     RAZORPAY_KEY_SECRET=...
     CORS_ORIGINS=https://your-frontend-domain.com
     ```
5. **Connect Frontend**:
   - In your React frontend `.env`, set:
     ```env
     REACT_APP_BACKEND_URL=https://api.yourdomain.com
     ```

---

## 💳 Razorpay Payment Flow

1. **Frontend requests Razorpay Key**:
   - `GET /api/config` → returns `{"razorpay_key_id": "rzp_..."}`
2. **Create Order / Subscription**:
   - `POST /api/donations/create-order`
   - Body: `{"amount": 1000, "donor_name": "John", "donor_email": "john@example.com", "campaign_id": "camp-001"}`
   - Returns: `{"order_id": "order_...", "amount": 100000, "currency": "INR", "key_id": "..."}`
3. **Razorpay Modal Checkout**:
   - Frontend opens Razorpay Checkout dialog with `order_id`.
4. **Verify Payment**:
   - `POST /api/donations/verify`
   - Body: `{"razorpay_order_id": "...", "razorpay_payment_id": "...", "razorpay_signature": "..."}`
   - Server validates HMAC-SHA256 signature using `RAZORPAY_KEY_SECRET`.
   - On success: marks donation as `completed` and automatically increments the campaign's `raised_amount`.

---

## 🔑 Default Admin Account
- **Email**: `admin@charitage.org`
- **Password**: `admin123` (or reset via seed file)
- **Role**: `admin`
