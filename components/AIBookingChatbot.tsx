'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, X, Loader2, Plane, Calendar, MapPin, Sparkles } from 'lucide-react';
import FlightResults from './FlightResults';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tripData?: any;
  availableFlights?: any[];
}

export default function AIBookingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showOptions, setShowOptions] = useState(true);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, history: messages })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || 'I apologize, but I couldn\'t process that request. Could you please rephrase?',
        timestamp: new Date(),
        tripData: data.tripData,
        availableFlights: data.data?.availableFlights
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '⚠️ I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBook = async (tripData: any) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (!token) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: '🔐 Please login to complete your booking.\n\nRedirecting you to the login page...',
        timestamp: new Date()
      }]);
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/book-trip', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tripPlan: tripData })
      });

      const result = await response.json();

      if (result.success) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: '✅ Booking confirmed!\n\nRedirecting to your booking details...',
          timestamp: new Date()
        }]);
        setTimeout(() => {
          window.location.href = `/booking-success?id=${result.bookingId}`;
        }, 1500);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `❌ Booking failed: ${result.message}\n\nWould you like to try again?`,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: '❌ Unable to complete booking. Please try again or contact support.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white p-5 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 z-50 group"
          aria-label="Open AI chat assistant"
        >
          <div className="relative">
            <Sparkles className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
          </div>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl flex flex-col z-50 border border-white/20">
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white p-5 rounded-t-3xl flex justify-between items-center shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">TravixAI AI</h3>
                <p className="text-xs text-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  Online • Ready to help
                </p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={() => setIsOpen(false)} 
              className="hover:bg-white/20 p-2 rounded-lg transition-all hover:rotate-90 duration-300" 
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50 to-white">
            {showOptions && messages.length === 0 && (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Ready to Plan Your Journey!</h3>
                  <p className="text-sm text-slate-600">Book flights, trains, buses, and hotels with real-time pricing</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: '✈️', label: 'Flights', color: 'from-blue-500 to-blue-600' },
                    { icon: '🏨', label: 'Hotels', color: 'from-orange-500 to-orange-600' },
                    { icon: '🚆', label: 'Trains', color: 'from-green-500 to-green-600' },
                    { icon: '🚗', label: 'Car Rental', color: 'from-purple-500 to-purple-600' },
                  ].map((option) => (
                    <button
                      key={option.label}
                      onClick={() => {
                        setShowOptions(false);
                        setInput(`Book ${option.label.toLowerCase()}`);
                        setMessages([{
                          id: '1',
                          role: 'assistant',
                          content: `Great! Let's book ${option.label.toLowerCase()} for you. Please provide:\n\n📍 From: (City)\n📍 To: (City)\n📅 Date: (DD/MM/YYYY)\n👥 Passengers: (Number)`,
                          timestamp: new Date()
                        }]);
                      }}
                      className={`bg-gradient-to-r ${option.color} text-white p-6 rounded-2xl hover:scale-105 transition-all shadow-lg hover:shadow-xl`}
                    >
                      <div className="text-4xl mb-2">{option.icon}</div>
                      <div className="font-bold text-lg">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {!showOptions && messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${ 
                  msg.role === 'user' 
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none' 
                    : 'bg-white text-slate-800 rounded-bl-none border border-slate-200'
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  {msg.availableFlights && msg.availableFlights.length > 0 && (
                    <div className="mt-4">
                      <FlightResults 
                        flights={msg.availableFlights} 
                        onSelect={(flight) => {
                          setInput(`Select flight ${flight.flightNumber}`);
                          handleSend();
                        }}
                      />
                    </div>
                  )}
                  {msg.tripData && (
                    <div className="mt-4 space-y-3 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200">
                      <div className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
                        <MapPin className="w-4 h-4" />
                        <span>{msg.tripData.from} → {msg.tripData.to}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-emerald-800">
                        <Calendar className="w-4 h-4" />
                        <span>{msg.tripData.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-emerald-800">
                        <Plane className="w-4 h-4" />
                        <span>{msg.tripData.transportType || 'Transport'}</span>
                      </div>
                      {msg.tripData.total && (
                        <div className="text-lg font-bold text-emerald-900 pt-2 border-t border-emerald-200">
                          ₹{msg.tripData.total.toLocaleString()}
                        </div>
                      )}
                      <button
                        onClick={() => handleBook(msg.tripData)}
                        disabled={isLoading}
                        className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50"
                      >
                        Book Now →
                      </button>
                    </div>
                  )}
                  <p className="text-xs opacity-60 mt-2">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-none p-4 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    <span className="text-sm text-slate-600">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-slate-200 bg-white rounded-b-3xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-3 rounded-2xl hover:scale-110 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
