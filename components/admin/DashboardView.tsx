'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Users, Plane, DollarSign, RefreshCw, Calendar, MapPin, Clock } from 'lucide-react';

export default function DashboardView({ searchTerm = '' }: { searchTerm?: string }) {
  const [stats, setStats] = useState([
    { label: 'Total Revenue', value: '₹0', change: '+0%', icon: DollarSign, color: 'from-green-500 to-emerald-600' },
    { label: 'Total Bookings', value: '0', change: '+0%', icon: Plane, color: 'from-blue-500 to-indigo-600' },
    { label: 'Active Users', value: '0', change: '+0%', icon: Users, color: 'from-purple-500 to-pink-600' },
    { label: 'Growth Rate', value: '0%', change: '+0%', icon: TrendingUp, color: 'from-orange-500 to-red-600' },
  ]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [topRoutes, setTopRoutes] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const users = JSON.parse(localStorage.getItem('allUsers') || '[]');
      const bookings = JSON.parse(localStorage.getItem('allBookings') || '[]');
      
      const totalRevenue = bookings.reduce((sum: number, b: any) => sum + (b.amount || 0), 0);
      const activeUsers = users.filter((u: any) => u.status === 'active').length;
      
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      const lastMonthBookings = bookings.filter((b: any) => new Date(b.date) > lastMonth).length;
      const growthRate = bookings.length > 0 ? ((lastMonthBookings / bookings.length) * 100).toFixed(1) : '0';
      
      // Calculate revenue trend
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dayBookings = bookings.filter((b: any) => {
          const bookingDate = new Date(b.date);
          return bookingDate.toDateString() === date.toDateString();
        });
        return dayBookings.reduce((sum: number, b: any) => sum + (b.amount || 0), 0);
      });
      
      // Find top routes
      const routeMap = new Map();
      bookings.forEach((b: any) => {
        const route = `${b.from} → ${b.to}`;
        routeMap.set(route, (routeMap.get(route) || 0) + 1);
      });
      const topRoutesData = Array.from(routeMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([route, count]) => ({ route, count }));
      
      setStats([
        { label: 'Total Revenue', value: `₹${(totalRevenue / 100000).toFixed(1)}L`, change: '+12.5%', icon: DollarSign, color: 'from-green-500 to-emerald-600' },
        { label: 'Total Bookings', value: bookings.length.toString(), change: '+8.2%', icon: Plane, color: 'from-blue-500 to-indigo-600' },
        { label: 'Active Users', value: activeUsers.toString(), change: '+15.3%', icon: Users, color: 'from-purple-500 to-pink-600' },
        { label: 'Growth Rate', value: `${growthRate}%`, change: '+4.1%', icon: TrendingUp, color: 'from-orange-500 to-red-600' },
      ]);
      
      setRecentBookings(bookings.slice(-5).reverse());
      setTopRoutes(topRoutesData);
      setRevenueData(last7Days);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
        <button
          onClick={fetchDashboardData}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          <RefreshCw className={isLoading ? 'animate-spin' : ''} size={16} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="text-white" size={24} />
              </div>
              <span className="text-green-600 text-sm font-semibold">{stat.change}</span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">{stat.label}</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="text-blue-600" size={20} />
            Revenue Trend (Last 7 Days)
          </h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {revenueData.map((revenue, i) => {
              const maxRevenue = Math.max(...revenueData, 1);
              const height = (revenue / maxRevenue) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs font-semibold text-gray-600">₹{(revenue / 1000).toFixed(1)}K</div>
                  <div 
                    className="w-full bg-gradient-to-t from-blue-500 to-indigo-600 rounded-t-lg transition-all hover:opacity-80" 
                    style={{ height: `${Math.max(height, 5)}%` }}
                  ></div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-4 text-sm text-gray-500">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <span key={day} className="flex-1 text-center">{day}</span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="text-blue-600" size={20} />
            Top Routes
          </h3>
          <div className="space-y-3">
            {topRoutes.length > 0 ? topRoutes.map((route, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {i + 1}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{route.route}</span>
                </div>
                <span className="text-sm font-semibold text-blue-600">{route.count} trips</span>
              </div>
            )) : (
              <p className="text-gray-500 text-center py-8 text-sm">No routes data yet</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="text-blue-600" size={20} />
            Recent Bookings
          </h3>
          <div className="space-y-4">
            {recentBookings.length > 0 ? (
              recentBookings.map((booking, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Plane className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{booking.from} → {booking.to}</p>
                      <p className="text-sm text-gray-500">{booking.userName || 'User'} • {new Date(booking.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="text-green-600 font-semibold">₹{booking.amount?.toLocaleString()}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No bookings yet</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="text-blue-600" size={20} />
            Quick Stats
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Avg Booking Value</p>
                <p className="text-2xl font-bold text-gray-900">₹{recentBookings.length > 0 ? (recentBookings.reduce((sum, b) => sum + (b.amount || 0), 0) / recentBookings.length).toFixed(0) : '0'}</p>
              </div>
              <DollarSign className="text-green-600" size={32} />
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Today&apos;s Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{recentBookings.filter(b => new Date(b.date).toDateString() === new Date().toDateString()).length}</p>
              </div>
              <Plane className="text-blue-600" size={32} />
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Pending Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{recentBookings.filter(b => b.status === 'pending').length}</p>
              </div>
              <Clock className="text-purple-600" size={32} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
