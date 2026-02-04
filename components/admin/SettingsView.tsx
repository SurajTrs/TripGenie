'use client';

import { useState, useEffect } from 'react';
import { Save, Key, Bell, Shield } from 'lucide-react';

export default function SettingsView() {
  const [settings, setSettings] = useState({
    rapidApiKey: '',
    stripeKey: '',
    geminiKey: '',
    emailNotifications: true,
    smsAlerts: true,
    weeklyReports: false,
    twoFactor: true,
    sessionTimeout: true
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('adminSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    } else {
      setSettings(prev => ({
        ...prev,
        rapidApiKey: process.env.NEXT_PUBLIC_RAPIDAPI_KEY || '',
        stripeKey: process.env.NEXT_PUBLIC_STRIPE_KEY || '',
        geminiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
      }));
    }
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    setTimeout(() => {
      setIsSaving(false);
      alert('Settings saved successfully!');
    }, 500);
  };
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Key className="text-blue-600" size={24} />
          <h3 className="text-lg font-bold text-gray-900">API Configuration</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">RapidAPI Key</label>
            <input
              type="password"
              value={settings.rapidApiKey}
              onChange={(e) => setSettings({...settings, rapidApiKey: e.target.value})}
              placeholder="Enter RapidAPI Key"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stripe Secret Key</label>
            <input
              type="password"
              value={settings.stripeKey}
              onChange={(e) => setSettings({...settings, stripeKey: e.target.value})}
              placeholder="Enter Stripe Secret Key"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gemini API Key</label>
            <input
              type="password"
              value={settings.geminiKey}
              onChange={(e) => setSettings({...settings, geminiKey: e.target.value})}
              placeholder="Enter Gemini API Key"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="text-blue-600" size={24} />
          <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
        </div>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-gray-700">Email notifications for new bookings</span>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-gray-700">SMS alerts for payment failures</span>
            <input
              type="checkbox"
              checked={settings.smsAlerts}
              onChange={(e) => setSettings({...settings, smsAlerts: e.target.checked})}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-gray-700">Weekly revenue reports</span>
            <input
              type="checkbox"
              checked={settings.weeklyReports}
              onChange={(e) => setSettings({...settings, weeklyReports: e.target.checked})}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="text-blue-600" size={24} />
          <h3 className="text-lg font-bold text-gray-900">Security</h3>
        </div>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-gray-700">Two-factor authentication</span>
            <input
              type="checkbox"
              checked={settings.twoFactor}
              onChange={(e) => setSettings({...settings, twoFactor: e.target.checked})}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-gray-700">Session timeout (30 minutes)</span>
            <input
              type="checkbox"
              checked={settings.sessionTimeout}
              onChange={(e) => setSettings({...settings, sessionTimeout: e.target.checked})}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
      >
        <Save size={20} />
        {isSaving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}
