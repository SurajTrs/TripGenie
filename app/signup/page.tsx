'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/authStore';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const router = useRouter();
  const { signup, isLoading, error, clearError } = useAuthStore();
  
  useEffect(() => {
    // Clear any previous auth errors when component mounts
    clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (formData.password !== formData.confirmPassword) {
      // Use the store's error state
      useAuthStore.setState({ error: 'Passwords do not match' });
      return;
    }

    const userData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password
    };

    await signup(userData);
    
    // If no error after signup attempt, redirect to login
    if (!useAuthStore.getState().error) {
      router.push('/login?message=Account created successfully! Please log in.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full mb-4">
              <i className="ri-user-add-line text-3xl text-white"></i>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">Create Account</h1>
            <p className="text-gray-600 text-lg">Start your journey with TravixAI</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
                         <div className="grid grid-cols-2 gap-4">
               <div>
                 <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                   First Name
                 </label>
                 <input
                   id="firstName"
                   type="text"
                   required
                   value={formData.firstName}
                   onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                   placeholder="John"
                 />
               </div>
               <div>
                 <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                   Last Name
                 </label>
                 <input
                   id="lastName"
                   type="text"
                   required
                   value={formData.lastName}
                   onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                   placeholder="Doe"
                 />
               </div>
             </div>

             <div>
               <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                 Email Address
               </label>
               <div className="relative">
                 <i className="ri-mail-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                 <input
                   id="email"
                   type="email"
                   required
                   value={formData.email}
                   onChange={(e) => setFormData({...formData, email: e.target.value})}
                   className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                   placeholder="you@example.com"
                 />
               </div>
             </div>

             <div>
               <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                 Phone Number
               </label>
               <div className="relative">
                 <i className="ri-phone-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                 <input
                   id="phone"
                   type="tel"
                   required
                   value={formData.phone}
                   onChange={(e) => setFormData({...formData, phone: e.target.value})}
                   className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                   placeholder="+1 (555) 000-0000"
                 />
               </div>
             </div>

             <div>
               <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                 Password
               </label>
               <div className="relative">
                 <i className="ri-lock-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                 <input
                   id="password"
                   type="password"
                   required
                   value={formData.password}
                   onChange={(e) => setFormData({...formData, password: e.target.value})}
                   className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                   placeholder="••••••••"
                 />
               </div>
             </div>

             <div>
               <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                 Confirm Password
               </label>
               <div className="relative">
                 <i className="ri-lock-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                 <input
                   id="confirmPassword"
                   type="password"
                   required
                   value={formData.confirmPassword}
                   onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                   className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                   placeholder="••••••••"
                 />
               </div>
             </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold py-4 px-4 rounded-xl hover:from-violet-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating Account...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <i className="ri-user-add-line"></i>
                  Create Account
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>
            <Link href="/login" className="block w-full text-center py-3 px-4 border-2 border-violet-600 text-violet-600 font-semibold rounded-xl hover:bg-violet-50 transition-all duration-200">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
