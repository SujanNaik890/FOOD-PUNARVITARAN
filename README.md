# FoodBridge (Bengaluru)
> **Rescue Food. Restore Hope.**

An AI-assisted food donation and distribution platform connecting food donors (households, restaurants, hotels, marriage halls, event organizers) to verified NGOs in Bengaluru, Karnataka, India.

---

## Technical Stack

- **Frontend:** React.js, Vite, Tailwind CSS v4, Lucide React, Three.js, React Three Fiber, Framer Motion, GSAP.
- **Backend:** Node.js, Express.js, MongoDB Atlas (Mongoose), Argon2id, Zod, REST APIs.
- **AI Engine:** Google Gemini API (`gemini-1.5-flash`) with strictly sandboxed, deterministic tool calling.
- **Security:** OWASP Top 10 baseline, HttpOnly `SameSite=Strict` `Secure` session cookies, dual pickup/delivery OTP verification, strict state machine preventing double-allocations.

---

## Monorepo Architecture

```text
FoodBridge/
├── client/              # React + Vite + Three.js Frontend
├── server/              # Node.js + Express.js API + 18 Mongoose Models
├── shared/              # Isomorphic Zod Schemas (@foodbridge/shared)
└── docs/                # Comprehensive architectural and API documentation
```

---

## Core Workflows Verified by Automated Tests

1. **Deterministic Matching Engine:** Scores NGOs based on dietary restrictions (veg/non-veg), headcount capacity, distance decay across Bengaluru urban geography, remaining shelf-life vs transit time, and historical 90-day reliability.
2. **Strict State Machine:** Guarantees atomic, valid lifecycle transitions (`DRAFT` $\rightarrow$ `SUBMITTED` $\rightarrow$ `VALIDATED` $\rightarrow$ `MATCHING` $\rightarrow$ `ALLOCATED_PENDING_APPROVAL` $\rightarrow$ `NGO_NOTIFIED` $\rightarrow$ `NGO_ACCEPTED` $\rightarrow$ `VEHICLE_ASSIGNED` $\rightarrow$ `FOOD_COLLECTED` $\rightarrow$ `IN_TRANSIT` $\rightarrow$ `DELIVERED_CONFIRMED` $\rightarrow$ `CLOSED`).
3. **Dual OTP Handover:** Pickup OTP verified with driver at the donor kitchen; Delivery OTP verified upon receipt at the NGO facility before closing the record.
4. **Restricted AI Operations Assistant:** Gemini-assisted operational queries (`rankNGOs`, `getDonationDetails`, `getAvailableVehicles`, `generateOperationsReport`) with read-only sandbox isolation and human-in-the-loop requirement for state-changing operations.

---

## Automated Test Suite

To run all automated integration and unit tests:

```bash
npm run test:server
```

Current test status: **22 / 22 Tests Passing** across 6 test suites:
- `auth.test.js` (Argon2id hashing, HttpOnly cookie issuance, role protection)
- `matchingEngine.test.js` (Deterministic mathematical algorithm validation)
- `stateMachine.test.js` (Transition matrix integrity and invalid jump rejection)
- `e2eDonationLifecycle.test.js` (Full multi-role donor-to-NGO delivery lifecycle)
- `aiAssistant.test.js` (Restricted tool execution and role authorization)
- `health.test.js` (API gateway readiness check)

---

## Running the Application Locally

1. **Install dependencies:**
   ```bash
   npm install
   cd client && npm install
   ```

2. **Configure environment:**
   Copy `server/.env.example` to `server/.env` and supply any optional integration keys.

3. **Start Development Services:**
   - Server: `npm --workspace=server run dev` (starts on `http://localhost:5000`)
   - Client: `npm --workspace=client run dev` (starts on `http://localhost:5173`)
