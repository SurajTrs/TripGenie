'use client';

interface ServicesSectionProps {
  onActivateAssistant?: () => void;
}

export default function ServicesSection({ onActivateAssistant }: ServicesSectionProps) {
  const services = [
    {
      title: 'Pre-Trip Planning',
      description: 'Complete trip planning with AI-powered destination research and custom itineraries.',
      icon: 'ri-map-2-line',
      color: 'from-blue-500 to-cyan-500',
      features: ['Destination Research', 'Visa & Docs', 'Budget Planning']
    },
    {
      title: 'Real-Time Booking',
      description: 'Instant bookings for flights, hotels, trains, and buses with live pricing.',
      icon: 'ri-calendar-check-line',
      color: 'from-violet-500 to-purple-500',
      features: ['Live Pricing', 'Instant Confirm', 'Best Deals']
    },
    {
      title: 'Travel Support',
      description: '24/7 AI assistance with real-time updates and emergency support.',
      icon: 'ri-customer-service-2-line',
      color: 'from-pink-500 to-rose-500',
      features: ['24/7 Support', 'Live Updates', 'Emergency Help']
    }
  ];

  return (
    <section id="how-it-works" className="py-16 bg-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-bold inline-block mb-6">
            🚀 SERVICES
          </span>
          <h2 className="text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Complete Travel Solution
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From planning to memories, we handle everything
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => (
            <div key={index} className="group relative bg-gradient-to-br from-gray-50 to-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-200 hover:border-blue-300 hover:-translate-y-3">
              <div className={`w-20 h-20 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                <i className={`${service.icon} text-4xl text-white`}></i>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {service.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed text-lg mb-6">
                {service.description}
              </p>
              
              <div className="space-y-2 mb-6">
                {service.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-gray-700">
                    <i className="ri-check-line text-green-500 font-bold"></i>
                    <span className="font-medium">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-indigo-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            </div>
          ))}
        </div>
        
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-white text-center shadow-2xl">
          <h3 className="text-4xl font-extrabold mb-4">Ready to Start Your Journey?</h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of travelers who trust TravixAI for seamless adventures
          </p>
          <button 
            onClick={onActivateAssistant}
            className="px-10 py-5 bg-white text-blue-600 font-bold rounded-2xl hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 text-lg"
          >
            <span className="flex items-center gap-2 justify-center">
              <i className="ri-mic-line text-2xl"></i>
              Start Planning Now
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
