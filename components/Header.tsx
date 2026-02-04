'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import { Plane, Menu, X, Mic, Home, LayoutDashboard, User, LogOut } from 'lucide-react';

// User interface is now imported from authStore

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }

    const handleScroll = () => {
      const heroSection = document.querySelector('section');
      if (heroSection) {
        const heroBottom = heroSection.offsetHeight;
        setIsScrolled(window.scrollY > heroBottom - 150);
      } else {
        setIsScrolled(window.scrollY > window.innerHeight - 150);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.profile-dropdown')) {
        setDropdownOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);



  const handleVoiceAI = () => {
    const event = new CustomEvent('activateVoiceAssistant');
    window.dispatchEvent(event);
    setMenuOpen(false);
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const section = document.querySelector(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMenuOpen(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setDropdownOpen(false);
    setMenuOpen(false);
    window.location.href = '/login';
  };

  return (
    <header className="fixed top-3 sm:top-6 left-3 sm:left-6 right-3 sm:right-6 z-50">
      <div className="max-w-7xl mx-auto bg-white/5 backdrop-blur-3xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/10">
        <div className="px-4 sm:px-8 flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-50 group-hover:opacity-75 transition"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Plane className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className={`text-lg sm:text-xl font-bold transition-colors duration-300 ${
              isScrolled ? 'text-slate-800' : 'text-white'
            }`}>TravixAI</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/" className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-white/15 backdrop-blur-sm rounded-full transition hover:bg-white/25 hover:shadow-md ${
              isScrolled ? 'text-slate-800' : 'text-white'
            }`}>
              <Home className="w-4 h-4" />
              Home
            </Link>
            <a href="#features" onClick={(e) => handleNavClick(e, '#features')} className={`px-5 py-2.5 text-sm font-medium hover:bg-white/15 backdrop-blur-sm rounded-full transition cursor-pointer ${
              isScrolled ? 'text-slate-700' : 'text-white/80 hover:text-white'
            }`}>Features</a>
            <a href="#how-it-works" onClick={(e) => handleNavClick(e, '#how-it-works')} className={`px-5 py-2.5 text-sm font-medium hover:bg-white/15 backdrop-blur-sm rounded-full transition cursor-pointer ${
              isScrolled ? 'text-slate-700' : 'text-white/80 hover:text-white'
            }`}>How It Works</a>
            <a href="#contact" onClick={(e) => handleNavClick(e, '#contact')} className={`px-5 py-2.5 text-sm font-medium hover:bg-white/15 backdrop-blur-sm rounded-full transition cursor-pointer ${
              isScrolled ? 'text-slate-700' : 'text-white/80 hover:text-white'
            }`}>Contact</a>
            <button
              onClick={handleVoiceAI}
              className="flex items-center gap-2 px-4 sm:px-6 py-2.5 ml-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300"
            >
              <Mic className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Voice AI</span>
              <span className="sm:hidden">AI</span>
            </button>
          </nav>

          {/* Auth/Profile (Desktop) */}
          <div className="hidden md:flex items-center gap-3 relative">
            {isMounted && user ? (
              <div className="relative profile-dropdown">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-white/15 backdrop-blur-sm rounded-full transition ${
                    isScrolled ? 'text-slate-700' : 'text-white'
                  }`}
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span>{user.name}</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 bg-white/5 backdrop-blur-3xl rounded-2xl shadow-2xl border border-white/10 p-3 w-72">
                    <div className="px-3 py-3 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className={`font-semibold text-sm ${
                            isScrolled ? 'text-slate-800' : 'text-white'
                          }`}>{user.name}</p>
                          <p className={`text-xs ${
                            isScrolled ? 'text-slate-600' : 'text-white/70'
                          }`}>{user.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="py-2">
                      <Link href="/profile" onClick={() => setDropdownOpen(false)} className={`flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-white/15 rounded-xl transition ${
                        isScrolled ? 'text-slate-700' : 'text-white'
                      }`}>
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>
                    </div>
                    <div className="border-t border-white/10 pt-2">
                      <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-red-500/15 rounded-xl transition ${
                          isScrolled ? 'text-red-600' : 'text-red-400'
                        }`}
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className={`px-6 py-2.5 text-sm font-medium hover:bg-white/15 backdrop-blur-sm rounded-full transition ${
                  isScrolled ? 'text-slate-700' : 'text-white'
                }`}>
                  Login
                </Link>
                <Link href="/signup" className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`md:hidden p-2.5 hover:bg-white/15 backdrop-blur-sm rounded-xl transition ${
              isScrolled ? 'text-slate-700' : 'text-white'
            }`}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-2 sm:mt-3 bg-white/5 backdrop-blur-3xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/10 mx-3 sm:mx-6 animate-in slide-in-from-top duration-300">
          <div className="px-3 sm:px-5 py-3 sm:py-4 space-y-2">
            <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-white bg-white/15 backdrop-blur-sm rounded-xl sm:rounded-2xl active:scale-95">
              <Home className="w-4 h-4 sm:w-5 sm:h-5" />
              Home
            </Link>
            <a href="#features" onClick={(e) => handleNavClick(e, '#features')} className="block px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-white/80 hover:bg-white/15 backdrop-blur-sm rounded-xl sm:rounded-2xl active:scale-95 cursor-pointer">Features</a>
            <a href="#how-it-works" onClick={(e) => handleNavClick(e, '#how-it-works')} className="block px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-white/80 hover:bg-white/15 backdrop-blur-sm rounded-xl sm:rounded-2xl active:scale-95 cursor-pointer">How It Works</a>
            <a href="#contact" onClick={(e) => handleNavClick(e, '#contact')} className="block px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-white/80 hover:bg-white/15 backdrop-blur-sm rounded-xl sm:rounded-2xl active:scale-95 cursor-pointer">Contact</a>
            <button
              onClick={handleVoiceAI}
              className="w-full flex items-center gap-3 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl sm:rounded-2xl shadow-lg active:scale-95"
            >
              <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
              Voice AI
            </button>
            <div className="border-t border-white/10 my-3"></div>
            {isMounted && user ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-red-400 hover:bg-red-500/15 backdrop-blur-sm rounded-xl sm:rounded-2xl active:scale-95"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                Logout
              </button>
            ) : isMounted && (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="block px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-white/80 hover:bg-white/15 backdrop-blur-sm rounded-xl sm:rounded-2xl active:scale-95">Login</Link>
                <Link href="/signup" onClick={() => setMenuOpen(false)} className="block px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl sm:rounded-2xl shadow-lg active:scale-95">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
