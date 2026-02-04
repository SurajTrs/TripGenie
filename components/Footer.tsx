'use client';

export default function Footer() {
  const footerLinks = {
    'Product': ['Features', 'AI Assistant', 'Pricing', 'Enterprise'],
    'Support': ['Help Center', 'Contact', 'Documentation'],
    'Company': ['About', 'Careers', 'Blog'],
    'Legal': ['Privacy', 'Terms', 'Security']
  };

  const socialLinks = [
    { icon: 'ri-facebook-fill', href: '#' },
    { icon: 'ri-twitter-x-line', href: '#' },
    { icon: 'ri-instagram-line', href: '#' },
    { icon: 'ri-linkedin-fill', href: '#' }
  ];

  return (
    <footer id="contact" className="bg-gradient-to-b from-gray-900 to-black text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <i className="ri-plane-line text-white text-2xl"></i>
              </div>
              <h2 className="text-3xl font-extrabold" style={{ fontFamily: 'Pacifico, serif' }}>
                TravixAI
              </h2>
            </div>
            <p className="text-gray-400 mb-8 leading-relaxed text-lg">
              AI-powered travel companion making every journey seamless and memorable.
            </p>
            
            <div className="flex items-center gap-3 mb-8">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-12 h-12 bg-white/10 hover:bg-gradient-to-br hover:from-blue-600 hover:to-indigo-600 rounded-xl flex items-center justify-center transition-all duration-300 backdrop-blur-sm border border-white/10 hover:scale-110"
                >
                  <i className={`${social.icon} text-xl`}></i>
                </a>
              ))}
            </div>
            
            <div className="flex flex-col gap-3">
              <button className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-5 py-3 hover:bg-white/20 transition-all duration-300 group">
                <i className="ri-google-play-fill text-3xl group-hover:scale-110 transition-transform"></i>
                <div className="text-left">
                  <div className="text-xs text-gray-400">Get it on</div>
                  <div className="text-sm font-bold">Google Play</div>
                </div>
              </button>
              <button className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-5 py-3 hover:bg-white/20 transition-all duration-300 group">
                <i className="ri-apple-fill text-3xl group-hover:scale-110 transition-transform"></i>
                <div className="text-left">
                  <div className="text-xs text-gray-400">Download on</div>
                  <div className="text-sm font-bold">App Store</div>
                </div>
              </button>
            </div>
          </div>
          
          {/* Links Sections */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-bold text-lg mb-6 text-white">{title}</h3>
              <ul className="space-y-3">
                {links.map((link, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors text-base hover:translate-x-1 inline-block duration-200"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="border-t border-white/10 pt-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <p className="text-gray-400 text-sm">
                © 2024 TravixAI. All rights reserved.
              </p>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400 font-semibold">All systems operational</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <i className="ri-shield-check-line text-green-400"></i>
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <i className="ri-award-line text-violet-400"></i>
                <span>ISO Certified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
