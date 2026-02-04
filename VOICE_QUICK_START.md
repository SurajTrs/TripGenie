# 🚀 TravixAI Voice System - Quick Start Guide

Get your AI-powered voice booking system up and running in 5 minutes!

## ⚡ Quick Setup (5 Steps)

### Step 1: Get Twilio Credentials (2 min)

1. Sign up at [twilio.com](https://www.twilio.com/try-twilio)
2. Verify your email and phone number
3. Get your credentials from the console:
   - Account SID (starts with `AC...`)
   - Auth Token (32-character string)
4. Buy a phone number with voice capabilities ($1/month)

### Step 2: Configure Environment (1 min)

Create or update `.env.local`:

```env
# Required
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_32_character_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Optional
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Step 3: Install Dependencies (1 min)

```bash
npm install
# Dependencies already included: twilio, openai, etc.
```

### Step 4: Start Development Server (30 sec)

```bash
npm run dev
```

Server starts at http://localhost:3000

### Step 5: Test Your First Call (30 sec)

```bash
curl -X POST http://localhost:3000/api/voice/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "callType": "booking_confirmation",
    "phoneNumber": "+919876543210",
    "data": {
      "bookingId": "BK-12345",
      "customerName": "John Doe",
      "from": "Mumbai",
      "to": "Delhi",
      "date": "2024-12-25",
      "transportType": "Flight"
    }
  }'
```

✅ **Done!** You should receive a call within seconds.

---

## 📞 Test Different Call Types

### 1. Booking Confirmation

```bash
curl -X POST http://localhost:3000/api/voice/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "callType": "booking_confirmation",
    "phoneNumber": "+YOUR_PHONE_NUMBER",
    "data": {
      "bookingId": "BK-12345",
      "customerName": "Priya Sharma",
      "from": "Mumbai",
      "to": "Delhi",
      "date": "2024-12-25",
      "transportType": "Flight",
      "amount": 15000,
      "confirmationCode": "ABC123"
    }
  }'
```

### 2. Payment Reminder

```bash
curl -X POST http://localhost:3000/api/voice/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "callType": "payment_reminder",
    "phoneNumber": "+YOUR_PHONE_NUMBER",
    "data": {
      "bookingId": "BK-12345",
      "amount": 5000
    }
  }'
```

### 3. Flight Update

```bash
curl -X POST http://localhost:3000/api/voice/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "callType": "flight_update",
    "phoneNumber": "+YOUR_PHONE_NUMBER",
    "data": {
      "bookingId": "BK-12345",
      "message": "Your flight has been delayed by 2 hours. New departure time is 4 PM."
    }
  }'
```

### 4. AI-Powered Interactive Call

```bash
curl -X POST http://localhost:3000/api/voice/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "callType": "ai_assistant",
    "phoneNumber": "+YOUR_PHONE_NUMBER",
    "data": {
      "customerName": "John Doe"
    }
  }'
```

---

## 📊 View Analytics

Check your call statistics:

```bash
# Get summary
curl http://localhost:3000/api/voice/analytics?action=summary

# Get detailed metrics
curl http://localhost:3000/api/voice/analytics?action=metrics

# Get recent calls
curl http://localhost:3000/api/voice/analytics?action=recent&limit=10

# Get performance analysis
curl http://localhost:3000/api/voice/analytics?action=performance
```

---

## 🎯 Integration Examples

### React Component

```tsx
'use client';

import { useState } from 'react';

