# Stripe Payment Implementation Guide

## ✅ สิ่งที่ทำเสร็จแล้ว

### 1. Database Schema
- ✅ เพิ่ม `subscriptions` table ใน `drizzle/schema.ts`
- ✅ รองรับ tier: free, pro
- ✅ รองรับ status: active, cancelled, expired
- ✅ เก็บ Stripe subscription ID และ customer ID

### 2. Backend Implementation
- ✅ สร้าง `server/subscriptionDb.ts` - จัดการ subscription ใน database
- ✅ สร้าง `server/stripeService.ts` - Stripe API integration
- ✅ สร้าง `server/stripeRouter.ts` - tRPC endpoints สำหรับ payment
- ✅ เพิ่ม stripe router ใน `server/routers.ts`

### 3. Frontend Pages
- ✅ สร้าง `/upgrade` - หน้าสำหรับ upgrade to Pro
- ✅ สร้าง `/payment/success` - หน้าหลังชำระเงินสำเร็จ (redirect ไป /pro)
- ✅ สร้าง `/payment/cancel` - หน้าหลังยกเลิกการชำระเงิน
- ✅ สร้าง `/pro` - Pro Dashboard พร้อม features ทั้งหมด

### 4. Routing
- ✅ เพิ่ม routes ใน `client/src/App.tsx`
- ✅ Lazy loading สำหรับทุกหน้า

### 5. Dependencies
- ✅ ติดตั้ง `stripe` package

---

## 🔧 สิ่งที่ต้องทำต่อ

### 1. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ในโปรเจกต์:

\`\`\`bash
# Database Configuration
DATABASE_URL=mysql://user:password@host:port/database

# Manus OAuth Configuration
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
VITE_APP_ID=your_app_id_here

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Frontend URL - **สำคัญมาก!**
# ต้องใช้ dev server URL ไม่ใช่ localhost
VITE_FRONTEND_URL=https://3000-iwsjnahok7sl95ai6fy3u-a5126f8c.manus-asia.computer
\`\`\`

### 2. รัน Database Migration

\`\`\`bash
pnpm drizzle-kit push
\`\`\`

### 3. ตั้งค่า Stripe Webhook (Production)

1. ไปที่ Stripe Dashboard → Developers → Webhooks
2. เพิ่ม endpoint: `https://your-domain.com/api/stripe/webhook`
3. เลือก events:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
4. คัดลอก webhook secret ใส่ใน `.env`

---

## 🎯 Payment Flow ที่ถูกต้อง

### ขั้นตอนการทำงาน:

1. **User ไปที่ `/upgrade`**
   - แสดงราคา และ features ของ Pro
   - กดปุ่ม "เริ่มใช้งาน Pro"

2. **สร้าง Checkout Session**
   - เรียก `stripe.createCheckout` mutation
   - Stripe สร้าง checkout session
   - **success_url**: `{VITE_FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`
   - **cancel_url**: `{VITE_FRONTEND_URL}/payment/cancel`

3. **Redirect ไป Stripe Checkout**
   - User กรอกข้อมูลบัตร
   - ใช้ test card: `4242 4242 4242 4242`

4. **หลังชำระเงินสำเร็จ → Redirect ไป `/payment/success`**
   - PaymentSuccess component เรียก `stripe.completeCheckout` API
   - API สร้าง subscription ใน database
   - แสดง loading state
   - **Auto-redirect ไป `/pro` ใน 5 วินาที** ← นี่คือจุดสำคัญ!

5. **เข้า Pro Dashboard (`/pro`)**
   - ตรวจสอบ subscription status
   - แสดง Pro features:
     - เลขชุด (Number Sets)
     - แนะนำเพื่อน (Referral)
     - กระดานผู้นำ (Leaderboard)

---

## 🔍 การแก้ปัญหา Redirect

### ปัญหาเดิม:
- Redirect ไป `localhost:3000` แทนที่จะเป็น dev server

