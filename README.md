# 📦 Web3 Logistics DApp - Decentralized Supply Chain Management

## Introduction

Welcome to the **Web3 Logistics DApp**! This project is a comprehensive Web2.5 platform designed to solve the "trust" and "transparency" issues in B2B logistics. By replacing traditional intermediaries with blockchain technology, this platform automates escrow, delivery verification, and penalty execution. 

Developed as an **Outstanding University Scientific Research Project (Đề tài NCKH)**, this application aims to provide a robust, secure, and practical solution for modern supply chain management.

---

## 🔥 Features

* **Smart Contract Escrow:** Locks transportation funds securely on the blockchain. Funds are automatically released upon successful delivery or deducted if penalties apply.
* **Immutable Proof of Delivery:** Uses **IPFS** to store sensitive delivery evidence (documents, images). Documents are tamper-proof via unique Content Identifiers (CIDs).
* **Hybrid Web2.5 Architecture:** Strategically separates on-chain logic (finances, strict rules) from off-chain data (GPS tracking history, UI states) to achieve a seamless user experience with minimal gas fees.
* **Real-time Tracking & Notifications:** Integrates dynamic mapping for route tracking and automated email reminders for overdue deliveries via Node.js cron jobs.
* **Secure Web3 Authentication:** Passwordless login and transaction signing utilizing **MetaMask**.

---

## 💻 Technologies Used

* **Blockchain & Smart Contracts:** Solidity, Hardhat, Ethers.js, Sepolia Testnet
* **Frontend:** React.js, Vite, Tailwind CSS (or your UI library)
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (NoSQL)
* **Decentralized Storage:** IPFS (via Pinata Cloud)

---

## 📂 Folder Structure

```text
Web3-Logistics-DApp
├── blockchain/           # Smart Contracts (Solidity), Hardhat config, and deployment scripts
├── client/               # Frontend (React, Vite, Web3 Integration)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
├── server/               # Backend (Node.js, Express, MongoDB connection)
│   ├── controllers/
│   ├── models/
│   └── routes/
├── .gitignore
├── LICENSE
└── README.md

```

---

## ⚙️ Installation and Setup

### Prerequisites

Before running the project, ensure you have the following installed:

* **Node.js** (v18.x or higher)
* **MetaMask Extension** installed in your browser (configured for the Sepolia Testnet with some test ETH).
* A **MongoDB Atlas** account (or local MongoDB).
* A **Pinata Cloud** account (for IPFS API Keys).

### Step-by-Step Guide

**1. Clone the Repository:**

```bash
git clone [https://github.com/your-username/Web3-Logistics-DApp.git](https://github.com/your-username/Web3-Logistics-DApp.git)
cd Web3-Logistics-DApp

```

**2. Install Dependencies:**
You need to install dependencies for all three main directories:

```bash
# In the root directory, open three terminal tabs:
cd client && npm install
cd server && npm install
cd blockchain && npm install

```

**3. Configure Environment Variables:**
You must create `.env` files in both the `client` and `server` directories.

* **For `client/`:** Create a `.env` file based on `.env.example`:

```env
VITE_PINATA_JWT=your_pinata_jwt_here
VITE_ADMIN_WALLETS=your_metamask_wallet_address_here

```

* **For `server/`:** Create a `.env` file based on `.env.example`:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
SEPOLIA_RPC_URL=your_alchemy_or_infura_url
ADMIN_WALLETS=your_metamask_wallet_address_here
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_google_app_password

```

**4. Run the Application:**
To run the full Web2.5 system, start both the backend and frontend simultaneously.

* **Start the Backend:**

```bash
cd server
npm run server

```

* **Start the Frontend:**

```bash
cd client
npm run dev

```

The DApp will be available at `http://localhost:5173`.

---

## 📖 Usage

1. **Connect Wallet:** Click "Connect Wallet" on the homepage to link your MetaMask account.
2. **Create Agreement (Client):** Fill in the delivery details, deadline, and penalty rules. The required ETH will be locked in the Smart Contract.
3. **Accept Agreement (Provider):** The driver reviews the terms and signs the transaction to accept the job.
4. **Update Tracking (Off-chain):** The driver updates location checkpoints (saved to MongoDB to save Gas).
5. **Complete Delivery:** The driver uploads proof of delivery (uploaded to IPFS). The client verifies and triggers the Smart Contract to release funds.

---

## 👨‍💻 Author

**Nguyễn Đức An**

* **Role:** Full-Stack Web3 Developer
* **Responsibilities:** Entire system architecture, Smart Contract development, Frontend UI/UX, Backend APIs, and IPFS integration.
* *This project was researched and developed independently as part of a University Scientific Research Program.*

---

## 📜 License

This project is licensed under the MIT License. See the LICENSE file for more details.

---

## 📬 Contact

For any questions, feedback, or collaboration inquiries, please contact:

* **Email:** nducan08@gmail.com
* **GitHub:** https://github.com/nducan04/

Thank you for exploring the Web3 Logistics DApp!

```

```
