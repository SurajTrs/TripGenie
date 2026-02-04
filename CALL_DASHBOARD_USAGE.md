# 📞 Call Management Dashboard - Usage Guide

## Overview

Professional dashboard for managing and monitoring all voice calls made through TravixAI's voice system.

---

## 🚀 Quick Start

### Access the Dashboard

```
http://localhost:3000/call-management
```

---

## ✨ Features

### 1. **Real-Time Call Monitoring**
- View all calls in real-time
- Auto-refreshes every 10 seconds
- Manual refresh button available

### 2. **Call Statistics Dashboard**
- **Total Calls**: All calls made
- **Completed**: Successfully completed calls
- **In Progress**: Currently active calls
- **Failed**: Failed calls (busy, no-answer, etc.)
- **Average Duration**: Average call length in seconds

### 3. **Initiate New Calls**

**Supported Call Types:**
1. **🎫 Booking Confirmation**
   - Confirms booking details
   - Reads out booking ID, route, date, transport type

2. **💳 Payment Reminder**
   - Reminds customer about pending payment
   - Includes booking ID and amount

3. **✈️ Flight Update**
   - Notifies about flight delays/changes
   - Custom message support

4. **📝 Custom Message**
   - Any custom message you want to send

### 4. **Search & Filter**
- Search by phone number or call ID
- Filter by status (all, completed, in-progress, failed, etc.)
- Live filtering

### 5. **Call Actions**
- End active calls
- View call details
- Track call duration

---

## 📋 How to Use

### Initiating a Booking Confirmation Call

1. Click **"New Call"** button
2. Select **"Booking Confirmation"** from dropdown
3. Fill in details:
   - **Phone Number**: +919876543210
   - **Booking ID**: TRIP-123456
   - **Customer Name**: John Doe
   - **From**: Mumbai
   - **To**: Delhi
   - **Date**: 2024-12-25
   - **Transport Type**: Flight
4. Click **"Make Call"**
5. Call will be initiated immediately!

### Monitoring Calls

**Call Statuses:**
- 🟢 **Completed**: Call finished successfully
- 🔵 **In Progress**: Call currently active
- 🔵 **Ringing**: Phone is ringing
- 🔴 **Failed**: Call failed to connect
- 🔴 **Busy**: User was busy
- 🔴 **No Answer**: User didn't pick up
- 🟡 **Queued**: Call in queue

### Ending Active Calls

1. Locate the active call in the list
2. Click **"End Call"** button
3. Confirm action
4. Call will be terminated

---

## 🔧 Configuration Requirements

### Required Environment Variables

