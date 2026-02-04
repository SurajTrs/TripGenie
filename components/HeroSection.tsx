'use client';

import { useState } from 'react';
import { Plane, MapPin, Calendar, Users, TrendingUp, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onActivateAssistant: () => void;
  isListening: boolean;
}

export default function HeroSection({ onActivateAssistant, isListening }: HeroSectionProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section
      className="relative h-screen flex items-center justify-center text-white overflow-hidden pt-20 sm:pt-0"
      aria-label="Hero Section"
    >
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: "url('assets/Background.png')"}}></div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/80 via-indigo-900/70 to-purple-900/80"></div>

      {/* Content Wrapper */}
      <div className="relative z-10 w-full max-w-7xl px-4 sm:px-6 lg:px-10 pt-16 sm:pt-24">
        <div className="grid lg:grid-cols-2 items-center gap-8 lg:gap-16">
          {/* Left Side */}
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-block">
              <span className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-semibold text-blue-200 mb-4 inline-block">
                ✨ AI-Powered Travel Planning
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-[1.1]">
              <span className="block text-white drop-shadow-2xl">Discover.</span>
              <span className="block bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent drop-shadow-2xl">Plan. Travel.</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-blue-100 font-semibold">
              Your Intelligent Travel Companion
            </p>
            <p className="text-sm lg:text-base text-blue-200/90 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Experience the future of travel planning with AI. From personalized itineraries to instant bookings, TravixAI makes every journey effortless.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center lg:items-start justify-center lg:justify-start">
              <div className="relative group">
                <button
                  onClick={onActivateAssistant}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  className={`relative z-10 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold rounded-xl bg-white text-blue-600 hover:bg-blue-50 shadow-2xl hover:shadow-white/20 transition-all duration-300 transform ${
                    isListening ? 'animate-pulse scale-105' : 'hover:scale-105'
                  }`}
                >
                  <div className="flex items-center gap-3 justify-center">
                    <i className="ri-mic-line text-xl sm:text-2xl"></i>
                    {isListening ? 'Listening...' : 'Start Planning'}
                  </div>
                </button>
                {(isListening || isHovered) && (
                  <div className="absolute inset-0 z-0 rounded-2xl bg-white/20 blur-2xl animate-ping" />
                )}
              </div>
              <button className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold rounded-xl bg-white/10 backdrop-blur-md border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center gap-2">
                  <i className="ri-play-circle-line text-xl sm:text-2xl"></i>
                  Watch Demo
                </div>
              </button>
            </div>
            <p className="text-sm text-blue-200 flex items-center gap-2 justify-center lg:justify-start">
              <i className="ri-sparkling-line"></i>
              Try: &ldquo;Plan my trip from Delhi to Manali&rdquo;
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-8 sm:mt-12">
              {[
                ['50K+', 'Trips Planned', 'ri-flight-takeoff-line'],
                ['4.9★', 'User Rating', 'ri-star-line'],
                ['24/7', 'AI Support', 'ri-customer-service-2-line'],
              ].map(([value, label, icon]) => (
                <div
                  key={label}
                  className="bg-white/10 backdrop-blur-xl p-3 sm:p-6 rounded-xl sm:rounded-2xl border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 transform hover:scale-105"
                >
                  <i className={`${icon} text-2xl sm:text-3xl text-blue-300 mb-1 sm:mb-2`}></i>
                  <div className="text-xl sm:text-3xl font-extrabold text-white">{value}</div>
                  <div className="text-xs sm:text-sm text-blue-200 font-medium">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Animated Dashboard Preview */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative w-full max-w-lg">
              {/* Floating Cards Animation */}
              <div className="relative h-[500px]">
                {/* Main Card */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20 animate-float">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <Plane className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Your Next Trip</h3>
                      <p className="text-sm text-gray-500">AI Planned</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin size={16} className="text-blue-600" />
                      <span className="text-sm">Delhi → Manali</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar size={16} className="text-blue-600" />
                      <span className="text-sm">Dec 25 - Dec 30</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Users size={16} className="text-blue-600" />
                      <span className="text-sm">2 Travelers</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Total Cost</span>
                      <span className="text-2xl font-bold text-gray-900">₹24,500</span>
                    </div>
                  </div>
                </div>

                {/* Floating Stat Card 1 */}
                <div className="absolute top-8 right-0 w-48 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-xl p-4 animate-float-delayed">
                  <TrendingUp className="text-white mb-2" size={24} />
                  <div className="text-white text-2xl font-bold">50K+</div>
                  <div className="text-white/90 text-sm">Happy Travelers</div>
                </div>

                {/* Floating Stat Card 2 */}
                <div className="absolute bottom-8 left-0 w-48 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl shadow-xl p-4 animate-float-slow">
                  <Sparkles className="text-white mb-2" size={24} />
                  <div className="text-white text-2xl font-bold">AI Powered</div>
                  <div className="text-white/90 text-sm">Smart Planning</div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-20 left-10 w-20 h-20 bg-blue-400/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Down Icon */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex flex-col items-center gap-1 sm:gap-2 animate-bounce">
          <span className="text-xs text-blue-200 font-semibold hidden sm:block">Explore More</span>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center">
            <i className="ri-arrow-down-line text-white text-lg sm:text-xl"></i>
          </div>
        </div>
      </div>
    </section>
  );
}
