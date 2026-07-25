# 📦 Web3 Logistics DApp - Decentralized Supply Chain Management

## Introduction

Welcome to the **Web3 Logistics DApp**! This project is a comprehensive Web2.5 platform designed to solve the "trust" and "transparency" issues in B2B logistics. By replacing traditional intermediaries with blockchain technology, this platform automates escrow, delivery verification, and penalty execution. 

Developed as an **Outstanding University Scientific Research Project (Đề tài NCKH)**, this application aims to provide a robust, secure, and practical solution for modern supply chain management.

> **Demo:** [Please give me a Star ⭐️ on GitHub if you find this project useful!]
> 
> *(You can insert a Demo.mp4 or GIF here showcasing your DApp)*

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
