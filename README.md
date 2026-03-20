# 📜 Proof of Existence on Stellar (Soroban)
<img width="952" height="465" alt="Screenshot 2026-03-20 141807" src="https://github.com/user-attachments/assets/4ba942e9-2a50-4308-a0d0-6e4442c1f544" />

## 🚀 Project Description

This project is a **Proof of Existence** smart contract built using **Soroban (Stellar Smart Contracts)**.  
It allows users to prove that a piece of data existed at a specific point in time by storing its cryptographic hash on the blockchain.

Instead of storing the actual data (which is inefficient and insecure), we store a **hash** of the data — ensuring:

- Privacy
- Integrity
- Tamper-proof verification

---

## 🔍 What It Does

1. Users generate a hash (e.g., SHA-256) of any file or data.
2. The hash is submitted to the smart contract.
3. The contract stores:
   - The hash
   - The timestamp of submission
4. Anyone can later verify:
   - Whether the data existed
   - When it was recorded

---

## ✨ Features

- ✅ Store cryptographic proofs (hashes)
- ⏱ Immutable timestamp recording
- 🔍 Public verification of existence
- 🚫 Prevent duplicate proofs
- 🔐 Privacy-preserving (no raw data stored)
- ⚡ Built on Soroban (fast & efficient)

---

## 🛠 Tech Stack

- **Stellar Soroban**
- **Rust (Smart Contract)**
- **Stellar CLI**

---

## 📦 Smart Contract Functions

### `store_proof(hash: BytesN<32>)`
Stores a new proof with the current ledger timestamp.

- Fails if the proof already exists

---

### `verify_proof(hash: BytesN<32>) -> bool`
Checks whether a proof exists on-chain.

---

### `get_timestamp(hash: BytesN<32>) -> u64`
Returns the timestamp when the proof was stored.

- Fails if proof does not exist

---

## 🔗 Deployed Smart Contract

👉 https://stellar.expert/explorer/testnet/contract/CB44YWEAMXJBNCMUSQKTLZDMHETIT7EPAR2WGE2T36DU5FN5MCKIH7D3

---

## 🧪 Example Use Case

- Legal document verification  
- Academic certificate validation  
- Intellectual property protection  
- File authenticity checks  

---

## 📌 How to Use

1. Hash your file:
   ```bash
   sha256sum myfile.pdf
