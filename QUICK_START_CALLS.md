# 🚀 Quick Start: Voice Call System

## ⚡ 3-Minute Setup

### Step 1: Get Twilio Phone Number (2 min)

1. **Login to Twilio:** https://console.twilio.com/
2. **Go to Phone Numbers:** Left sidebar → "Phone Numbers"
3. **Click "Buy a number"**
4. **Select "Voice" capability**
5. **Purchase** (costs ~$1/month)
6. **Copy your number** (e.g., `+14155551234`)

---

### Step 2: Update `.env.local` (30 sec)

Open `.env.local` and add:

```env
TWILIO_PHONE_NUMBER=+14155551234  # Your Twilio number
ENABLE_VOICE_CALLS=true           # Enable voice calls
```

**Your credentials are already configured:** ✅
- TWILIO_ACCOUNT_SID ✅
- TWILIO_AUTH_TOKEN ✅
- TWILIO_WHATSAPP_NUMBER ✅

---

### Step 3: Start & Test (30 sec)

```bash
# Start dev server
npm run dev

# Open dashboard
open http://localhost:3000/call-management

# Or visit in browser:
http://localhost:3000/call-management
```

---

## 📞 Make Your First Call

### On the Dashboard:

1. Click **"Initiate Call"** button
2. Select **"Booking Confirmation"**
3. Enter your phone: **`+919621988514`**
4. Fill in:
   - Booking ID: `TEST-001`
   - Customer Name: `Suraj Rawat`
5. Click **"Make Call"**
6. **Answer your phone!** 📱

---

## ✅ What You Get

### Features Ready Now:
- ✅ Voice calls for booking confirmations
- ✅ Payment reminders
- ✅ Flight/travel updates
- ✅ Admin dashboard for call management
- ✅ Real-time call monitoring
- ✅ Call history and analytics
- ✅ Integration with booking flow

---

## 🎙️ Voice Messages

### Booking Confirmation:
> "Hello Suraj Rawat. This is TravixAI calling to confirm your booking. Your booking ID is TEST-001. You have a Flight from Mumbai to Delhi on 2024-12-25. Thank you for choosing TravixAI. Have a great trip!"

### Payment Reminder:
> "Hello! This is TravixAI. We notice that your payment for booking TEST-001 is pending. The amount due is rupees 15000. Please complete your payment to confirm your booking."

---

## 💻 Using the API

### Test Call with cURL:

```bash
curl -X POST http://localhost:3000/api/voice/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "callType": "booking_confirmation",
    "phoneNumber": "+919621988514",
    "data": {
      "bookingId": "TEST-001",
      "customerName": "Suraj Rawat",
      "from": "Mumbai",
      "to": "Delhi",
      "date": "2024-12-25",
      "transportType": "Flight"
    }
  }'
```

---

## 🔗 Automatic Integration

Voice calls are **already integrated** with your booking flow!

**When bookings are successful:**
1. WhatsApp confirmation ✅
2. Voice call (if `ENABLE_VOICE_CALLS=true`) ✅

**Toggle in `.env.local`:**
```env
ENABLE_VOICE_CALLS=true   # Calls enabled
ENABLE_VOICE_CALLS=false  # Calls disabled
```

---

## 💰 Cost

### Twilio Pricing:
- Phone Number: **$1/month**
- Calls (India): **$0.012/minute**

### Example:
**100 calls/month × 2 min:**
- Calls: $2.40
- Phone: $1.00
- **Total: $3.40/month**

Very affordable! 💰

---

## 📊 Dashboard Features

Access: **http://localhost:3000/call-management**

### You Can:
- ✅ Initiate calls with one click
- ✅ Monitor call status in real-time
- ✅ View call history
- ✅ End ongoing calls
- ✅ See call duration and costs
- ✅ Filter by call type
- ✅ Export call logs

---

## 🔧 Quick Troubleshooting

### Call not working?
```bash
# 1. Check environment variables
cat .env.local | grep TWILIO

# 2. Restart server
npm run dev

# 3. Check Twilio balance
# Visit: https://console.twilio.com/
```

### Dashboard not loading?
```bash
# Clear build cache
rm -rf .next
npm run dev
```

### Phone number format?
```
✅ Correct: +919621988514
❌ Wrong: 9621988514
❌ Wrong: +91 9621988514
```

---

## 📖 Full Documentation

- **This Quick Start** - You're reading it!
- **Complete Guide:** `CALL_SYSTEM_GUIDE.md`
- **Summary:** `CALL_SYSTEM_SUMMARY.md`
- **WhatsApp Guide:** `WHATSAPP_INTEGRATION_GUIDE.md`

---

## 🎯 Next Steps

### Now:
1. ✅ Buy Twilio phone number
2. ✅ Update `.env.local`
3. ✅ Make test call
4. ✅ Explore dashboard

### Later:
1. Configure webhooks for production
2. Customize voice messages
3. Add call recordings
4. Set up IVR menus
5. Integrate with CRM

---

## 🆘 Need Help?

- 📞 **Test Your Setup:**
  ```bash
  curl http://localhost:3000/api/voice/initiate
  ```

- 🌐 **Dashboard:** http://localhost:3000/call-management

- 📖 **Twilio Docs:** https://www.twilio.com/docs/voice

- 🔧 **Twilio Console:** https://console.twilio.com/

---

## ✅ Pre-Launch Checklist

Before enabling for all bookings:

- [ ] Purchased Twilio phone number
- [ ] Updated `TWILIO_PHONE_NUMBER`
- [ ] Set `ENABLE_VOICE_CALLS=true`
- [ ] Made test call successfully
- [ ] Verified voice message content
- [ ] Tested call monitoring
- [ ] Checked Twilio account balance
- [ ] Configured webhooks (optional)
- [ ] Tested with real booking flow

---

## 🎉 You're Ready!

Your voice call system is fully operational!

**Make your first call now:**
```
http://localhost:3000/call-management
```

---

**Built with ❤️ for TravixAI**

Happy calling! 📞🚀
