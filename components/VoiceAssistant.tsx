// src/components/VoiceAssistant.tsx
'use client';

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { TripPlanData, TripContext, FlightData, HotelData, TrainData, BusData } from '../types';
import { HotelCard } from './tripResults/HotelCard';
import { FlightCard } from './tripResults/FlightCard';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
    SpeechRecognitionEvent: any;
  }
}

interface VoiceAssistantProps {
  isActive: boolean;
  onClose: () => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
}

interface TripResponse {
  assistantFollowUp?: boolean;
  ask?: keyof TripContext;
  context?: TripContext;
  success?: boolean;
  message?: string;
  data?: Partial<TripPlanData>;
  error?: string;
}

type Message = {
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

function getPlaceholderForAsk(askKey: keyof TripContext): string {
  switch (askKey) {
    case 'from':      return 'e.g., Delhi';
    case 'to':        return 'e.g., Mumbai';
    case 'date':      return 'e.g., tomorrow';
    case 'budget':    return 'e.g., luxury or budget';
    case 'groupSize': return 'e.g., 2 people';
    case 'mode':      return 'e.g., flight or train';
    case 'returnTrip': return 'e.g., yes or no';
    case 'returnDate': return 'e.g., next week, 30th December';
    default:          return 'your answer';
  }
}

export default function VoiceAssistant({
  isActive,
  onClose,
  isListening,
  setIsListening,
}: VoiceAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [tripContext, setTripContext] = useState<TripContext>({});
  const [fallbackInput, setFallbackInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [rightPanelData, setRightPanelData] = useState<Partial<TripPlanData> | null>(null);
  const [returnTripData, setReturnTripData] = useState<Partial<TripPlanData> | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const addMessage = (msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  };

  const handleOptionSelect = (optionType: 'flight' | 'train' | 'bus' | 'hotel', selection: FlightData | TrainData | BusData | HotelData) => {
    let selectionName = '';
    
    if ('airline' in selection) {
      selectionName = selection.airline; // Flight
    } else if ('trainName' in selection) {
      selectionName = selection.trainName; // Train
    } else if ('operator' in selection) {
      selectionName = selection.operator; // Bus
    } else {
      selectionName = selection.name; // Hotel
    }
    
    addMessage({
      type: 'user',
      content: `Selected ${optionType}: ${selectionName}`,
      timestamp: new Date(),
    });

    // Check if this is a return trip selection
    const isReturnSelection = tripContext.returnTrip && 
      ((tripContext.flight && !tripContext.returnFlight && optionType === 'flight') ||
       (tripContext.train && !tripContext.returnTrain && optionType === 'train') ||
       (tripContext.bus && !tripContext.returnBus && optionType === 'bus'));
    
    const updatedContext: TripContext = {
      ...tripContext,
    };
    
    if (isReturnSelection) {
      // This is a return selection
      const key = `return${optionType.charAt(0).toUpperCase() + optionType.slice(1)}` as 'returnFlight' | 'returnTrain' | 'returnBus';
      updatedContext[key] = selection as any;
    } else {
      // This is a regular selection
      const key = optionType as 'flight' | 'train' | 'bus' | 'hotel';
      updatedContext[key] = selection as any;
    }
    
    setTripContext(updatedContext);
    sendCommand(`User selected ${isReturnSelection ? 'return ' : ''}${optionType}`, updatedContext);
  };

  const handleCancel = () => {
    setMessages([]);
    setTripContext({});
    setRightPanelData(null);
    setReturnTripData(null);
    setFallbackInput('');
    addMessage({ type: 'assistant', content: 'Your booking has been cancelled. How may I assist you with planning your next journey?', timestamp: new Date() });
  };

  const sendCommand = async (command: string, customContext?: TripContext) => {
    if (!command.trim() || isProcessing) return;

    // Handle cancel command
    if (command.toLowerCase().includes('cancel') || command.toLowerCase().includes('reset') || command.toLowerCase().includes('start over')) {
      handleCancel();
      return;
    }

    if (!customContext) {
      addMessage({ type: 'user', content: command, timestamp: new Date() });
      setRightPanelData(null);
    }
    setFallbackInput('');
    setIsProcessing(true);

    try {
      const requestBody = {
        message: command,
        context: customContext || tripContext,
        lat: 0, lng: 0,
      };

      const res = await fetch('/api/trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const result: TripResponse = await res.json();
      if (!res.ok) throw new Error(result.error || 'Server error.');

      if (result.message) {
        addMessage({ type: 'assistant', content: result.message, timestamp: new Date() });
        
        // Professional voice synthesis (only if not muted)
        if (!isMuted && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          
          // Get available voices
          const voices = window.speechSynthesis.getVoices();
          
          // Select professional voice (prefer female, English)
          const professionalVoice = voices.find(v => 
            (v.name.includes('Google') || v.name.includes('Microsoft')) && 
            v.lang.startsWith('en') && 
            (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Karen'))
          ) || voices.find(v => v.lang.startsWith('en-US')) || voices[0];
          
          const utterance = new SpeechSynthesisUtterance(result.message);
          utterance.voice = professionalVoice;
          utterance.rate = 0.9; // Slightly slower for clarity
          utterance.pitch = 1.0; // Natural pitch
          utterance.volume = 1.0; // Full volume
          
          window.speechSynthesis.speak(utterance);
        }
      }
      
      if (result.context) {
        setTripContext(result.context);
        // If this was a booking request and it was successful, update booking status
        if (result.context.bookingReference) {
          addMessage({ 
            type: 'assistant', 
            content: `✅ Booking successfully confirmed! Reference: ${result.context.bookingReference}`, 
            timestamp: new Date() 
          });
        }
      }
      
      if (result.data) {
        setRightPanelData(result.data);
      } else if (result.success === false) {
        setRightPanelData(null);
      }

    } catch (err: any) {
      const errorMessage = err.message || 'Something went wrong.';
      addMessage({ type: 'assistant', content: errorMessage, timestamp: new Date() });
      
      // Professional error voice (only if not muted)
      if (!isMuted && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const voices = window.speechSynthesis.getVoices();
        const professionalVoice = voices.find(v => 
          (v.name.includes('Google') || v.name.includes('Microsoft')) && 
          v.lang.startsWith('en')
        ) || voices[0];
        
        const utterance = new SpeechSynthesisUtterance(errorMessage);
        utterance.voice = professionalVoice;
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } finally {
      setIsProcessing(false);
      setIsListening(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) return;
    const recog = new SpeechRecognition();
    recog.lang = 'en-IN';
    recog.interimResults = false;
    recog.onresult = (e: SpeechRecognitionEvent) => sendCommand(e.results[0][0].transcript);
    recog.onerror = () => setIsListening(false);
    recog.onend = () => setIsListening(false);
    recog.start();
    setIsListening(true);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendCommand(fallbackInput);
  };

  const fetchRealTimePricing = async () => {
    if (!rightPanelData || !tripContext.origin || !tripContext.destination || !tripContext.departureDate) {
      return null;
    }
    
    setIsBooking(true);
    addMessage({
      type: 'assistant',
      content: '🔄 Retrieving real-time pricing for your itinerary...',
      timestamp: new Date()
    });
    
    try {
      const pricingRequest = {
        transportType: tripContext.transportType || 'flight',
        origin: tripContext.origin,
        destination: tripContext.destination,
        departureDate: tripContext.departureDate,
        returnDate: tripContext.returnDate || undefined,
        adults: tripContext.groupSize || 1,
        hotelNeeded: !!tripContext.hotelNeeded,
        cabToStationNeeded: !!tripContext.cabToStationNeeded,
        cabToHotelNeeded: !!tripContext.cabToHotelNeeded
      };
      
      const response = await fetch('/api/real-pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pricingRequest)
      });
      
      const result = await response.json();
      
      if (result.success && result.data) {
        // Update the right panel data with real-time pricing
        const updatedPlanData = {
          ...rightPanelData,
          transport: result.data.transport,
          returnTransport: result.data.returnTransport,
          hotel: result.data.hotel,
          cabToStation: result.data.cabToStation,
          cabToHotel: result.data.cabToHotel,
          total: result.data.total
        };
        
        setRightPanelData(updatedPlanData);
        
        addMessage({
          type: 'assistant',
          content: `✅ Pricing successfully updated with real-time rates!\n\nTotal Amount: ₹${result.data.total.toLocaleString()}`,
          timestamp: new Date()
        });
        
        return updatedPlanData;
      } else {
        addMessage({
          type: 'assistant',
          content: `⚠️ Unable to retrieve real-time pricing at the moment. Displaying estimated pricing instead.`,
          timestamp: new Date()
        });
        return rightPanelData;
      }
    } catch (error: any) {
      addMessage({
        type: 'assistant',
        content: `⚠️ Unable to retrieve real-time pricing at the moment. Displaying estimated pricing instead.`,
        timestamp: new Date()
      });
      return rightPanelData;
    } finally {
      setIsBooking(false);
    }
  };

  const handleBooking = async () => {
    if (!rightPanelData || !isFinalPlan) return;
    
    // Check if user is logged in
    const sessionToken = document.cookie.split('; ').find(row => row.startsWith('session_token='));
    if (!sessionToken) {
      addMessage({
        type: 'assistant',
        content: 'Please sign in to complete your booking. Redirecting to login page...',
        timestamp: new Date()
      });
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
      return;
    }
    
    setIsBooking(true);
    try {
      // First get real-time pricing
      const updatedPlanData = await fetchRealTimePricing() || rightPanelData;
      
      // For demo purposes, we'll use mock user details
      // In a real app, you'd collect this from a form
      const bookingRequest = {
        tripPlan: updatedPlanData,
        userDetails: {
          name: "Demo User",
          email: "demo@example.com",
          phone: "+91-9876543210",
          passengers: [{
            firstName: "Demo",
            lastName: "User",
            dateOfBirth: "1990-01-01",
            passportNumber: "A12345678"
          }]
        },
        context: tripContext // Pass the full trip context for reference
      };

      // Use the Stripe checkout API instead of direct booking
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingRequest)
      });

      const result = await response.json();

      if (result.success && result.checkoutUrl) {
        // Update trip context with session ID
        setTripContext(prev => ({
          ...prev,
          stripeSessionId: result.sessionId
        }));
        
        addMessage({
          type: 'assistant',
          content: `🛒 Your itinerary is ready for checkout! Redirecting you to our secure payment gateway to complete your booking.\n\nTotal Amount: ₹${updatedPlanData.total?.toLocaleString() || 'Calculating...'}`,
          timestamp: new Date()
        });
        
        if (!isMuted && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const voices = window.speechSynthesis.getVoices();
          const professionalVoice = voices.find(v => 
            (v.name.includes('Google') || v.name.includes('Microsoft')) && 
            v.lang.startsWith('en')
          ) || voices[0];
          
          const utterance = new SpeechSynthesisUtterance("Redirecting you to our secure payment gateway to complete your booking.");
          utterance.voice = professionalVoice;
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          window.speechSynthesis.speak(utterance);
        }
        
        // Redirect to Stripe checkout
        window.location.href = result.checkoutUrl;
      } else {
        addMessage({
          type: 'assistant',
          content: `❌ Unable to process checkout at the moment. Please try again shortly.`,
          timestamp: new Date()
        });
      }
    } catch (error: any) {
      addMessage({
        type: 'assistant',
        content: `❌ We're experiencing difficulty processing your checkout. Please try again in a moment.`,
        timestamp: new Date()
      });
    } finally {
      setIsBooking(false);
    }
  };


  if (!isActive) return null;
  
  const isFinalPlan = rightPanelData?.transport && rightPanelData?.hotel && rightPanelData?.total != null;
  const currentAsk = tripContext.ask;

  return (
    <aside role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4">
      <div className="flex flex-col lg:flex-row h-[95vh] sm:h-[90vh] max-h-[700px] w-full max-w-5xl overflow-hidden rounded-xl sm:rounded-2xl bg-white shadow-2xl">
        <div className="flex flex-col w-full lg:w-3/5 overflow-hidden">
            <header className="flex items-center justify-between bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-3 sm:p-6 text-white shadow-xl">
                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/40 backdrop-blur-sm">
                      <i className="ri-robot-2-line text-2xl sm:text-3xl" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-xl font-bold tracking-tight">TravixAI AI</h2>
                      <p className="text-xs sm:text-sm text-violet-100 flex items-center gap-2">
                        <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></span>
                        <span className="hidden sm:inline">Real-time booking powered by AI</span>
                        <span className="sm:hidden">Live booking</span>
                      </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setIsMuted(!isMuted);
                      if (!isMuted) window.speechSynthesis.cancel();
                    }}
                    aria-label={isMuted ? 'Unmute voice' : 'Mute voice'}
                    className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full transition hover:bg-white/20 duration-300"
                  >
                    <i className={`text-lg sm:text-xl ${isMuted ? 'ri-volume-mute-line' : 'ri-volume-up-line'}`} />
                  </button>
                  <button onClick={onClose} aria-label="Close assistant" className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full transition hover:bg-white/20 hover:rotate-90 duration-300">
                    <i className="ri-close-line text-xl sm:text-2xl" />
                  </button>
                </div>
            </header>
            <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-5 bg-gray-50">
                {!messages.length && <div className="flex h-full flex-col items-center justify-center text-gray-500 px-4 sm:px-8">
                  <p className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Ready to Plan Your Journey!</p>
                  <p className="text-xs sm:text-sm text-gray-600 text-center mb-4 sm:mb-6">Book flights, trains, buses, and hotels with real-time pricing</p>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-md">
                    {[
                      { icon: 'ri-flight-takeoff-line', label: 'Flights', color: 'from-blue-500 to-blue-600', command: 'Book flights' },
                      { icon: 'ri-hotel-line', label: 'Hotels', color: 'from-orange-500 to-orange-600', command: 'Book hotels' },
                      { icon: 'ri-train-line', label: 'Trains', color: 'from-green-500 to-green-600', command: 'Book trains' },
                      { icon: 'ri-car-line', label: 'Car Rental', color: 'from-purple-500 to-purple-600', command: 'Book car rental' },
                    ].map((option) => (
                      <button
                        key={option.label}
                        onClick={() => sendCommand(option.command)}
                        className={`bg-gradient-to-r ${option.color} text-white p-4 sm:p-6 rounded-xl sm:rounded-2xl hover:scale-105 transition-all shadow-lg hover:shadow-xl active:scale-95`}
                      >
                        <i className={`${option.icon} text-3xl sm:text-4xl mb-1 sm:mb-2 block`}></i>
                        <p className="font-bold text-sm sm:text-lg">{option.label}</p>
                      </button>
                    ))}
                  </div>
                </div>}
                {messages.map((msg, idx) => (<div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}><div role="log" aria-live="polite" className={`max-w-[85%] sm:max-w-md whitespace-pre-wrap rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm leading-relaxed shadow-sm ${msg.type === 'user' ? 'bg-violet-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'}`} dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-violet-300 hover:underline">$1</a>').replace(/\n/g, '<br/>') }} /></div>))}
                {isProcessing && <div className="flex justify-start"><div className="flex items-center gap-2 rounded-xl sm:rounded-2xl rounded-bl-none bg-white px-3 sm:px-4 py-2 sm:py-3 text-gray-800 shadow-sm"><span className="h-1.5 w-1.5 sm:h-2 sm:w-2 animate-bounce rounded-full bg-violet-600" /><span className="h-1.5 w-1.5 sm:h-2 sm:w-2 animate-bounce rounded-full bg-violet-600 delay-150" /><span className="h-1.5 w-1.5 sm:h-2 sm:w-2 animate-bounce rounded-full bg-violet-600 delay-300" /><span className="ml-2 text-xs sm:text-sm">TravixAI is thinking...</span></div></div>}
                <div ref={bottomRef} />
            </div>
            <footer className="flex-shrink-0 border-t border-gray-200 p-3 sm:p-5 bg-gradient-to-r from-gray-50 to-white">
                {messages.length > 0 && (
                  <div className="mb-2 sm:mb-3">
                    <button onClick={handleCancel} className="text-xs sm:text-sm text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 active:scale-95">
                      <i className="ri-close-circle-line"></i>
                      Cancel & Start Over
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2 sm:gap-3">
                    <button onClick={startListening} disabled={isListening || isProcessing} aria-label={isListening ? 'Stop listening' : 'Start listening'} className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full transition-all duration-300 shadow-lg ${isListening ? 'animate-pulse bg-red-500 scale-110' : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700'} text-white ${isProcessing ? 'cursor-not-allowed bg-gray-400' : ''}`}><i className={`text-xl sm:text-2xl ${isListening ? 'ri-mic-off-fill' : 'ri-mic-fill'}`} /></button>
                    <div className="flex-1 relative">
                      <input type="text" value={fallbackInput} onChange={(e) => setFallbackInput(e.target.value)} onKeyDown={handleKeyDown} disabled={isProcessing} 
                             placeholder={currentAsk ? getPlaceholderForAsk(currentAsk) : "Ask me anything..."}
                             aria-label="Type your command" className="w-full rounded-lg sm:rounded-xl border-2 border-gray-300 px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm" />
                      {!fallbackInput && <i className="ri-chat-3-line absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base"></i>}
                    </div>
                    <button onClick={() => sendCommand(fallbackInput)} disabled={!fallbackInput.trim() || isProcessing} className="rounded-lg sm:rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 sm:px-7 py-2.5 sm:py-3.5 text-xs sm:text-sm font-bold text-white transition hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105 duration-200 active:scale-95">Send</button>
                </div>
            </footer>
        </div>

        {/* --- REVISED & SAFER Right Panel Rendering Logic --- */}
        <div className="flex flex-col w-full lg:w-2/5 border-t lg:border-t-0 lg:border-l border-gray-200 bg-gray-100 overflow-y-auto p-3 sm:p-4 max-h-[40vh] lg:max-h-none">
          {rightPanelData ? (
            <>
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {isFinalPlan ? 'Your Trip Summary' : 'Trip Options'}
              </h3>
              <div className="flex-1 space-y-4">
                {isFinalPlan ? (
                  // Display Final Trip Plan (with safety checks)
                  <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 text-sm space-y-2">
                    {/* Origin and Destination */}
                    {rightPanelData.transport && 'departureAirportIata' in rightPanelData.transport && <p><strong>From:</strong> {rightPanelData.transport.departureAirportIata}</p>}
                    {rightPanelData.transport && 'arrivalAirportIata' in rightPanelData.transport && <p><strong>To:</strong> {rightPanelData.transport.arrivalAirportIata}</p>}
                    {rightPanelData.transport && 'departureCity' in rightPanelData.transport && <p><strong>From:</strong> {rightPanelData.transport.departureCity}</p>}
                    {rightPanelData.transport && 'arrivalCity' in rightPanelData.transport && <p><strong>To:</strong> {rightPanelData.transport.arrivalCity}</p>}
                    <hr/>
                    
                    {/* Transport Details */}
                    {rightPanelData.transportType === 'flight' && rightPanelData.transport && 'airline' in rightPanelData.transport && (
                      <p><strong>Flight:</strong> {rightPanelData.transport.airline} - ₹{rightPanelData.transport.price.toLocaleString()}</p>
                    )}
                    {rightPanelData.transportType === 'train' && rightPanelData.transport && 'trainName' in rightPanelData.transport && (
                      <p><strong>Train:</strong> {rightPanelData.transport.trainName} ({rightPanelData.transport.trainNumber}) - ₹{rightPanelData.transport.price.toLocaleString()}</p>
                    )}
                    {rightPanelData.transportType === 'bus' && rightPanelData.transport && 'operator' in rightPanelData.transport && (
                      <p><strong>Bus:</strong> {rightPanelData.transport.operator} - ₹{rightPanelData.transport.price.toLocaleString()}</p>
                    )}
                    
                    {/* Return Transport Details */}
                    {rightPanelData.returnTrip && rightPanelData.returnTransport && 'airline' in rightPanelData.returnTransport && (
                      <p><strong>Return Flight:</strong> {rightPanelData.returnTransport.airline} - ₹{rightPanelData.returnTransport.price.toLocaleString()}</p>
                    )}
                    {rightPanelData.returnTrip && rightPanelData.returnTransport && 'trainName' in rightPanelData.returnTransport && (
                      <p><strong>Return Train:</strong> {rightPanelData.returnTransport.trainName} ({rightPanelData.returnTransport.trainNumber}) - ₹{rightPanelData.returnTransport.price.toLocaleString()}</p>
                    )}
                    {rightPanelData.returnTrip && rightPanelData.returnTransport && 'operator' in rightPanelData.returnTransport && (
                      <p><strong>Return Bus:</strong> {rightPanelData.returnTransport.operator} - ₹{rightPanelData.returnTransport.price.toLocaleString()}</p>
                    )}
                    
                    {/* Hotel Details */}
                    {rightPanelData.hotel && <p><strong>Hotel:</strong> {rightPanelData.hotel.name} - ₹{rightPanelData.hotel.price.toLocaleString()}/night</p>}
                    <hr/>
                    
                    {/* Transportation Details */}
                    {rightPanelData.cabToStation && <p><strong>Cab to {rightPanelData.transportType === 'flight' ? 'Airport' : rightPanelData.transportType === 'train' ? 'Train Station' : 'Bus Station'}:</strong> ₹{rightPanelData.cabToStation.price.toLocaleString()}</p>}
                    {rightPanelData.cabToHotel && <p><strong>Cab to Hotel:</strong> ₹{rightPanelData.cabToHotel.price.toLocaleString()}</p>}
                    <hr/>
                    
                    {/* Total Cost */}
                    {rightPanelData.total != null && <p className="text-base font-bold mt-2">Total Est. Cost: ₹{rightPanelData.total.toLocaleString()}</p>}
                    
                    {/* Booking Button */}
                    <button 
                      onClick={handleBooking}
                      disabled={isBooking}
                      className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg transform hover:scale-[1.02]"
                    >
                      {isBooking ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Processing Booking...
                        </>
                      ) : (
                        <>
                          <i className="ri-secure-payment-line text-lg"></i>
                          Book & Pay Securely
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  // Display Intermediate Options
                  <>
                    {rightPanelData.transport && 'airline' in rightPanelData.transport && (
                        <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Selected Flight</h4>
                            <div className="bg-violet-50 p-3 rounded-lg border border-violet-200 text-sm">
                                <p className="font-bold">{rightPanelData.transport.airline}</p>
                                <p>Price: ₹{rightPanelData.transport.price.toLocaleString()}</p>
                            </div>
                        </div>
                    )}
                   {rightPanelData.availableFlights && (
  <div>
    <div className="mb-4 flex items-center justify-between">
      <h4 className="font-semibold text-gray-700">Choose a {tripContext.returnTrip && tripContext.flight ? 'Return ' : ''}Flight</h4>
      <select className="text-xs border border-gray-300 rounded px-2 py-1">
        <option>Cheapest first</option>
        <option>Fastest first</option>
        <option>Best</option>
      </select>
    </div>
    <div className="text-xs text-gray-500 mb-3">
      Showing {rightPanelData.availableFlights.length} results
    </div>
    {rightPanelData.availableFlights.map((flight) => (
      <FlightCard
        key={flight.id}
        flight={flight}
        onSelect={() => handleOptionSelect('flight', flight)}
      />
    ))}
  </div>
)}

{rightPanelData.availableTrains && (
  <div>
    <h4 className="font-semibold text-gray-700 mb-2">Choose a {tripContext.returnTrip && tripContext.train ? 'Return ' : ''}Train</h4>
    {rightPanelData.availableTrains.map((train) => (
      <div key={train.id} className="bg-white p-3 rounded-lg border border-gray-200 mb-3 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-bold">{train.trainName} ({train.trainNumber})</p>
            <p className="text-sm text-gray-600">{train.trainType} - {train.trainClass}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm">{train.departureTime}</span>
              <span className="text-xs text-gray-500">→</span>
              <span className="text-sm">{train.arrivalTime}</span>
              <span className="text-xs text-gray-500 ml-2">{train.duration}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-violet-700">₹{train.price.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{train.availableSeats} seats left</p>
            <button 
              onClick={() => handleOptionSelect('train', train)}
              className="mt-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold py-1 px-3 rounded transition-colors"
            >
              Select
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
)}

{rightPanelData.availableBuses && (
  <div>
    <h4 className="font-semibold text-gray-700 mb-2">Choose a {tripContext.returnTrip && tripContext.bus ? 'Return ' : ''}Bus</h4>
    {rightPanelData.availableBuses.map((bus) => (
      <div key={bus.id} className="bg-white p-3 rounded-lg border border-gray-200 mb-3 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-bold">{bus.operator}</p>
            <p className="text-sm text-gray-600">{bus.busType}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm">{bus.departureTime}</span>
              <span className="text-xs text-gray-500">→</span>
              <span className="text-sm">{bus.arrivalTime}</span>
              <span className="text-xs text-gray-500 ml-2">{bus.duration}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-violet-700">₹{bus.price.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{bus.availableSeats} seats left</p>
            <button 
              onClick={() => handleOptionSelect('bus', bus)}
              className="mt-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold py-1 px-3 rounded transition-colors"
            >
              Select
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
)}
                    {rightPanelData.availableHotels && (
  <div>
    <h4 className="font-semibold text-gray-700 mb-2">Choose a Hotel</h4>
    {rightPanelData.availableHotels.map((hotel) => (
      <HotelCard
        key={hotel.id}
        hotel={hotel}
        onSelect={() => handleOptionSelect('hotel', hotel)}
      />
    ))}
  </div>
)}

                  </>
                )}
              </div>
            </>
          ) : (
             <div className="flex h-full flex-col items-center justify-center text-center text-gray-500 px-6">
                <div className="bg-gradient-to-br from-violet-100 to-purple-100 rounded-full p-6 mb-4">
                  <i className="ri-search-line text-5xl text-violet-600"></i>
                </div>
                <p className="font-semibold text-gray-700 mb-2">Trip Planning in Progress</p>
                <p className="text-sm text-gray-500">Your personalized itinerary will appear here</p>
                <div className="mt-6 space-y-2 w-full">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Real-time flight data</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Live hotel availability</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Instant booking confirmation</span>
                  </div>
                </div>
             </div>
          )}
        </div>
      </div>
    </aside>
  );
}
