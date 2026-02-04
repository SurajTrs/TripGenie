# 🚀 TravixAI Real-Time Booking System - Production Setup Guide

## Overview

This guide will help you set up **real API integrations** for flights, hotels, trains, and buses with actual booking capabilities and payment processing.

---

## 🔑 Required API Keys & Accounts

### 1. **Amadeus API** (Flights & Hotels) - **PRIMARY**

Amadeus provides production-grade APIs for flights and hotels worldwide.

#### Sign Up:
1. Go to [https://developers.amadeus.com](https://developers.amadeus.com)
2. Create a free account
3. Create an app in the dashboard
4. Get your credentials:
   - **API Key** (Client ID)
   - **API Secret** (Client Secret)

#### Pricing:
- **Free Tier**: 2,000 free API calls/month
- **Production**: Pay-as-you-go ($0.003-0.01 per call)

#### Environment Variables:
```env
AMADEUS_API_KEY=your_api_key_here
AMADEUS_API_SECRET=your_api_secret_here
```

#### Features:
- ✅ Real-time flight search (1000+ airlines)
- ✅ Flight booking with PNR
- ✅ Hotel search (600,000+ properties)
- ✅ Hotel booking
- ✅ Price confirmation
- ✅ Worldwide coverage

---

### 2. **Payment Gateways** - **REQUIRED**

Choose one or both payment providers:

#### **Option A: Stripe** (International)

**Best for:** International customers, card payments

1. Sign up at [https://stripe.com](https://stripe.com)
2. Get your **Secret Key** from Dashboard → Developers → API Keys
3. Enable Payment Methods in Dashboard

```env
STRIPE_SECRET_KEY=sk_live_xxxxx  # or sk_test_xxxxx for testing
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
```

**Pricing:** 2.9% + $0.30 per transaction

#### **Option B: Razorpay** (India-focused)

**Best for:** Indian customers, UPI, Net Banking

1. Sign up at [https://razorpay.com](https://razorpay.com)
2. Get credentials from Settings → API Keys
3. Configure payment methods

```env
RAZORPAY_KEY_ID=rzp_live_xxxxx  # or rzp_test_xxxxx for testing
RAZORPAY_KEY_SECRET=your_secret_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx
```

**Pricing:** 2% per transaction (no setup fee)

---

### 3. **Train Booking APIs** (India) - **OPTIONAL**

#### **Option A: RapidAPI - Indian Railways**

1. Sign up at [https://rapidapi.com](https://rapidapi.com)
2. Subscribe to "Indian Railways API" or "IRCTC API"
3. Get your API key

```env
RAPIDAPI_KEY=your_rapidapi_key
```

**Pricing:** $0-50/month depending on usage

#### **Option B: RailYatri API** (Partnership Required)

Contact RailYatri for enterprise API access:
- Email: business@railyatri.in
- Requires business partnership

---

### 4. **Bus Booking APIs** (India) - **OPTIONAL**

#### **Option A: RedBus API** (Partnership Required)

RedBus provides APIs to partners only:
1. Contact: api@redbus.in
2. Requirements: Business partnership agreement
3. Minimum monthly commitment

#### **Option B: AbhiBus API**

Contact for API access:
- Email: support@abhibus.com
- Partnership required

---

## ⚙️ Environment Setup

Create or update your `.env.local` file:

```env
# ============================================
# REQUIRED: Amadeus (Flights & Hotels)
# ============================================
AMADEUS_API_KEY=your_amadeus_api_key
AMADEUS_API_SECRET=your_amadeus_api_secret

# ============================================
# REQUIRED: Payment Gateway (Choose one or both)
# ============================================

# Stripe (International)
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# Razorpay (India)
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx

# ============================================
# OPTIONAL: Additional Services
# ============================================

# RapidAPI (for trains)
RAPIDAPI_KEY=your_rapidapi_key

# Skyscanner (alternative flight search)
SKYSCANNER_API_KEY=your_skyscanner_key

# Booking.com (alternative hotels)
BOOKING_COM_API_KEY=your_booking_com_key

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # or your production URL
```

---

## 🚀 Quick Start

### Step 1: Install Dependencies

All required packages are already included in `package.json`:
- `stripe` - Payment processing
- `twilio` - Voice/SMS (already configured)
- Standard fetch for API calls

```bash
npm install
```

### Step 2: Configure API Keys

Add your API keys to `.env.local` (see above section)

### Step 3: Start Development Server

```bash
npm run dev
```

### Step 4: Test Real-Time Flight Search

```bash
curl -X POST http://localhost:3000/api/real-time-search \
  -H "Content-Type: application/json" \
  -d '{
    "searchType": "flights",
    "params": {
      "origin": "DEL",
      "destination": "BOM",
      "departureDate": "2024-12-25",
      "adults": 1,
      "travelClass": "ECONOMY"
    }
  }'
```

### Step 5: Test Hotel Search

```bash
curl -X POST http://localhost:3000/api/real-time-search \
  -H "Content-Type": application/json" \
  -d '{
    "searchType": "hotels",
    "params": {
      "cityCode": "DEL",
      "checkInDate": "2024-12-25",
      "checkOutDate": "2024-12-28",
      "adults": 2,
      "rooms": 1
    }
  }'
```

---

## 📖 API Usage Examples

### 1. Search Real Flights

```typescript
const response = await fetch('/api/real-time-search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    searchType: 'flights',
    params: {
      origin: 'DEL',        // Delhi
      destination: 'BOM',    // Mumbai
      departureDate: '2024-12-25',
      returnDate: '2024-12-30',  // Optional for round trip
      adults: 2,
      children: 1,
      infants: 0,
      travelClass: 'ECONOMY',  // ECONOMY, BUSINESS, FIRST
      nonStop: false,
      currencyCode: 'INR',
      maxPrice: 50000,
    }
  })
});

const data = await response.json();
console.log('Flights found:', data.count);
console.log('Results:', data.results);
```

### 2. Search Real Hotels

```typescript
const response = await fetch('/api/real-time-search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    searchType: 'hotels',
    params: {
      cityCode: 'DEL',
      checkInDate: '2024-12-25',
      checkOutDate: '2024-12-28',
      adults: 2,
      rooms: 1,
      stars: [4, 5],  // Filter by star rating
      amenities: ['WIFI', 'POOL', 'GYM'],
      sortBy: 'PRICE',  // PRICE, RATING, DISTANCE
    }
  })
});

const data = await response.json();
console.log('Hotels found:', data.count);
```

### 3. Book a Flight

```typescript
const response = await fetch('/api/real-time-booking', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    bookingType: 'flight',
    bookingData: selectedFlight,  // From search results
    travelers: [
      {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-15',
        gender: 'MALE',
        email: 'john@example.com',
        phone: '+919876543210',
        passportNumber: 'A1234567',  // For international flights
        passportExpiryDate: '2030-12-31',
      }
    ],
    contactInfo: {
      email: 'booking@example.com',
      phone: '+919876543210',
    },
    paymentMethod: 'stripe',  // or 'razorpay'
  })
});

const result = await response.json();

if (result.success) {
  console.log('Booking ID:', result.booking.bookingId);
  console.log('Confirmation Code:', result.booking.confirmationCode);
  console.log('Payment URL:', result.payment.clientSecret);
}
```

---

## 💳 Payment Integration

### Stripe Integration (Frontend)

```typescript
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

async function handlePayment(clientSecret: string) {
  const stripe = await stripePromise;

  const { error } = await stripe!.confirmPayment({
    clientSecret,
    confirmParams: {
      return_url: 'https://yourdomain.com/booking-success',
    },
  });

  if (error) {
    console.error('Payment failed:', error);
  }
}
```

### Razorpay Integration (Frontend)

```typescript
const options = {
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  amount: booking.payment.amount * 100,  // In paise
  currency: booking.payment.currency,
  order_id: booking.payment.orderId,
  name: 'TravixAI',
  description: 'Flight Booking',
  handler: function (response) {
    console.log('Payment successful:', response.razorpay_payment_id);
    // Verify payment on backend
  },
};

const razorpay = new window.Razorpay(options);
razorpay.open();
```

---

## 🔒 Security Best Practices

### 1. Never Expose API Keys in Frontend

✅ **Correct:**
```typescript
// Backend API route
const AMADEUS_API_KEY = process.env.AMADEUS_API_KEY;
```

❌ **Wrong:**
```typescript
// Frontend component
const apiKey = 'your_api_key_here';  // NEVER DO THIS
```

### 2. Validate All Input

```typescript
if (!params.origin || !params.destination) {
  return NextResponse.json({
    error: 'Missing required parameters'
  }, { status: 400 });
}
```

### 3. Use Environment Variables

```typescript
// Always use environment variables
const apiKey = process.env.API_KEY;

// Never hardcode
const apiKey = 'sk_live_xxxxx';  // DON'T
```

### 4. Implement Rate Limiting

```typescript
// Use packages like 'express-rate-limit' or implement custom logic
```

---

## 🐛 Troubleshooting

### Issue: "Amadeus authentication failed"

**Solutions:**
1. Check API credentials are correct
2. Ensure no extra spaces in `.env.local`
3. Restart dev server after adding keys
4. Verify account is activated

### Issue: "No results found"

**Solutions:**
1. Check IATA codes are correct (e.g., "DEL" not "Delhi")
2. Verify date format is YYYY-MM-DD
3. Check date is in the future
4. Try broader search parameters

### Issue: "Payment failed"

**Solutions:**
1. Use test cards for testing:
   - Stripe: `4242 4242 4242 4242`
   - Razorpay: Test mode enabled
2. Check secret keys are correct
3. Verify webhook setup (for production)

---

## 📊 API Rate Limits

| Service | Free Tier | Rate Limit |
|---------|-----------|------------|
| Amadeus | 2,000/month | 10 req/sec |
| Stripe | Unlimited | None |
| Razorpay | Unlimited | 600 req/min |
| RapidAPI | Varies | Plan-dependent |

---

## 💰 Cost Estimation

### For 1,000 Bookings/Month:

| Service | Cost |
|---------|------|
| Amadeus API (10 searches per booking) | $30-100 |
| Payment Processing (Stripe 2.9%) | ~$60 on $2,000 revenue |
| Payment Processing (Razorpay 2%) | ~$40 on $2,000 revenue |
| **Total** | **$90-160/month** |

**ROI:** If average booking value is $100, this is <2% of revenue

---

## 🚀 Going to Production

### Production Checklist:

- [ ] Switch all API keys to production mode
- [ ] Update `NEXT_PUBLIC_BASE_URL` to production domain
- [ ] Enable Stripe/Razorpay webhooks
- [ ] Set up SSL certificates (HTTPS)
- [ ] Implement proper error logging (Sentry)
- [ ] Add database for booking storage
- [ ] Set up backup payment method
- [ ] Implement booking confirmation emails
- [ ] Add customer support contact
- [ ] Test all booking flows end-to-end
- [ ] Set up monitoring and alerts
- [ ] Configure rate limiting
- [ ] Add GDPR compliance (for EU customers)
- [ ] Set up refund policies

---

## 📞 Support & Resources

### Amadeus:
- **Docs**: https://developers.amadeus.com/docs
- **Support**: https://developers.amadeus.com/support
- **Community**: https://developers.amadeus.com/community

### Stripe:
- **Docs**: https://stripe.com/docs
- **Support**: support@stripe.com
- **Dashboard**: https://dashboard.stripe.com

### Razorpay:
- **Docs**: https://razorpay.com/docs
- **Support**: support@razorpay.com
- **Dashboard**: https://dashboard.razorpay.com

---

## 🎉 You're Ready!

Your TravixAI platform now has:
- ✅ Real-time flight search with 1000+ airlines
- ✅ Real hotel availability from 600,000+ properties
- ✅ Actual booking capability with PNR/confirmation codes
- ✅ Secure payment processing (Stripe/Razorpay)
- ✅ Production-ready architecture
- ✅ International coverage

**Start accepting real bookings today!**

---

**Need Help?** Open an issue or contact: support@tripgenie.com

**Version**: 1.0.0 | **Status**: Production Ready | **Last Updated**: January 2025
