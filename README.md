# 🚗 Drive Now - A Cloud-Based Smart Fleet Management & QR-Verified Rental Platform

> A secure, transparent, and fully digital vehicle rental ecosystem built on the MERN stack, featuring QR-code verified pickups, real-time fleet inventory management, and Razorpay-integrated payment processing.

---

## 📋 Overview

**Drive Now** is a full-stack web application designed to modernize the vehicle rental industry by replacing traditional, paper-heavy rental workflows with a streamlined, digitally-verified marketplace. The platform connects individual customers with fleet administrators through a centralized system that ensures accountability at every stage—from browsing and booking to secure pickup verification and return processing.

The core innovation of Drive Now is its **QR-Verified Authorization Pipeline**: every confirmed booking generates an encrypted, unique QR code receipt that must be scanned by an administrator to authorize the vehicle handover. This eliminates manual ID checks, prevents unauthorized pickups, and creates an immutable digital audit trail for every transaction.

---

## ✨ Key Features

### 1. Multi-Role Authentication & Authorization
- **Role-Based Access Control (RBAC):** Distinct access levels for **Admin** and **Customer** roles with secure session management using JSON Web Tokens (JWT).
- **Password Security:** All passwords are salted and hashed using **Bcrypt.js** before storage in MongoDB.
- **Session Persistence:** JWT-based stateless authentication maintains secure login states across page refreshes and navigation.

### 2. Real-Time Fleet Inventory Engine
- **Automated Availability Logic:** Vehicle status instantly transitions from "Available" to "Booked" upon successful payment, preventing double-bookings.
- **Multi-Status Tracking:** Vehicles can be marked as **Available**, **Booked**, **Under Maintenance**, or **Verified**.
- **Vehicle Cataloging:** Admins can add vehicles with full specifications—brand, model, registration number, category (Hatchback, Sedan, SUV, Bike), price per day, and images.

### 3. QR-Verified Pickup Pipeline
- **Digital Receipt Generation:** Upon payment confirmation, a unique encrypted QR code is generated and displayed on the customer's dashboard.
- **Email Delivery:** The QR receipt is also sent to the customer's email via **Nodemailer**.
- **Admin Scanner Interface:** A dedicated scanning view allows admins to verify the QR code and transition the booking from "Confirmed" to "Verified," authorizing the vehicle handover.

### 4. Razorpay-Integrated Payment Engine
- **Secure Checkout:** Razorpay API integration handles encrypted financial transactions with real-time verification.
- **Cryptographic Signature Verification:** The backend validates every payment callback against the Razorpay secret key before confirming the booking and triggering QR code generation.
- **Automated Invoicing:** Dynamic rental cost calculation based on duration and applicable taxes.

### 5. Role-Specific Dashboards
- **Customer Dashboard:** View active bookings, booking history, total spending, and access QR receipts.
- **Admin Dashboard:** Manage fleet inventory, track all system bookings, monitor revenue metrics, and handle the "Return & Release" flow to maximize vehicle uptime.

### 6. Automated Notifications & Audit Trail
- **Email Receipts:** Nodemailer sends professional booking confirmation receipts and verification alerts.
- **Transaction Logging:** Every booking and payment is recorded with an immutable audit trail for administrative transparency.

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React.js | Component-based SPA with dynamic UI rendering |
| **Styling** | Tailwind CSS | Responsive, professional dashboards and layouts |
| **Backend** | Node.js + Express.js | RESTful API, middleware authentication, booking engine |
| **Database** | MongoDB (Mongoose) | NoSQL document storage with schema validation |
| **Authentication** | JWT + Bcrypt.js | Stateless session management & password hashing |
| **Payments** | Razorpay API | Encrypted payment gateway with signature verification |
| **QR Codes** | qrcode.react | Dynamic encrypted QR code generation |
| **Email** | Nodemailer | Automated booking receipts and verification alerts |
| **HTTP Client** | Axios | Asynchronous API communication (frontend ↔ backend) |
| **Version Control** | Git | Source code management |

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React.js)                   │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Customer  │  │   Admin      │  │  QR Scanner View  │  │
│  │ Dashboard │  │  Dashboard   │  │  (Verification)   │  │
│  └─────┬─────┘  └──────┬───────┘  └────────┬──────────┘  │
│        └────────────────┼───────────────────┘            │
│                    Axios HTTP                            │
└────────────────────────┬────────────────────────────────┘
                         │ REST API
