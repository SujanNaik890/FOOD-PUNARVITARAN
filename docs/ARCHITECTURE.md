# FoodBridge Technical Architecture & Integration Manual

## 1. System Topology & Regional Scope
- **Initial Region:** Bengaluru, Karnataka, India (BBMP urban bounds).
- **Domain:** AI-Assisted Surplus Food Logistics connecting commercial/residential donors with verified community shelters.
- **Monorepo Architecture:**
  - `client/`: React 19 + Vite + Tailwind CSS v4 + React Three Fiber 3D Canvas + GSAP/Framer Motion.
  - `server/`: Node.js Express REST API + Mongoose ODM (18 models) + Argon2id + Gemini Assistant.
  - `shared/`: Shared isomorphic Zod schemas (`@foodbridge/shared`).

---

## 2. Completed Modules & Implementation Verification

### 2.1 Multi-Role Dedicated Portals (Frontend)
1. **Donor Impact Dashboard** (`client/src/features/donor/DonorPortal.jsx`):
   - Multi-step food donation form (Category/Dietary $\rightarrow$ Shelf-life & Cloudinary image dropzone $\rightarrow$ Pickup contact & handling notes).
   - Real-time 6-stage lifecycle stepper: `SUBMITTED` $\rightarrow$ `VALIDATED` $\rightarrow$ `MATCHING` $\rightarrow$ `NGO_ACCEPTED` $\rightarrow$ `IN_TRANSIT` $\rightarrow$ `CLOSED`.
   - Impact scorecard tracking meals rescued, CO₂ offset (kg), completed handouts, and Bengaluru leaderboard tier.
   - Razorpay monetary donation modal with Section 80G Indian Income Tax PAN receipt capture.

2. **NGO Community Operations Desk** (`client/src/features/ngo/NGOPortal.jsx`):
   - Live incoming allocation request cards with dynamic 15-minute countdown locks.
   - 1-click **Accept** and structured **Decline** modal with reason logging (e.g., storage capacity full, dietary mismatch).
   - Beneficiary headcount and dietary storage capacity manager updating algorithm matching quotas.
   - Proof-of-delivery handover modal requiring 6-digit dropoff OTP and signed receipt photo.

3. **Admin Central Command Console** (`client/src/features/admin/AdminPortal.jsx`):
   - **Deterministic Allocation Desk:** Visual breakdown of mathematical weights:
     - $w_1 = 30\%$ (Dietary alignment)
     - $w_2 = 25\%$ (Capacity ratio)
     - $w_3 = 20\%$ (Distance decay across Bengaluru)
     - $w_4 = 15\%$ (Shelf-life urgency)
     - $w_5 = 10\%$ (90-day NGO reliability score)
   - **Fleet Dispatch Manager:** Fleet vehicle cards with driver contacts, cargo payload capacities, and cold-chain status.
   - **Interactive Bengaluru Map Simulation:** Visualizing pickup-to-drop transit corridors with OSRM/Google route matrices.
   - **Restricted AI Copilot Drawer:** Sandboxed Gemini operations assistant with tool previews and human-in-the-loop action approval cards.

---

### 2.2 Complete 18 Mongoose Database Schemas
All 18 schemas are defined with 2dsphere geo-indexing, compound indexes, and TTL expirations:
1. `User` (Argon2id hashing, role-based guards)
2. `DonorProfile` (2dsphere geospatial coordinates, donor tiers)
3. `NGOProfile` (2dsphere geo-index, Darpan verification status)
4. `NGOStaff` (Staff contact and role hierarchy)
5. `BeneficiaryRecord` (Aggregate privacy-preserving headcounts & dietary needs)
6. `Donation` (State machine status, portions estimation, perishable flags)
7. `DonationImage` (Cloudinary public ID & perceptual SHA-256 hash)
8. `DonationAllocation` (Deterministic score records & admin approval logs)
9. `NGORequest` (15-minute response deadline locks & decline reasons)
10. `Vehicle` (2dsphere location, cargo payload, refrigeration support)
11. `VehicleBooking` (Dispatch tracking & ETA estimates)
12. `Delivery` (Dual pickup/dropoff OTP hashes & proof images)
13. `Payment` (Razorpay order ID, payment signature, 80G PAN)
14. `Notification` (In-app notifications with 30-day MongoDB TTL)
15. `EmailVerification` (Token hash with TTL index)
16. `OTPVerification` (HMAC-SHA256 hashed OTPs with 5-minute TTL)
17. `PasswordReset` (Token hash with 15-minute TTL)
18. `AuditLog` (Actor, action, prior state, new state, IP address)

---

### 2.3 Third-Party Integrations Service Layer
- **Cloudinary Service** (`server/src/integrations/cloudinaryService.js`):
  - Direct browser upload signature generation (`/api/v1/integrations/cloudinary/signature`).
  - Perceptual image hashing to detect and block duplicate food photos across listings.
- **Razorpay Payment Gateway** (`server/src/services/paymentService.js`):
  - Order creation in paise (`/api/v1/payments/create-order`).
  - Cryptographic HMAC-SHA256 signature verification (`/api/v1/payments/verify`).
- **Resend & SMS Handover Dispatch** (`server/src/integrations/notificationService.js`):
  - Transactional email delivery via Resend API with local dev fallback.
  - SMS OTP transmission with logging for pickup and delivery handovers.
- **Routing & Route Matrix** (`server/src/integrations/routeService.js`):
  - Road distance factor calculation (~1.25x Haversine direct) and Bengaluru urban speed modeling.

---

## 3. Automated Test Verification
- All test suites passing with zero errors:
  - `npm --workspace=server test`: **24 / 24 Tests Passing** across 7 test suites.
  - `cd client && npm run build`: **Vite production compilation successful** (`dist/` generated with zero errors).