export function BookingCallButton({ booking }: { booking: any }) {
  const [calling, setCalling] = useState(false);

  const handleCall = async () => {
    setCalling(true);
    try {
      const response = await fetch('/api/voice/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callType: 'booking_confirmation',
          phoneNumber: booking.phoneNumber,
          data: {
            bookingId: booking.id,
            customerName: booking.customerName,
            from: booking.origin,
            to: booking.destination,
            date: booking.date,
            transportType: booking.type
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(`Call initiated! Call ID: ${result.callSid}`);
      } else {
        alert(`Call failed: ${result.error}`);
      }
    } catch (error) {
      alert('Error initiating call');
    } finally {
      setCalling(false);
    }
  };

  return (
    <button
      onClick={handleCall}
      disabled={calling}
      className="btn-primary"
    >
      {calling ? 'Calling...' : '📞 Call Customer'}
    </button>
  );
}
```

### API Route Handler

```typescript
// app/api/bookings/confirm/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { makeBookingConfirmationCall } from '@/lib/voiceCall';

export async function POST(req: NextRequest) {
  const { bookingId } = await req.json();

  // Fetch booking details from database
  const booking = await getBookingById(bookingId);

  // Initiate confirmation call
  const result = await makeBookingConfirmationCall(
    booking.phoneNumber,
    {
      bookingId: booking.id,
      customerName: booking.customerName,
      from: booking.origin,
      to: booking.destination,
      date: booking.travelDate,
      transportType: booking.transportType,
      amount: booking.totalAmount
    }
  );

  return NextResponse.json(result);
}
```

### Webhook Handler (Production)

```typescript
// app/api/voice/status/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const callSid = formData.get('CallSid') as string;
  const callStatus = formData.get('CallStatus') as string;
  const duration = formData.get('CallDuration') as string;

  // Store in database
  await updateCallStatus(callSid, {
    status: callStatus,
    duration: parseInt(duration || '0'),
    completedAt: new Date()
  });

  // Send notifications based on status
  if (callStatus === 'completed') {
    await sendSuccessNotification(callSid);
  } else if (callStatus === 'no-answer') {
    await scheduleRetryCall(callSid);
  }

  return NextResponse.json({ received: true });
}
```

---

## 🔧 Configure Webhooks (Production Only)

For production deployment, configure these webhooks in Twilio Console:

1. **Voice Configuration**
   ```
   Voice URL: https://your-domain.com/api/voice/twiml
   Method: HTTP POST
   Fallback URL: https://your-domain.com/api/voice/fallback
   ```

2. **Status Callbacks**
   ```
   Status Callback URL: https://your-domain.com/api/voice/status
   Events: All (initiated, ringing, answered, completed)
   ```

3. **Recording Callbacks** (if recording enabled)
   ```
   Recording Status Callback: https://your-domain.com/api/voice/recording-status
   ```

---

## 🎨 Customize Voice & Messages

Edit `/lib/voiceCall.ts` to customize:

### Change Voice

```typescript
twiml.say({
  voice: 'Polly.Aditi',  // Options: alice, Polly.Aditi, Polly.Raveena
  language: 'en-IN'       // en-IN, hi-IN, en-US, etc.
}, 'Your message here');
```

### Add Custom Call Type

```typescript
case 'welcome_call':
  twiml.say(
    { voice: 'Polly.Aditi', language: 'en-IN' },
    `Welcome to TravixAI! Thank you for signing up, ${data?.customerName}.`
  );
  break;
```

### Add Menu Options

```typescript
twiml.say('Press 1 for bookings, 2 for support, 3 for feedback');

twiml.gather({
  numDigits: 1,
  action: '/api/voice/handle-input',
  method: 'POST'
});
```

---

## 📱 Test on Your Phone

Replace `+YOUR_PHONE_NUMBER` with your number in E.164 format:
- India: `+919876543210`
- US: `+12125551234`
- UK: `+442071234567`

**Important Notes:**
- Twilio trial accounts can only call verified numbers
- Remove verification after upgrading account
- International calls may incur additional charges

---

## 🐛 Troubleshooting

### Issue: "Service Not Configured"
**Solution**: Check your `.env.local` file has correct Twilio credentials

### Issue: "Invalid Phone Number"
**Solution**: Use E.164 format: `+[country code][number]` (e.g., `+919876543210`)

### Issue: Call Not Connecting
**Solution**:
1. Verify phone number has voice capability in Twilio console
2. Check webhook URLs are publicly accessible (use ngrok for local testing)
3. Review Twilio debugger logs

### Issue: Webhook Not Receiving Updates
**Solution**:
1. Ensure `NEXT_PUBLIC_BASE_URL` is set correctly
2. Use ngrok for local testing: `ngrok http 3000`
3. Update Twilio webhooks with ngrok URL

---

## 🚀 Production Checklist

Before going live:

- [ ] Upgrade Twilio account (remove trial restrictions)
- [ ] Configure production webhooks with HTTPS
- [ ] Set up call recording storage
- [ ] Implement database for call logs
- [ ] Add error monitoring (Sentry, etc.)
- [ ] Configure rate limiting
- [ ] Set up backup phone numbers
- [ ] Test all call flows end-to-end
- [ ] Document emergency procedures
- [ ] Set up alerts for call failures

---

## 📚 Next Steps

1. **Read Full Documentation**: [VOICE_SYSTEM_DOCUMENTATION.md](./VOICE_SYSTEM_DOCUMENTATION.md)
2. **Explore API Reference**: Test all endpoints in Postman
3. **Customize Call Flows**: Edit TwiML generation in `voiceCall.ts`
4. **Add Database Storage**: Implement call logging with MongoDB/PostgreSQL
5. **Set Up Monitoring**: Use analytics dashboard to track performance

---

## 💡 Pro Tips

1. **Use Queue for High Volume**: Implement call queues for customer support
2. **Cache TwiML**: Cache frequently used responses for better performance
3. **Monitor Costs**: Set up Twilio usage alerts to control spending
4. **A/B Test Messages**: Test different voice scripts to improve engagement
5. **Implement Retry Logic**: Auto-retry failed calls with exponential backoff

---

## 🆘 Need Help?

- **Documentation**: [VOICE_SYSTEM_DOCUMENTATION.md](./VOICE_SYSTEM_DOCUMENTATION.md)
- **Twilio Docs**: https://www.twilio.com/docs/voice
- **GitHub Issues**: Report bugs and feature requests
- **Email Support**: support@tripgenie.com

---

**🎉 You're all set!** Start making professional voice calls with AI.
