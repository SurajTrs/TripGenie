import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export async function chatWithGemini(userMessage: string, conversationHistory: any[] = []) {
  if (!genAI) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });
    
    const context = conversationHistory.map(msg => 
      `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n');

    const prompt = `${context}\nUser: ${userMessage}\nAssistant:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      response: text,
      conversationContext: [
        ...conversationHistory,
        { role: 'user', content: userMessage, timestamp: new Date() },
        { role: 'assistant', content: text, timestamp: new Date() },
      ],
    };
  } catch (error: any) {
    console.error('Gemini error:', error);
    
    // Fallback to Groq API
    try {
      const messages = conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
      messages.push({ role: 'user', content: userMessage });
      
      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY || '<GROQ_API_KEY>'}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages,
          temperature: 0.7
        })
      });
      
      if (groqResponse.ok) {
        const data = await groqResponse.json();
        const text = data.choices[0].message.content;
        
        return {
          success: true,
          response: text,
          conversationContext: [
            ...conversationHistory,
            { role: 'user', content: userMessage, timestamp: new Date() },
            { role: 'assistant', content: text, timestamp: new Date() },
          ],
        };
      }
    } catch (groqError) {
      console.error('Groq API error:', groqError);
    }
    
    throw error;
  }
}

export async function searchHotelsWithGemini(destination: string, budget: 'Luxury' | 'Medium' | 'Budget-friendly', checkInDate: string, adults: number = 1) {
  if (!genAI) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });
    
    const prompt = `You are a hotel search expert. Find 5 real, popular hotels in ${destination} for ${budget} budget.

Provide ONLY a JSON array with this exact structure (no markdown, no extra text):
[
  {
    "name": "Hotel Name",
    "rating": 4.5,
    "price": 3500,
    "location": "Area/Neighborhood",
    "amenities": ["WiFi", "Pool", "Gym"],
    "description": "Brief description",
    "image": "https://placeholder-url.com/hotel.jpg"
  }
]

Pricing guidelines:
- Budget-friendly: ₹800-2000 per night
- Medium: ₹2000-5000 per night  
- Luxury: ₹5000-15000 per night

Return ONLY the JSON array, nothing else.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    // Clean markdown if present
    if (text.startsWith('```json')) text = text.slice(7, -3).trim();
    else if (text.startsWith('```')) text = text.slice(3, -3).trim();
    
    const hotels = JSON.parse(text);
    
    // Transform to app format
    return hotels.map((hotel: any, index: number) => ({
      id: `gemini-hotel-${index}`,
      name: hotel.name,
      rating: hotel.rating || 4.0,
      price: hotel.price,
      location: hotel.location || destination,
      amenities: hotel.amenities || ['WiFi', 'AC', 'Room Service'],
      description: hotel.description || `Quality accommodation in ${destination}`,
      image: hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'
    }));
  } catch (error: any) {
    console.error('Gemini hotel search error:', error);
    
    // Fallback to Groq API
    try {
      const priceRange = budget === 'Budget-friendly' ? [800, 2000] : budget === 'Medium' ? [2000, 5000] : [5000, 15000];
      
      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY || '<GROQ_API_KEY>'}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{
            role: 'user',
            content: `Find 5 real, popular hotels in ${destination} for ${budget} budget. Return ONLY a JSON array with this structure: [{"name":"Hotel Name","rating":4.5,"price":3500,"location":"Area","amenities":["WiFi","Pool"],"description":"Brief desc","image":"url"}]. Pricing: Budget-friendly ₹800-2000, Medium ₹2000-5000, Luxury ₹5000-15000.`
          }],
          temperature: 0.7
        })
      });
      
      if (groqResponse.ok) {
        const data = await groqResponse.json();
        let text = data.choices[0].message.content.trim();
        if (text.startsWith('```json')) text = text.slice(7, -3).trim();
        else if (text.startsWith('```')) text = text.slice(3, -3).trim();
        
        const hotels = JSON.parse(text);
        return hotels.map((hotel: any, index: number) => ({
          id: `groq-hotel-${index}`,
          name: hotel.name,
          rating: hotel.rating || 4.0,
          price: hotel.price,
          location: hotel.location || destination,
          amenities: hotel.amenities || ['WiFi', 'AC', 'Room Service'],
          description: hotel.description || `Quality accommodation in ${destination}`,
          image: hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'
        }));
      }
    } catch (apiError) {
      console.error('Groq API error:', apiError);
    }
    
    // Final fallback to mock hotels
    const priceRange = budget === 'Budget-friendly' ? [800, 2000] : budget === 'Medium' ? [2000, 5000] : [5000, 15000];
    const basePrice = (priceRange[0] + priceRange[1]) / 2;
    
    return [
      { id: 'h1', name: `${destination} Grand Hotel`, rating: 4.5, price: Math.round(basePrice * 1.2), location: `Central ${destination}`, amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant'], description: `Luxury accommodation in the heart of ${destination}`, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400' },
      { id: 'h2', name: `Hotel ${destination} Palace`, rating: 4.3, price: Math.round(basePrice * 1.1), location: `Downtown ${destination}`, amenities: ['WiFi', 'AC', 'Room Service', 'Parking'], description: `Comfortable stay with modern amenities`, image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400' },
      { id: 'h3', name: `${destination} Residency`, rating: 4.2, price: Math.round(basePrice), location: `${destination} City`, amenities: ['WiFi', 'AC', 'Breakfast'], description: `Great value accommodation`, image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400' },
      { id: 'h4', name: `Comfort Inn ${destination}`, rating: 4.0, price: Math.round(basePrice * 0.9), location: `Near ${destination} Station`, amenities: ['WiFi', 'AC', 'TV'], description: `Budget-friendly option with essential amenities`, image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400' },
      { id: 'h5', name: `${destination} Suites`, rating: 4.4, price: Math.round(basePrice * 1.15), location: `${destination} Business District`, amenities: ['WiFi', 'Gym', 'Conference Room'], description: `Perfect for business travelers`, image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400' }
    ];
  }
}

export default genAI;
