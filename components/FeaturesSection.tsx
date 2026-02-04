'use client';

export default function FeaturesSection() {
  const features = [
    {
      icon: 'ri-search-line',
      title: 'Smart Search & Compare',
      description: 'AI-powered search across flights, trains, buses with real-time pricing.',
      color: 'from-violet-500 to-purple-500'
    },
    {
      icon: 'ri-hotel-line',
      title: 'Hotel Booking',
      description: 'Best-rated hotels with personalized recommendations instantly.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: 'ri-map-pin-line',
      title: 'Smart Itineraries',
      description: 'AI-generated travel plans tailored to your preferences.',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: 'ri-bank-card-line',
      title: 'Secure Payments',
      description: 'Safe payment processing with instant confirmation.',
      color: 'from-orange-500 to-yellow-500'
    },
    {
      icon: 'ri-global-line',
      title: 'Multilingual',
      description: '25+ languages with real-time voice translation.',
      color: 'from-green-500 to-teal-500'
    },
    {
      icon: 'ri-mic-line',
      title: 'Voice Control',
      description: 'Hands-free travel management with natural language.',
      color: 'from-blue-500 to-indigo-500'
    }
  ];

  return (
    <section id="features" className="py-16 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-200 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-bold inline-block mb-6">
            ✨ FEATURES
          </span>
          <h2 className="text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Everything You Need
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful AI features designed to make travel planning effortless
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-200 hover:border-blue-300 hover:-translate-y-2">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                <i className={`${feature.icon} text-3xl text-white`}></i>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed text-lg">
                {feature.description}
              </p>
              
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-indigo-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            </div>
          ))}
        </div>
        
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <i className="ri-sparkle-line text-2xl"></i>
            <span className="font-bold text-lg">Powered by Advanced AI</span>
          </div>
        </div>
      </div>
    </section>
  );
}
