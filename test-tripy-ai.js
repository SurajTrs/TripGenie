const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function testTripyAI() {
  console.log('🧪 Testing Tripy AI Assistant...\n');
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found');
    process.exit(1);
  }
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });
  
  const testPrompts = [
    "I want to plan a trip from Delhi to Mumbai",
    "What are the best hotels in Paris?",
    "Book a flight from New York to London for next week"
  ];
  
  for (const prompt of testPrompts) {
    console.log(`📤 User: ${prompt}`);
    
    try {
      const result = await model.generateContent(`You are TripGenie, an AI travel assistant. Help plan trips, book flights, hotels, and provide travel advice. User says: ${prompt}`);
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ AI: ${text.substring(0, 150)}...\n`);
    } catch (error) {
      console.error(`❌ Error: ${error.message}\n`);
    }
  }
  
  console.log('🎉 Tripy AI Assistant test complete!');
}

testTripyAI();
