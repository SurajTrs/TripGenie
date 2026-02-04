# Voice Call Management System - Complete Guide

## 🎯 Overview

Your TravixAI platform now has a **complete voice call management system** that allows you to:
- ✅ Initiate automated voice calls for booking confirmations
- ✅ Make payment reminder calls
- ✅ Send flight/travel updates via voice
- ✅ Manage and monitor all calls from an admin dashboard
- ✅ Track call status in real-time
- ✅ End ongoing calls remotely

---

## 🚀 Quick Start

### Step 1: Get a Twilio Phone Number

1. **Log in to Twilio Console**: https://console.twilio.com/
2. **Navigate to Phone Numbers**: Click "Phone Numbers" in the left sidebar
3. **Buy a Number**:
   - Click "Buy a number"
   - Select your country (e.g., India, USA)
   - Choose "Voice" capability
   - Purchase the number (costs ~$1-2/month)
4. **Copy your phone number** (e.g., `+14155551234`)

### Step 2: Update Environment Variables

Add your Twilio phone number to `.env.local`:

```env
# Voice Calls (Twilio)
TWILIO_PHONE_NUMBER=+14155551234  # Your purchased Twilio number
ENABLE_VOICE_CALLS=true           # Set to true to enable voice calls
```

### Step 3: Configure Webhooks

1. Go to your Twilio phone number settings
2. Under **Voice & Fax**, set:
   - **A call comes in**: `https://yourdomain.com/api/voice/twiml`
   - **HTTP Method**: POST

For local testing with ngrok:
```bash
ngrok http 3000
# Use: https://your-ngrok-url.ngrok.io/api/voice/twiml
```

### Step 4: Test Your System

1. **Start your dev server**:
   ```bash
   npm run dev
   ```

2. **Access the Call Management Dashboard**:
   ```
   http://localhost:3000/call-management
   ```

3. **Make a test call**:
   - Click "Initiate Call"
   - Select call type
   - Enter phone number (e.g., `+919876543210`)
   - Click "Make Call"

---

## 📁 System Architecture

### Files Created:

1. **[lib/voiceCall.ts](lib/voiceCall.ts)** - Core voice call service
   - `initiateCall()` - Start a voice call
   - `makeBookingConfirmationCall()` - Booking confirmations
   - `makePaymentReminderCall()` - Payment reminders
   - `makeFlightUpdateCall()` - Travel updates
   - `getCallStatus()` - Check call status
   - `endCall()` - Terminate calls
   - `generateTwiML()` - Generate voice scripts

2. **[app/api/voice/twiml/route.ts](app/api/voice/twiml/route.ts)**
   - TwiML response generator
   - Handles different call types
   - Generates voice scripts dynamically

3. **[app/api/voice/status/route.ts](app/api/voice/status/route.ts)**
   - Call status webhook
   - Tracks call lifecycle
   - Logs call events

4. **[app/api/voice/initiate/route.ts](app/api/voice/initiate/route.ts)**
   - Call initiation API
   - Validates phone numbers
   - Routes to appropriate call types

5. **[app/api/voice/manage/route.ts](app/api/voice/manage/route.ts)**
   - Call management API
   - List recent calls
   - End ongoing calls
   - Batch operations

6. **[components/CallManagementDashboard.tsx](components/CallManagementDashboard.tsx)**
   - Admin dashboard UI
   - Call initiation interface
   - Real-time call monitoring
   - Call management controls

7. **[app/call-management/page.tsx](app/call-management/page.tsx)**
   - Dashboard page route

---

## 🎙️ Call Types & Use Cases

### 1. Booking Confirmation
**When to use:** After successful booking
```typescript
await makeBookingConfirmationCall('+919876543210', {
  bookingId: 'TRIP-123456',
  customerName: 'John Doe',
  from: 'Mumbai',
  to: 'Delhi',
  date: '2024-12-25',
  transportType: 'Flight'
});
```

**Customer hears:**
> "Hello John Doe. This is TravixAI calling to confirm your booking. Your booking ID is TRIP-123456. You have a Flight from Mumbai to Delhi on 2024-12-25. Thank you for choosing TravixAI. Have a great trip!"

---

### 2. Payment Reminder
**When to use:** When payment is pending
```typescript
await makePaymentReminderCall('+919876543210', 'TRIP-123456', 15000);
```

**Customer hears:**
> "Hello! This is TravixAI. We notice that your payment for booking TRIP-123456 is pending. The amount due is rupees 15000. Please complete your payment to confirm your booking. Thank you!"

