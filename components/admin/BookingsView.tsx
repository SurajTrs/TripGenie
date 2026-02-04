'use client';

import { useState, useEffect } from 'react';
import { Search, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function BookingsView({ searchTerm = '' }: { searchTerm?: string }) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [localSearch, setLocalSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const effectiveSearch = searchTerm || localSearch;

  const fetchBookings = () => {
    setIsLoading(true);
    const allBookings = JSON.parse(localStorage.getItem('allBookings') || '[]');
    const users = JSON.parse(localStorage.getItem('allUsers') || '[]');
    
    const bookingsWithUser = allBookings.map((booking: any) => {
      const user = users.find((u: any) => u.id === booking.userId);
      return {
        ...booking,
        userName: user?.name || 'Unknown User',
        status: booking.status || 'confirmed'
      };
    });
    
    setBookings(bookingsWithUser);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredBookings = bookings.filter(b => 
    b.id?.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
    b.userName?.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
    b.from?.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
    b.to?.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
    b.type?.toLowerCase().includes(effectiveSearch.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'confirmed': return <CheckCircle size={16} className="text-green-600" />;
      case 'pending': return <Clock size={16} className="text-orange-600" />;
      case 'cancelled': return <XCircle size={16} className="text-red-600" />;
      default: return <CheckCircle size={16} className="text-green-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="search"
            placeholder="Search bookings..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button onClick={fetchBookings} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
          <RefreshCw className={isLoading ? 'animate-spin' : ''} size={20} />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Booking ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Route</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredBookings.length > 0 ? filteredBookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-mono text-sm text-blue-600 font-semibold">{booking.id}</td>
                <td className="px-6 py-4 text-gray-900">{booking.userName}</td>
                <td className="px-6 py-4 text-gray-900">{booking.from} → {booking.to}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold capitalize">
                    {booking.type || 'Flight'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{new Date(booking.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-gray-900 font-semibold">₹{booking.amount?.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(booking.status)}
                    <span className={`text-sm font-semibold capitalize ${
                      booking.status === 'confirmed' ? 'text-green-600' :
                      booking.status === 'pending' ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No bookings found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
