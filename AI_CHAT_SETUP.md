# 🤖 TravixAI AI Chat Integration - Setup Guide

## Overview

Your TravixAI assistant now uses **real AI** (OpenAI GPT-4 or Claude) for intelligent, natural language conversations. Users can talk naturally, and the AI will understand their intent, extract booking details, and even trigger searches automatically!

---

## ✨ Features

### **Intelligent Conversation**
- Natural language understanding
- Multi-turn context-aware conversations
- Remembers previous messages
- Handles follow-up questions

### **Smart Intent Detection**
- Automatically detects what user wants to do
- Extracts booking details (dates, locations, passengers)
- Triggers searches when ready
- Asks clarifying questions when needed

### **Supported Intents**
- ✈️ Search flights
- 🏨 Search hotels
- 🚂 Search trains
- 🚌 Search buses
- 📝 Make bookings
- ✏️ Modify bookings
- ❌ Cancel bookings
- 💬 Answer travel questions

---

## 🔑 Setup (Choose One AI Provider)

### **Option A: OpenAI (Recommended)**

**Best for:** Advanced function calling, reliable intent extraction

1. **Get API Key**
   - Sign up at [https://platform.openai.com](https://platform.openai.com)
   - Go to API Keys → Create new key
   - Copy your key (starts with `sk-...`)

2. **Add to `.env.local`**
   ```env
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
   ```

3. **Pricing**
   - GPT-4 Turbo: $0.01 per 1K input tokens, $0.03 per 1K output tokens
   - GPT-3.5 Turbo: $0.0005 per 1K input tokens, $0.0015 per 1K output tokens
   - Average cost per conversation: $0.01-0.05

### **Option B: Anthropic Claude**

**Best for:** Advanced reasoning, longer context windows

1. **Get API Key**
   - Sign up at [https://console.anthropic.com](https://console.anthropic.com)
   - Get API key from Account Settings
   - Copy your key

2. **Add to `.env.local`**
   ```env
   ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx
   ```

3. **Pricing**
   - Claude 3 Opus: $15 per 1M input tokens, $75 per 1M output tokens
   - Claude 3 Sonnet: $3 per 1M input tokens, $15 per 1M output tokens
   - Average cost per conversation: $0.02-0.10

---

## ⚡ Quick Start

### Step 1: Install Dependencies

```bash
npm install openai
# Already included in package.json
```

### Step 2: Add API Key

Add to your `.env.local`:
```env
OPENAI_API_KEY=sk-proj-your_key_here
# OR
ANTHROPIC_API_KEY=sk-ant-your_key_here
```

### Step 3: Restart Server

```bash
npm run dev
```

### Step 4: Test AI Chat

```bash
curl -X POST http://localhost:3000/api/ai-chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I want to fly from Delhi to Mumbai next Friday",
    "provider": "auto"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Great! I'll help you find flights from Delhi to Mumbai next Friday. A few quick questions:\n• How many passengers?\n• Do you need a return flight?\n• Which class do you prefer?",
  "intent": {
    "intent": "search_flight",
    "confidence": 0.9,
    "entities": {
      "origin": "DEL",
      "destination": "BOM",
      "transportType": "flight"
    },
    "requiresMoreInfo": true,
    "missingFields": ["departureDate", "passengers"]
  }
}
```

---

## 💻 Usage Examples

### Example 1: Simple Flight Search

```typescript
const response = await fetch('/api/ai-chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Find me flights from Delhi to Mumbai on December 25 for 2 people',
  })
});

const data = await response.json();

// AI will automatically:
// 1. Understand intent: search_flight
// 2. Extract: DEL → BOM, 2024-12-25, 2 passengers
// 3. Trigger search if all details present
// 4. Return results with response message

if (data.searchResults) {
  console.log('Flights found:', data.searchResults.count);
  console.log('Results:', data.searchResults.results);
}
```

### Example 2: Multi-Turn Conversation

```typescript
// First message
const msg1 = await fetch('/api/ai-chat', {
  method: 'POST',
  body: JSON.stringify({
    message: 'I want to go to Goa'
  })
});

const data1 = await msg1.json();
const history = data1.conversationHistory;

// Follow-up message (with context)
const msg2 = await fetch('/api/ai-chat', {
  method: 'POST',
  body: JSON.stringify({
    message: 'From Mumbai, leaving tomorrow',
    conversationHistory: history  // Maintains context
  })
});

// AI remembers "Goa" from previous message!
```

### Example 3: Hotel Booking

```typescript
const response = await fetch('/api/ai-chat', {
  method: 'POST',
  body: JSON.stringify({
    message: 'I need a hotel in Delhi from Dec 25 to Dec 28, 2 guests, 1 room'
  })
});

// AI automatically triggers hotel search with:
// - cityCode: DEL
// - checkInDate: 2024-12-25
// - checkOutDate: 2024-12-28
// - adults: 2
// - rooms: 1
```

### Example 4: Complex Query

```typescript
const response = await fetch('/api/ai-chat', {
  method: 'POST',
  body: JSON.stringify({
    message: 'Plan a trip to Goa for 4 people from Dec 20-27. We need flights from Bangalore and a 4-star hotel near the beach. Budget around 50k.'
  })
});

// AI extracts:
// - Transport: flight (BLR → GOI)
// - Dates: Dec 20-27
// - Passengers: 4
// - Hotel preferences: 4-star, beach location
// - Budget: 50000 INR
```

---

## 🎨 Integrating with Your Frontend

### React Component Example

```tsx
'use client';

import { useState } from 'react';

export function AIChat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setLoading(true);

    // Add user message to UI
    setMessages(prev => [...prev, {
      role: 'user',
      content: input
    }]);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          conversationHistory,
        })
      });

      const data = await response.json();

      // Add AI response to UI
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message
      }]);

      // Update conversation history
      setConversationHistory(data.conversationHistory);

      // If search results available, display them
      if (data.searchResults) {
        console.log('Search results:', data.searchResults);
        // Show results in your UI
      }

      setInput('');
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
      </div>

      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask me anything about travel..."
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
```

### Voice Integration (with existing VoiceAssistant)

```typescript
// In your VoiceAssistant component
const processVoiceInput = async (speechText: string) => {
  // Send to AI for processing
  const response = await fetch('/api/ai-chat', {
    method: 'POST',
    body: JSON.stringify({
      message: speechText,
      conversationHistory: conversationContext
    })
  });

  const data = await response.json();

  // Speak the response
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(data.message);
    utterance.voice = 'Polly.Aditi';
    window.speechSynthesis.speak(utterance);
  }

  // If search results, show in UI
  if (data.searchResults) {
    setRightPanelData(data.searchResults.results);
  }
};
```

---

## 🎯 Advanced Features

### Custom System Prompt

Edit the `SYSTEM_PROMPT` in [lib/aiAssistant.ts](lib/aiAssistant.ts:84) to customize AI behavior:

```typescript
const SYSTEM_PROMPT = `You are TravixAI, a luxury travel consultant.
Your style is sophisticated and personalized.
Always suggest premium options and VIP services...`;
```

### Intent-Based Actions

The AI automatically triggers actions based on detected intent:

```typescript
// In your code
if (data.intent.intent === 'search_flight' && !data.intent.requiresMoreInfo) {
  // All required info collected, trigger search
  const flights = await searchFlights(data.intent.entities);
}
```

### Confidence Thresholds

Adjust confidence thresholds for actions:

```typescript
// Only trigger search if confidence > 80%
if (data.intent.confidence > 0.8) {
  triggerSearch();
} else {
  askForConfirmation();
}
```

---

## 🔒 Security Best Practices

### 1. **Never Expose API Keys in Frontend**

✅ **Correct:**
```typescript
// Backend only
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
```

❌ **Wrong:**
```typescript
// Frontend (NEVER!)
const apiKey = 'sk-proj-xxxxx';
```

### 2. **Rate Limiting**

Implement rate limiting to prevent abuse:

```typescript
// Using express-rate-limit or similar
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

### 3. **Input Sanitization**

Always validate and sanitize user input:

```typescript
if (!message || message.length > 1000) {
  return error('Invalid message');
}
```

### 4. **Cost Control**

Monitor API usage to control costs:

```typescript
// Track usage
const usage = response.usage;
console.log('Tokens used:', usage.total_tokens);

// Set max tokens to control cost
max_tokens: 500  // Limits response length
```

---

## 💰 Cost Optimization

### Tips to Reduce Costs:

1. **Use GPT-3.5 for Simple Queries**
   ```typescript
   model: message.length < 50 ? 'gpt-3.5-turbo' : 'gpt-4-turbo-preview'
   ```

2. **Limit Conversation History**
   ```typescript
   // Keep only last 5 messages
   const recentHistory = conversationHistory.slice(-5);
   ```

3. **Cache Common Responses**
   ```typescript
   // Cache FAQ responses
   if (isFAQ(message)) {
     return cachedResponse;
   }
   ```

4. **Set Token Limits**
   ```typescript
   max_tokens: 300  // Shorter responses = lower cost
   ```

### Expected Costs:

| Usage | OpenAI GPT-4 | OpenAI GPT-3.5 | Claude 3 Opus |
|-------|--------------|----------------|---------------|
| 100 chats/day | $3-5/day | $0.50-1/day | $6-10/day |
| 1000 chats/day | $30-50/day | $5-10/day | $60-100/day |

---

## 🐛 Troubleshooting

### Issue: "AI service not configured"

**Solution:** Add `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` to `.env.local`

### Issue: "Rate limit exceeded"

**Solution:**
1. Check your API usage on provider dashboard
2. Implement caching for common queries
3. Use GPT-3.5 instead of GPT-4 for high volume

### Issue: "Context length exceeded"

**Solution:**
1. Limit conversation history length
2. Summarize older messages
3. Use Claude for longer contexts (100K tokens)

### Issue: AI gives wrong information

**Solution:**
1. Improve system prompt with specific instructions
2. Add validation rules for extracted entities
3. Ask for confirmation before triggering actions

---

## 📊 Monitoring & Analytics

### Track AI Performance:

```typescript
// Log AI interactions
console.log({
  intent: data.intent.intent,
  confidence: data.intent.confidence,
  tokensUsed: data.usage?.total_tokens,
  responseTime: Date.now() - startTime,
  cost: calculateCost(data.usage)
});
```

### Monitor Key Metrics:

- Intent detection accuracy
- Average tokens per conversation
- Cost per conversation
- Response time
- User satisfaction (ask for feedback)

---

## 🎉 You're Ready!

Your TravixAI assistant now has:
- ✅ Real AI conversation (OpenAI or Claude)
- ✅ Natural language understanding
- ✅ Automatic intent detection
- ✅ Smart entity extraction
- ✅ Auto-triggering of searches
- ✅ Context-aware multi-turn chat
- ✅ Production-ready error handling

**Start chatting with your AI assistant now!**

Test it:
```bash
curl -X POST http://localhost:3000/api/ai-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Find me a cheap flight to Goa next week"}'
```

---

## 📞 Support

- **OpenAI Docs**: https://platform.openai.com/docs
- **Claude Docs**: https://docs.anthropic.com
- **TravixAI Support**: support@tripgenie.com

---

**Version**: 1.0.0 | **Status**: Production Ready ✅ | **Last Updated**: January 2025