---

### 3. Flight/Travel Update
**When to use:** Flight delays, gate changes, cancellations
```typescript
await makeFlightUpdateCall(
  '+919876543210',
  'TRIP-123456',
  'Your flight has been delayed by 2 hours. New departure time is 3 PM.'
);
```

**Customer hears:**
> "Hello! This is TravixAI with an important update about your booking TRIP-123456. Your flight has been delayed by 2 hours. New departure time is 3 PM. For more information, please check your email or contact our support. Thank you!"

---

### 4. Custom Call
**When to use:** Any custom message
```typescript
await makeCustomCall(
  '+919876543210',
  'We are having a special offer on international flights. Visit our website for details.'
);
```

---

## 💻 API Endpoints

### 1. Initiate Call
```bash
POST /api/voice/initiate
```

**Request Body:**
```json
{
  "callType": "booking_confirmation",
  "phoneNumber": "+919876543210",
  "data": {
    "bookingId": "TRIP-123456",
    "customerName": "John Doe",
    "from": "Mumbai",
    "to": "Delhi",
    "date": "2024-12-25",
    "transportType": "Flight"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Call initiated successfully",
  "callSid": "CA1234567890abcdef",
  "status": "queued"
}
```

---

### 2. List Recent Calls
```bash
GET /api/voice/manage?limit=20
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "calls": [
    {
      "sid": "CA1234567890abcdef",
      "to": "+919876543210",
      "from": "+14155551234",
      "status": "completed",
      "startTime": "2024-12-01T10:00:00Z",
      "endTime": "2024-12-01T10:02:30Z",
      "duration": "150",
      "direction": "outbound-api"
    }
  ]
}
```

---

### 3. Get Call Status
```bash
GET /api/voice/manage?callSid=CA1234567890abcdef
```

**Response:**
```json
{
  "success": true,
  "call": {
    "sid": "CA1234567890abcdef",
    "status": "completed",
    "duration": "150",
    "price": "-0.0200",
    "priceUnit": "USD"
  }
}
```

---

### 4. End Call
```bash
DELETE /api/voice/manage
```

**Request Body:**
```json
{
  "callSid": "CA1234567890abcdef"
}
```

---

## 🎨 Admin Dashboard Features

### Access Dashboard
```
http://localhost:3000/call-management
```

### Features:
1. **Initiate Calls**
   - Select call type
   - Enter phone number
   - Fill in required details
   - Click "Make Call"

2. **Monitor Calls**
   - View recent calls
   - Check call status
   - See duration and timestamps
   - Filter by status

3. **Manage Active Calls**
   - End ongoing calls
   - View call progress
   - Real-time status updates

4. **Call History**
   - View all past calls
   - Export call logs
   - Analyze call metrics

---

## 🔧 Integration with Booking Flow

### Automatic Booking Confirmation Calls

The system is already integrated with your booking flow. When a booking is successful:

1. **WhatsApp message** is sent (immediate)
2. **Voice call** is initiated (if enabled)

**Enable/Disable in `.env.local`:**
```env
ENABLE_VOICE_CALLS=true   # Enable voice calls
ENABLE_VOICE_CALLS=false  # Disable voice calls (WhatsApp only)
```

