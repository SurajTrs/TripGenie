'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plane,
  Home,
  LayoutDashboard,
  Mic,
  Menu,
  X,
  User,
  Mail,
  MapPin,
  Calendar,
  Edit,
  Save,
  Camera,
  CreditCard,
  Bell,
  Shield,
  LogOut,
  Phone as PhoneIcon,
} from 'lucide-react';

export default function UserProfileDashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 9876543210',
    location: 'Mumbai, India',
    joinDate: 'January 2024',
    avatar: '',
  });
  const [editForm, setEditForm] = useState(user);
  const [cardForm, setCardForm] = useState({ number: '', name: '', expiry: '', cvv: '' });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsed = JSON.parse(userData);
        setUser({ ...user, ...parsed });
        setEditForm({ ...user, ...parsed });
      }
    }
  }, []);

  const handleVoiceAI = () => {
    const event = new CustomEvent('activateVoiceAssistant');
    window.dispatchEvent(event);
    setMobileMenuOpen(false);
  };

  const handleSave = () => {
    setUser(editForm);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(editForm));
    }
    setIsEditing(false);
  };

  const [stats, setStats] = useState([
    { label: 'Total Bookings', value: '0', icon: Plane, color: 'blue' },
    { label: 'Active Trips', value: '0', icon: MapPin, color: 'emerald' },
    { label: 'Saved Cards', value: '0', icon: CreditCard, color: 'indigo' },
    { label: 'Notifications', value: '0', icon: Bell, color: 'amber' },
  ]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStats = localStorage.getItem('userStats');
      if (userStats) {
        const parsed = JSON.parse(userStats);
        setStats([
          { label: 'Total Bookings', value: parsed.totalBookings || '0', icon: Plane, color: 'blue' },
          { label: 'Active Trips', value: parsed.activeTrips || '0', icon: MapPin, color: 'emerald' },
          { label: 'Saved Cards', value: parsed.savedCards || '0', icon: CreditCard, color: 'indigo' },
          { label: 'Notifications', value: parsed.notifications || '0', icon: Bell, color: 'amber' },
        ]);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-50 group-hover:opacity-75 transition"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                  <Plane className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">TravixAI</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link href="/" className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition">
                <Home className="w-4 h-4" />
                Home
              </Link>
              <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg font-medium">
                <User className="w-4 h-4" />
                Profile
              </Link>
              <button onClick={handleVoiceAI} className="flex items-center gap-2 px-4 py-2 ml-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition">
                <Mic className="w-4 h-4" />
                Voice AI
              </button>
            </nav>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-200">
              <nav className="flex flex-col gap-2">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-blue-50 rounded-lg transition">
                  <Home className="w-5 h-5" />
                  Home
                </Link>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-blue-50 rounded-lg transition">
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </Link>
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-50 rounded-lg">
                  <User className="w-5 h-5" />
                  Profile
                </Link>
                <button onClick={handleVoiceAI} className="flex items-center gap-3 px-4 py-3 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium">
                  <Mic className="w-5 h-5" />
                  Voice AI
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Profile Header */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
            <div className="px-6 md:px-8 pb-8">
              <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16">
                <div className="relative group">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="w-16 h-16 text-white" />
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:bg-slate-50 transition">
                    <Camera className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-slate-800">{user.name}</h1>
                  <p className="text-slate-600 mt-1">Travel Enthusiast</p>
                </div>
                <button
                  onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition font-medium"
                >
                  {isEditing ? <Save className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
                  {isEditing ? 'Save' : 'Edit Profile'}
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map((item, i) => (
              <div key={i} className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm">{item.label}</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">{item.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-${item.color}-100`}>
                    <item.icon className={`w-7 h-7 text-${item.color}-600`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Information */}
            <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Profile Information</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <User className="w-4 h-4" />
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    ) : (
                      <p className="text-slate-800 font-medium">{user.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    ) : (
                      <p className="text-slate-800 font-medium">{user.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <PhoneIcon className="w-4 h-4" />
                      Phone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    ) : (
                      <p className="text-slate-800 font-medium">{user.phone}</p>
                    )}
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <MapPin className="w-4 h-4" />
                      Location
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.location}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                    ) : (
                      <p className="text-slate-800 font-medium">{user.location}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Calendar className="w-4 h-4" />
                    Member Since
                  </label>
                  <p className="text-slate-800 font-medium">{user.joinDate}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Link href="/" className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition font-medium">
                    <Plane className="w-5 h-5" />
                    Book New Trip
                  </Link>
                  <button onClick={() => document.getElementById('payment')?.scrollIntoView({ behavior: 'smooth' })} className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 text-slate-700 rounded-xl hover:bg-slate-100 transition font-medium">
                    <CreditCard className="w-5 h-5" />
                    Payment Methods
                  </button>
                  <button onClick={() => document.getElementById('notifications')?.scrollIntoView({ behavior: 'smooth' })} className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 text-slate-700 rounded-xl hover:bg-slate-100 transition font-medium">
                    <Bell className="w-5 h-5" />
                    Notifications
                  </button>
                  <button onClick={() => document.getElementById('security')?.scrollIntoView({ behavior: 'smooth' })} className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 text-slate-700 rounded-xl hover:bg-slate-100 transition font-medium">
                    <Shield className="w-5 h-5" />
                    Security Settings
                  </button>
                  <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/login'; }} className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition font-medium">
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div id="payment" className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Payment Methods</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border-2 border-slate-200 rounded-xl hover:border-blue-500 transition">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">•••• •••• •••• 4242</p>
                    <p className="text-sm text-slate-600">Expires 12/25</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Default</span>
              </div>
              <button onClick={() => setShowCardModal(true)} className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-blue-500 hover:text-blue-600 transition font-medium">
                + Add New Card
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div id="notifications" className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Notification Preferences</h2>
            <div className="space-y-4">
              {[
                { label: 'Email Notifications', desc: 'Receive booking confirmations via email' },
                { label: 'SMS Alerts', desc: 'Get trip updates via text message' },
                { label: 'Push Notifications', desc: 'Mobile app notifications' },
                { label: 'Marketing Emails', desc: 'Receive offers and promotions' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                  <div>
                    <p className="font-semibold text-slate-800">{item.label}</p>
                    <p className="text-sm text-slate-600">{item.desc}</p>
                  </div>
                  <label className="relative inline-block w-12 h-6">
                    <input type="checkbox" defaultChecked={i < 2} className="sr-only peer" />
                    <span className="absolute inset-0 bg-slate-300 rounded-full peer-checked:bg-blue-600 transition cursor-pointer"></span>
                    <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-6"></span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Security Settings */}
          <div id="security" className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Security Settings</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Current Password</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm New Password</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
              </div>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition font-medium">
                Update Password
              </button>
              <div className="pt-6 border-t border-slate-200">
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                  <div>
                    <p className="font-semibold text-slate-800">Two-Factor Authentication</p>
                    <p className="text-sm text-slate-600">Add an extra layer of security</p>
                  </div>
                  <label className="relative inline-block w-12 h-6">
                    <input type="checkbox" className="sr-only peer" />
                    <span className="absolute inset-0 bg-slate-300 rounded-full peer-checked:bg-blue-600 transition cursor-pointer"></span>
                    <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-6"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Card Modal */}
      {showCardModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in duration-200">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Add Payment Card</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  value={cardForm.number}
                  onChange={(e) => setCardForm({ ...cardForm, number: e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim() })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={cardForm.name}
                  onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    maxLength={5}
                    value={cardForm.expiry}
                    onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2') })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    maxLength={3}
                    value={cardForm.cvv}
                    onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowCardModal(false); setCardForm({ number: '', name: '', expiry: '', cvv: '' }); }}
                className="flex-1 px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowCardModal(false); setCardForm({ number: '', name: '', expiry: '', cvv: '' }); }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition font-medium"
              >
                Add Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
