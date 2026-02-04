/**
 * Quick test script to verify WhatsApp integration
 * Run with: node test-whatsapp.js
 */

require('dotenv').config({ path: '.env.local' });

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

console.log('🔍 Testing WhatsApp Integration...\n');
console.log('Credentials loaded:');
console.log('- Account SID:', accountSid ? `${accountSid.substring(0, 10)}...` : '❌ Not found');
console.log('- Auth Token:', authToken ? `${authToken.substring(0, 10)}...` : '❌ Not found');
console.log('- WhatsApp Number:', whatsappNumber || '❌ Not found');
console.log('');

if (!accountSid || !authToken || !whatsappNumber) {
  console.error('❌ Missing credentials. Please check your .env.local file.');
  process.exit(1);
}

// Initialize Twilio client
const client = require('twilio')(accountSid, authToken);

// Test phone number (replace with your WhatsApp number)
const TEST_PHONE_NUMBER = process.argv[2] || 'whatsapp:+919621988514';

console.log(`📱 Sending test message to: ${TEST_PHONE_NUMBER}\n`);

// Send test message
client.messages
  .create({
    from: whatsappNumber,
    to: TEST_PHONE_NUMBER,
    body: `
🎉 WhatsApp Integration Test - TripGenie

✅ Your WhatsApp integration is working!

This is a test message to confirm that:
- Twilio credentials are configured correctly
- WhatsApp API is accessible
- Messages can be sent successfully

You're all set! 🚀

Test sent at: ${new Date().toLocaleString()}
    `.trim()
  })
  .then(message => {
    console.log('✅ Message sent successfully!');
    console.log('Message SID:', message.sid);
    console.log('Status:', message.status);
    console.log('');
    console.log('📱 Check your WhatsApp to see the message!');
    console.log('');
    console.log('💡 Next steps:');
    console.log('1. Make sure you\'ve joined the Twilio sandbox (send "join <code>" to +14155238886)');
    console.log('2. Start your dev server: npm run dev');
    console.log('3. Make a test booking with your phone number');
    console.log('4. You should receive booking confirmations via WhatsApp!');
  })
  .catch(error => {
    console.error('❌ Error sending message:');
    console.error(error.message);
    console.error('');
    console.error('🔧 Troubleshooting:');
    console.error('1. Make sure you\'ve joined the Twilio WhatsApp sandbox');
    console.error('2. Verify your phone number is in the correct format: whatsapp:+1234567890');
    console.error('3. Check that your Twilio credentials are correct');
    console.error('4. Ensure your Twilio account is active');
  });