┌────────────────────────┼────────────────────────────────┐
│                BACKEND (Node.js + Express.js)            │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │   Auth    │  │   Booking    │  │   Payment Engine  │  │
│  │ Middleware│  │   Engine     │  │  (Razorpay API)   │  │
│  │  (JWT)   │  │              │  │                   │  │
│  └──────────┘  └──────────────┘  └───────────────────┘  │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  Fleet   │  │  QR Code     │  │   Email Service   │  │
│  │ Manager  │  │  Generator   │  │   (Nodemailer)    │  │
│  └──────────┘  └──────────────┘  └───────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │ Mongoose ODM
┌────────────────────────┼────────────────────────────────┐
│                    DATABASE (MongoDB)                     │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │   User   │  │   Vehicle    │  │    Booking        │  │
│  │Collection│  │  Collection  │  │   Collection      │  │
│  └──────────┘  └──────────────┘  └───────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄 Database Schema

### User Collection
```json
{
  "_id": "ObjectId",
  "name": "String",
  "email": "String (unique)",
  "password": "String (bcrypt hashed)",
  "role": "String (enum: Admin, Customer)",
  "phoneNumber": "String",
  "address": "String",
  "createdAt": "Date"
}
```

### Vehicle Collection
```json
{
  "_id": "ObjectId",
  "modelName": "String",
  "brand": "String",
  "category": "String (enum: Hatchback, Sedan, SUV, Bike)",
  "regNumber": "String (unique, format: MH-12-XX-0000)",
  "pricePerDay": "Number",
  "images": ["String (URLs)"],
  "status": "String (enum: Available, Booked, Maintenance)",
  "features": ["String"],
  "updatedAt": "Date"
}
```

### Booking Collection
```json
{
  "_id": "ObjectId",
  "vehicleId": "ObjectId (ref: Vehicle)",
  "customerId": "ObjectId (ref: User)",
  "paymentId": "String (Razorpay Transaction ID)",
  "bookingDates": {
    "from": "Date",
    "to": "Date"
  },
  "totalAmount": "Number",
  "status": "String (enum: Pending, Confirmed, Verified, Completed, Cancelled)",
  "qrCodeToken": "String (encrypted)",
  "verificationStatus": "String (enum: Not Picked Up, Picked Up, Returned)"
}
```

### Rental Pricing Formula
```
Total Rental Cost = (Price Per Day × Total Days) + Security Deposit
```

---

## 🔄 Booking Lifecycle

```
  ┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐
  │ Available │────▶│  Booked   │────▶│ Confirmed │────▶│  Verified │────▶│ Completed │
  └───────────┘     └───────────┘     └───────────┘     └───────────┘     └───────────┘
     (Initial)      (Payment        (Razorpay         (Admin scans      (Vehicle
                     initiated)      verified)         QR code)          returned)
```

1. **Available** → Vehicle is listed and open for booking
2. **Booked** → Customer clicks "Book Now," Razorpay order is created
3. **Confirmed** → Payment is verified, QR code is generated and emailed
4. **Verified** → Admin scans the customer's QR code, authorizing pickup
5. **Completed** → Admin marks the ride as returned; vehicle reverts to "Available"

---

## 📦 Modules

| # | Module | Description |
|---|--------|-------------|
| 1 | **Identity & Access Management (IAM)** | Multi-role registration, JWT session handling, profile persistence |
| 2 | **Fleet & Inventory Module** | Vehicle cataloging, multimedia listings, availability workflow |
| 3 | **Booking & Reservation Module** | Real-time catalog, reservation state management, date selection |
| 4 | **Payment & Settlement Engine** | Razorpay integration, signature verification, automated invoicing |
| 5 | **QR-Verification & Pickup Pipeline** | Encrypted QR generation, admin scanner interface, digital handshake |
| 6 | **Analytics & Admin Reports** | Booking history, fleet performance, revenue metrics, user management |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v16+ and npm
- **MongoDB** (local or Atlas)
- **Git**
- A **Razorpay** account (for payment integration)

### Software & Hardware Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| OS | Windows 10 (64-bit) | Windows 11 / macOS / Linux |
| Processor | Intel Core i3 (10th Gen) | Intel Core i5+ |
| RAM | 4 GB | 8 GB |
| Storage | 250 GB HDD | 250 GB SSD |
| Browser | Chrome / Firefox / Edge (latest) | — |
| Internet | Stable connection | — |

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/udayrajsaroj/Drive-Now.git
   cd Drive-Now
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure environment variables**

   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/drivenow
   JWT_SECRET=your_jwt_secret_key

   # Razorpay Credentials
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret

   # Email (Nodemailer)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

5. **Start the development servers**

   Backend:
   ```bash
   cd backend
   npm run dev
   ```

   Frontend:
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the application**

   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user (Customer/Admin) |
| POST | `/api/auth/login` | Login and receive JWT token |
| GET | `/api/auth/profile` | Get authenticated user profile |

