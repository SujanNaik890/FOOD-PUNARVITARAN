# FOOD-PUNARVITARAN
AI-Powered Surplus Food Rescue & Community Distribution Platform (Bengaluru, Karnataka, India).

## 🌟 Overview
**FOOD PUNARVITARAN** bridges surplus nutritious food from commercial kitchens, hotels, banquets, and restaurants directly to local verified shelters, community meal programs, and NGOs.

## 🚀 Key Features
- **Donor Impact Portal**: Register surplus batches, calculate CO2 and water offsets, donate to the 80G tax charity pool, and pick specific candidate NGOs.
- **NGO Operations Desk**: Direct coordination with local kitchens, persistent beneficiary headcount & capacity tracking, 1-click allocation acceptances, and instant charity rescue truck dispatch.
- **Admin Command Portal**: Real-time fleet tracking, dynamic route navigation, comprehensive ledger for charity pool subsidies, and AI Operations Copilot powered by **Groq / Gemini**.
- **Charity Fleet Dispatch**: On-demand dispatch of refrigerated trucks, cargo vans, and volunteer carriers with dual OTP delivery handover verification.

## 🛠️ Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Canvas & Ken-Burns Animated Impact Showcase.
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, Zod.
- **AI Copilot**: Groq SDK (`qwen3.8-27b`) & Google Generative AI (`gemini-1.5-flash`).
- **Geo-Routing**: Haversine matching algorithms and Bengaluru routing matrix.

## 💻 Local Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/SujanNaik890/FOOD-PUNARVITARAN.git
   cd FOOD-PUNARVITARAN
   ```
2. Install server dependencies:
   ```bash
   cd server
   npm install
   ```
3. Install client dependencies:
   ```bash
   cd ../client
   npm install
   ```
4. Configure `.env` in `server/.env`:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/foodbridge
   JWT_ACCESS_SECRET=your_jwt_access_secret
   JWT_REFRESH_SECRET=your_jwt_refresh_secret
   GROQ_API_KEY=your_groq_api_key
   GEMINI_API_KEY=your_gemini_api_key
   ```
5. Run server:
   ```bash
   cd server && node src/server.js
   ```
6. Run client:
   ```bash
   cd client && npm run dev
   ```