```env
# Twilio Configuration (Required)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Base URL for webhooks
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Setup Checklist

- [ ] Twilio account created
- [ ] Phone number purchased with voice capabilities
- [ ] API credentials added to `.env.local`
- [ ] Webhooks configured (automatic in development)
- [ ] Server running: `npm run dev`

---

## 📊 Understanding the Dashboard

### Statistics Cards

```
┌─────────────────────────────────────────────────────────────┐
│  Total Calls  │  Completed  │  In Progress  │  Failed  │ Avg │
│      50       │     42      │       3       │    5     │ 145s│
└─────────────────────────────────────────────────────────────┘
```

### Call History Table

| Column | Description |
|--------|-------------|
| Status | Current call status with icon |
| Phone Number | Recipient's phone number |
| Direction | Inbound/Outbound |
| Start Time | When call was initiated |
| Duration | Call length in seconds |
| Call ID | Twilio Call SID |
| Actions | End call button (for active calls) |

---

## 🎯 Common Use Cases

### 1. Confirm All Today's Bookings

```typescript
// For each booking:
1. Click "New Call"
2. Select "Booking Confirmation"
3. Enter booking details
4. Click "Make Call"
5. Monitor in dashboard
```

### 2. Send Payment Reminders

```typescript
1. Select "Payment Reminder" call type
2. Enter booking ID and customer name
3. System automatically adds amount
4. Make call
```

### 3. Notify About Delays

```typescript
1. Select "Flight Update"
2. Enter booking details
3. Custom message auto-generated
4. Call customer immediately
```

### 4. Bulk Call Campaign

```typescript
// Pseudo code
bookings.forEach(booking => {
  await fetch('/api/voice/initiate', {
    method: 'POST',
    body: JSON.stringify({
      callType: 'booking_confirmation',
      phoneNumber: booking.phone,
      data: booking
    })
  });

  // Wait 2 seconds between calls
  await sleep(2000);
});
```

---

## 🐛 Troubleshooting

### Issue: "Failed to fetch calls"

**Causes:**
1. Twilio credentials not configured
2. Twilio account not active
3. Network issues

**Solutions:**
1. Check `.env.local` has correct credentials
2. Verify Twilio account is active
3. Check Twilio dashboard for errors
4. Restart development server

### Issue: Calls not appearing

**Solutions:**
1. Click refresh button
2. Check Twilio dashboard
3. Verify phone number has voice capability
4. Check browser console for errors

### Issue: Can't end active calls

**Solutions:**
1. Check call is actually active
2. Wait a few seconds and try again
3. Check Twilio logs
4. Call may have ended naturally

### Issue: Dashboard loads slowly

**Solutions:**
1. Reduce call limit (default: 50)
2. Clear browser cache
3. Check network connection
4. Use search/filter to reduce displayed calls

---

## 💡 Pro Tips

### 1. **Use Search Effectively**
```
Search: +9198
→ Shows all calls to numbers starting with +9198

Search: CA12345
→ Shows calls with this Call SID
```

### 2. **Filter for Specific Issues**
```
Filter: failed
→ See all failed calls to investigate

Filter: busy
→ Numbers that were busy (retry later)

Filter: no-answer
→ Customers who didn't pick up
```

### 3. **Monitor Active Calls**
```
Filter: in-progress
→ See all currently active calls
→ Useful for live monitoring
```

### 4. **Track Performance**
```
Watch the stats cards:
- Completion rate = Completed / Total
- Failure rate = Failed / Total
- Avg duration shows engagement
```

---

## 📈 Best Practices

### 1. **Call Timing**
- ✅ Call between 9 AM - 9 PM
- ✅ Avoid early morning/late night
- ✅ Consider customer's timezone
- ❌ Don't spam same number

### 2. **Message Quality**
- ✅ Keep messages clear and concise
- ✅ Speak booking IDs slowly
- ✅ Provide opt-out option
- ✅ Professional tone

### 3. **Monitoring**
- ✅ Check dashboard regularly
- ✅ Monitor failed calls
- ✅ Review average duration
- ✅ Track completion rates

### 4. **Data Management**
- ✅ Export call logs periodically
- ✅ Archive old calls
- ✅ Document failures
- ✅ Track customer feedback

---

## 🔒 Security & Privacy

### Data Protection
- Phone numbers are masked in logs
- Call recordings optional
- GDPR compliant
- Secure API endpoints

### Access Control
- Dashboard requires authentication
- Role-based access (implement as needed)
- Audit logging available

---

## 📞 Support

### Need Help?
- **Documentation**: [VOICE_SYSTEM_DOCUMENTATION.md](./VOICE_SYSTEM_DOCUMENTATION.md)
- **API Reference**: [README_VOICE_SYSTEM.md](./README_VOICE_SYSTEM.md)
- **Twilio Support**: https://support.twilio.com
- **TravixAI Support**: support@tripgenie.com

---

## 🎉 You're Ready!

Your Call Management Dashboard is now fully functional. Start monitoring and managing all your voice communications from one place!

**Quick Test:**
1. Open: http://localhost:3000/call-management
2. Click "New Call"
3. Enter your phone number
4. Select "Custom Message"
5. Type: "This is a test from TravixAI"
6. Click "Make Call"
7. You should receive a call in seconds!

---

**Version**: 1.0.0 | **Status**: Production Ready ✅ | **Last Updated**: January 2025
