# SunPay Solar Payments (Blockchain + IoT)

A blockchain-powered platform enabling micro-payments for solar energy access using Stellar Soroban smart contracts and IoT integration. Users can pay small amounts to unlock electricity in real time, making it ideal for rural and off-grid communities.

---

## Features

- Blockchain-based secure micro-payments using smart contracts  
- Real-time energy access controlled via IoT devices  
- Pay-as-you-go model with no upfront cost  
- Transparent tracking of payments and usage  
- Simple and accessible UI for non-technical users  

---

## How It Works

1. User connects their wallet  
2. User sends payment (XLM)  
3. Smart contract verifies the transaction  
4. IoT device reads contract state  
5. Device unlocks electricity for a fixed duration  

---

## Tech Stack

### Blockchain
- Stellar Soroban  
- Rust  

### Frontend
- Next.js  
- React  
- Tailwind CSS  

### IoT (Optional / Planned)
- ESP32 or Raspberry Pi  
- Smart relay module  

---

## Project Structure

/contracts        # Rust smart contracts (Soroban)  
/frontend         # Next.js web application  
/iot              # IoT device integration logic  

---

## Installation and Setup

### 1. Clone the repository
```bash
git clone https://github.com/your-username/payg-solar.git
cd payg-solar