**Code Location:** [app/api/book-trip/route.ts:337-359](app/api/book-trip/route.ts#L337-L359)

---

## 📊 Call Status Workflow

```
initiated → ringing → in-progress → completed
                    ↓
                  busy / no-answer / failed
```

### Status Meanings:
- **queued**: Call is queued to be sent
- **initiated**: Call has been initiated
- **ringing**: Phone is ringing
- **in-progress**: Call is ongoing (customer answered)
- **completed**: Call finished successfully
- **busy**: Customer's line was busy
- **no-answer**: Customer didn't answer
- **failed**: Call failed (network/technical issue)
- **canceled**: Call was canceled

---

## 💰 Pricing

### Twilio Voice Pricing (as of 2024):

| Country | Outbound Call | Phone Number |
|---------|--------------|--------------|
| India | $0.012/min | $1/month |
| USA | $0.013/min | $1/month |

### Example Costs:

**1000 bookings/month with 2-minute confirmation calls:**
- Calls: 1000 × 2 min × $0.012 = $24/month
- Phone number: $1/month
- **Total: ~$25/month**

**500 bookings/month:**
- Calls: 500 × 2 min × $0.012 = $12/month
- Phone number: $1/month
- **Total: ~$13/month**

---

## 🧪 Testing

### Test with cURL:

```bash
# Test call initiation
curl -X POST http://localhost:3000/api/voice/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "callType": "booking_confirmation",
    "phoneNumber": "+919876543210",
    "data": {
      "bookingId": "TEST-123",
      "customerName": "Test User",
      "from": "Mumbai",
      "to": "Delhi",
      "date": "2024-12-25",
      "transportType": "Flight"
    }
  }'
```

### Test TwiML Generation:

```bash
# Visit in browser:
http://localhost:3000/api/voice/twiml?type=booking_confirmation&bookingId=TEST-123&customerName=John
```

---

## 🎯 Best Practices

### 1. **Phone Number Format**
Always use E.164 format:
- ✅ `+919876543210` (India)
- ✅ `+14155551234` (USA)
- ❌ `9876543210`
- ❌ `+91 98765 43210`

### 2. **Call Timing**
- Don't call between 10 PM - 9 AM (local time)
- Respect do-not-disturb preferences
- Send SMS/WhatsApp first, call as follow-up

### 3. **Call Duration**
- Keep calls under 2 minutes
- Be concise and clear
- Provide option to connect to support

### 4. **Error Handling**
- Always handle call failures gracefully
- Send SMS/WhatsApp as fallback
- Log all call attempts

### 5. **Compliance**
- Follow telemarketing regulations
- Maintain opt-out list
- Record customer preferences

---

## 🔍 Troubleshooting

### Issue: "Voice service not configured"
**Solution:**
1. Check `TWILIO_PHONE_NUMBER` in `.env.local`
2. Ensure you've purchased a Twilio phone number
3. Restart dev server

### Issue: Call fails immediately
**Solution:**
1. Verify phone number format (E.164)
2. Check Twilio account balance
3. Verify webhook URL is accessible
4. Check Twilio console for error messages

### Issue: No audio on call
**Solution:**
1. Verify TwiML endpoint is returning proper XML
2. Test TwiML URL: `/api/voice/twiml?type=custom&message=Test`
3. Check Twilio debugger for audio issues

### Issue: Webhook not receiving status updates
**Solution:**
1. Verify webhook URL is correct in Twilio console
2. For local testing, ensure ngrok is running
3. Check webhook endpoint logs

---

## 🚀 Advanced Features

### 1. **Call Recording**
Enable in `lib/voiceCall.ts`:
```typescript
const call = await client.calls.create({
  to: phoneNumber,
  from: twilioPhoneNumber,
  url: twimlUrl,
  record: true  // Enable recording
});
```

### 2. **Interactive Voice Response (IVR)**
Add digit collection in TwiML:
```typescript
const gather = twiml.gather({
  numDigits: 1,
  action: '/api/voice/handle-input',
  method: 'POST'
});
gather.say('Press 1 for support, 2 to confirm, 3 to reschedule');
```

### 3. **Call Forwarding**
Forward to support agent:
```typescript
twiml.dial('+919876543210'); // Support number
```

### 4. **Voicemail Detection**
Detect answering machines:
```typescript
const call = await client.calls.create({
  machineDetection: 'Enable',
  asyncAmd: true
});
```

---

## 📈 Analytics & Monitoring

### Key Metrics to Track:
1. **Answer Rate**: % of calls answered
2. **Average Call Duration**: Time per call
3. **Call Completion Rate**: Successfully completed
4. **Failed Calls**: Network/technical failures
5. **Cost Per Call**: Total spend / calls made

### Recommended Tools:
- Twilio Console (built-in analytics)
- Custom dashboard with call logs
- Integration with analytics platforms

---

## 🔐 Security

### Best Practices:
1. **Validate Webhook Signatures**
   - Verify requests are from Twilio
   - Use Twilio's signature validation

2. **Secure API Endpoints**
   - Add authentication
   - Rate limiting
   - API keys for external access

3. **PII Protection**
   - Don't log sensitive customer data
   - Encrypt call recordings
   - Comply with data protection laws

---

## 📝 Next Steps

1. ✅ Purchase Twilio phone number
2. ✅ Update environment variables
3. ✅ Configure webhooks
4. ✅ Test on the dashboard
5. ✅ Enable voice calls in production
6. ✅ Monitor call metrics
7. ✅ Optimize call scripts

---

## 🆘 Support

- 📖 Twilio Voice Docs: https://www.twilio.com/docs/voice
- 🔧 Twilio Console: https://console.twilio.com/
- 💬 Dashboard: http://localhost:3000/call-management

---

**Built with ❤️ for TravixAI**