### วิธีแก้:
1. ✅ ตั้งค่า `VITE_FRONTEND_URL` ให้เป็น dev server URL
2. ✅ `stripeRouter.ts` ใช้ `getFrontendUrl()` ที่อ่านจาก env
3. ✅ PaymentSuccess page redirect ไป `/pro` หลังสร้าง subscription สำเร็จ

### ตรวจสอบ:
\`\`\`bash
# ดู environment variable
echo $VITE_FRONTEND_URL

# ควรได้ dev server URL เช่น:
# https://3000-iwsjnahok7sl95ai6fy3u-a5126f8c.manus-asia.computer
\`\`\`

---

## 🧪 การทดสอบ

### Test Card (Stripe Test Mode)
- **Card Number**: 4242 4242 4242 4242
- **Expiry**: อนาคตใดก็ได้ (เช่น 12/34)
- **CVC**: 3 หลักใดก็ได้ (เช่น 123)
- **ZIP**: ใดก็ได้

### Test Flow:
1. Login ที่ `/`
2. ไปที่ `/upgrade`
3. กด "เริ่มใช้งาน Pro"
4. ชำระเงินด้วย test card
5. ตรวจสอบว่า redirect ไป `/payment/success` (บน dev server)
6. รอ 5 วินาที หรือกดปุ่ม "Go to Pro Dashboard Now"
7. ควรเห็น Pro Dashboard ที่ `/pro`
8. ตรวจสอบว่ามี badge "PRO" และเข้าถึง features ได้

---

## 📋 API Endpoints

### tRPC Endpoints:
- `stripe.createCheckout` - สร้าง Stripe checkout session
- `stripe.completeCheckout` - สร้าง subscription หลังชำระเงินสำเร็จ
- `stripe.getSubscription` - ดู subscription status

### Database Functions:
- `createSubscription()` - สร้าง subscription ใหม่
- `getActiveSubscription()` - ดู active subscription
- `hasActiveProSubscription()` - ตรวจสอบว่าเป็น Pro หรือไม่
- `getUserTier()` - ดู tier ของ user (free/pro)

---

## 🎨 Pro Features

### 1. เลขชุด (Number Sets)
- แสดงเลขชุดที่คัดสรรมา
- มีความแม่นยำ %
- อัปเดตตามข้อมูลย้อนหลัง

### 2. แนะนำเพื่อน (Referral)
- Referral link สำหรับแชร์
- ติดตาม referrals
- รับรางวัล

### 3. กระดานผู้นำ (Leaderboard)
- แสดง ranking
- คะแนนสะสม
- เปรียบเทียบกับ users อื่น

---

## ⚠️ สิ่งที่ต้องระวัง

1. **VITE_FRONTEND_URL ต้องเป็น dev server URL**
   - ไม่ใช่ localhost
   - ต้องมี https://

2. **Database Migration**
   - ต้องรัน `pnpm drizzle-kit push` ก่อนใช้งาน

3. **Stripe Keys**
   - ใช้ test keys ในระหว่างพัฒนา
   - เปลี่ยนเป็น live keys เมื่อ production

4. **Webhook**
   - ใน development อาจไม่ได้ตั้งค่า webhook
   - ใช้ `completeCheckout` API แทน

---

## 📝 Next Steps

1. ตั้งค่า environment variables
2. รัน database migration
3. ทดสอบ payment flow
4. เพิ่ม features ใน Pro Dashboard
5. ตั้งค่า Stripe webhook (production)

---

## 🆘 Troubleshooting

### ปัญหา: Redirect ไป localhost
**วิธีแก้**: ตรวจสอบ `VITE_FRONTEND_URL` ใน `.env`

### ปัญหา: Subscription ไม่ถูกสร้าง
**วิธีแก้**: ตรวจสอบ database connection และ migration

### ปัญหา: ไม่เข้า Pro Dashboard ได้
**วิธีแก้**: ตรวจสอบว่า subscription status เป็น "active" และ tier เป็น "pro"

### ปัญหา: Stripe error
**วิธีแก้**: ตรวจสอบ `STRIPE_SECRET_KEY` ใน `.env`