### Vehicles (Fleet)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vehicles` | Get all available vehicles |
| GET | `/api/vehicles/:id` | Get vehicle by ID |
| POST | `/api/vehicles` | Add new vehicle (Admin only) |
| PUT | `/api/vehicles/:id` | Update vehicle details (Admin only) |
| DELETE | `/api/vehicles/:id` | Remove vehicle (Admin only) |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create a new booking |
| GET | `/api/bookings/my-bookings` | Get customer's bookings |
| GET | `/api/bookings/all` | Get all system bookings (Admin) |
| PUT | `/api/bookings/:id/verify` | Verify QR code and mark as "Verified" |
| PUT | `/api/bookings/:id/complete` | Mark booking as "Completed" (vehicle returned) |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/create-order` | Create Razorpay order |
| POST | `/api/payments/verify` | Verify Razorpay payment signature |

---

## 🧪 Testing

The project has been validated through a comprehensive multi-tier testing strategy:

### Unit Testing
- Authentication logic (JWT generation, credential validation)
- Rental pricing algorithm accuracy
- QR code token generation and uniqueness
- Mongoose schema validation (registration number format, required fields)

### Integration Testing
- Authentication ↔ Database (user persistence across sessions)
- Fleet module ↔ Booking engine (availability synchronization)
- Razorpay ↔ Booking logic (payment triggers QR generation)
- QR Scanner ↔ Database (real-time status transitions)

### Beta Testing
- End-to-end user flows (registration → booking → payment → pickup → return)
- Role-based access enforcement (customer cannot access admin routes)
- Payment resilience (network timeout, cancelled payments)
- Responsive UI across devices and screen sizes

### Key Test Results

| Test Case | Description | Status |
|-----------|-------------|--------|
| TC-01 | Role-based dashboard access control | ✅ Pass |
| TC-02 | Admin adds new vehicle with image | ✅ Pass |
| TC-03 | Razorpay transaction & QR generation | ✅ Pass |
| TC-04 | Double-booking prevention | ✅ Pass |
| TC-05 | QR-code pickup verification | ✅ Pass |
| TC-06 | Unauthorized route protection | ✅ Pass |
| TC-07 | Total rent pricing calculation | ✅ Pass |
| TC-08 | QR code generation after payment | ✅ Pass |
| TC-09 | Admin QR verification status update | ✅ Pass |
| TC-10 | Admin revenue & booking reports | ✅ Pass |
| TC-11 | Unauthorized payment rejection | ✅ Pass |
| TC-12 | Performance with 20+ vehicles | ✅ Pass |

---

## 🔒 Security Design

| Layer | Mechanism | Purpose |
|-------|-----------|---------|
| **Authentication** | JWT (JSON Web Tokens) | Stateless, secure session management |
| **Password Storage** | Bcrypt.js hashing | One-way encryption with salt |
| **Access Control** | RBAC middleware | Role-specific route protection |
| **Data Validation** | Mongoose Schema Validation | Input sanitization, NoSQL injection prevention |
| **Payment Security** | Razorpay Signature Verification | Cryptographic validation of all transactions |
| **QR Tokens** | Encrypted token generation | Prevents duplicate/unauthorized pickups |

---

## ⚠️ Limitations

1. **Active Internet Dependency** — Payments and QR verification require a stable internet connection; offline bookings are not supported.
2. **Base64 Image Storage** — Vehicle images are stored as Base64 strings in MongoDB, which increases document size and may impact performance at scale.
3. **No Physical Condition Logging** — The system lacks automated logging of vehicle condition (scratches, fuel level) at pickup/return.
4. **No Real-Time Push Notifications** — Booking status updates are reflected in the database but not pushed via SMS or mobile notifications.

---

## 🔮 Future Scope

| Feature | Description |
|---------|-------------|
| **IoT GPS Tracking** | Real-time vehicle location monitoring via IoT devices |
| **Automated Payouts (RazorpayX)** | Auto-refund security deposits upon ride completion |
| **AI Damage Detection** | CNN-based model to analyze vehicle photos for scratch/dent detection |
| **Push Notifications (FCM)** | Real-time alerts for booking confirmations and rental expiry |
| **Dynamic Pricing & Surge Logic** | Demand-based pricing algorithms for peak rental periods |
| **Cloud Image Storage (AWS S3)** | Migrate from Base64 to S3 for optimized image handling and CDN delivery |
| **Mobile App (React Native)** | Native mobile experience with built-in QR camera scanning |

---

## 📚 References

1. [React.js Official Documentation](https://react.dev/)
2. [Razorpay API Reference](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/)
3. [Node.js Documentation](https://nodejs.org/en/docs)
4. [MongoDB & Mongoose Documentation](https://www.mongodb.com/docs/)
5. [Axios HTTP Client](https://axios-http.com/docs/intro)
6. [MDN Web Docs — FileReader & Base64](https://developer.mozilla.org/en-US/docs/Web/API/FileReader)
7. [JWT Introduction](https://jwt.io/introduction/)
8. [qrcode.react — NPM](https://www.npmjs.com/package/qrcode.react)

