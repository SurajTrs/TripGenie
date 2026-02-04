const apiKey = 'AIzaSyAEmFZc_T76aLgrVoCduW4IGW3vcs9LIFg';
const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

const payload = {
  contents: [{
    role: "user",
    parts: [{ text: "Hello! Can you help me book a flight from Delhi to Mumbai?" }]
  }]
};

fetch(apiUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
})
.then(res => res.json())
.then(data => {
  console.log('✅ Gemini API is working!');
  console.log('Response:', JSON.stringify(data, null, 2));
})
.catch(error => {
  console.error('❌ Gemini API failed:', error);
});
