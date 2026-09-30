---
name: web3-frontend-ux
description: Best practices for Web3 decentralized application (DApp) user experience, wallet connection states, transaction lifecycles, cryptographic identity representations, and real-time smart contract events.
---

# Web3 Frontend & DApp UX Skill

This skill guides the design and implementation of intuitive, trustworthy, and modern Web3 user experiences.

## 1. Wallet Connection Experience
- Support standard web3 providers (MetaMask, Coinbase Wallet, WalletConnect).
- Display a clear status pill (Connected with green pulsing badge vs. "Connect Wallet" CTA).
- Formatted address representation (e.g. `0x1234...5678`) with Blockies/Jazzicon visual avatar.
- 1-click copy address with instant tooltip / toast confirmation.
- Network detection badge (e.g., Ethereum Mainnet, Sepolia Testnet, Hardhat/Localhost).

## 2. Transaction Lifecycle Feedback
- **Pre-transaction**: Validate parameters client-side (checksum address, non-zero amount, gas estimates).
- **Pending state**: Clear animated modal/notification with tx hash link to block explorer (Etherscan).
- **Success state**: Confetti / checkmark celebration, auto-refresh contract balance and state.
- **Reverted / Error state**: Human-readable error translation (e.g. "User rejected request", "Insufficient balance for gas").

## 3. Blockchain Contract Visualization
- Visual Stepper for multi-stage contracts (Created -> Accepted -> Shipping/Delivering -> Completed -> Paid).
- Cryptographic hash inspection (QR code scanner, copy button, verified badge).
- Role-based contextual action triggers (Only show "Confirm Delivery" to Receiver, "Accept" to Provider).
