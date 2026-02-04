'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { Plane, Hotel, Calendar, CreditCard, MapPin, Clock } from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Mock bookings data - replace with real API call
    setBookings([
      {
        id: 'BK001',
        type: 'flight',
        from: 'Delhi',
        to: 'Mumbai',
        date: '2024-02-15',
        status: 'confirmed',
        amount: 7508,
        airline: 'Air India',
        flightNumber: 'AI 2592'
      },
      {
        id: 'BK002',
        type: 'hotel',
        location: 'Mumbai',
        checkIn: '2024-02-15',
        checkOut: '2024-02-17',
        status: 'confirmed',
        amount: 3200,
        hotelName: 'The Taj Mahal Palace'
      }
    ]);
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please login to view dashboard</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, {user.name}!</h1>
          <p className="text-gray-600">Manage your bookings and travel plans</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <Plane className="w-8 h-8 mb-3" />
            <p className="text-2xl font-bold">{bookings.filter(b => b.type === 'flight').length}</p>
            <p className="text-blue-100">Flight Bookings</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
            <Hotel className="w-8 h-8 mb-3" />
            <p className="text-2xl font-bold">{bookings.filter(b => b.type === 'hotel').length}</p>
            <p className="text-orange-100">Hotel Bookings</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
            <Calendar className="w-8 h-8 mb-3" />
            <p className="text-2xl font-bold">{bookings.length}</p>
            <p className="text-green-100">Total Trips</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
            <CreditCard className="w-8 h-8 mb-3" />
            <p className="text-2xl font-bold">₹{bookings.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}</p>
            <p className="text-purple-100">Total Spent</p>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Bookings</h2>
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {booking.type === 'flight' ? (
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Plane className="w-6 h-6 text-blue-600" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <Hotel className="w-6 h-6 text-orange-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-800">
                        {booking.type === 'flight' ? `${booking.from} → ${booking.to}` : booking.hotelName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {booking.type === 'flight' ? `${booking.airline} ${booking.flightNumber}` : `${booking.location}`}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {booking.type === 'flight' ? booking.date : `${booking.checkIn} - ${booking.checkOut}`}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-800">₹{booking.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Booking ID: {booking.id}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
