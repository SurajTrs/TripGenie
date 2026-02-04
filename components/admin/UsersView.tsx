'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';

export default function UsersView({ searchTerm = '' }: { searchTerm?: string }) {
  const [users, setUsers] = useState<any[]>([]);
  const [localSearch, setLocalSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const effectiveSearch = searchTerm || localSearch;

  const fetchUsers = () => {
    setIsLoading(true);
    const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
    const bookings = JSON.parse(localStorage.getItem('allBookings') || '[]');
    
    const usersWithStats = allUsers.map((user: any) => {
      const userBookings = bookings.filter((b: any) => b.userId === user.id);
      const totalSpent = userBookings.reduce((sum: number, b: any) => sum + (b.amount || 0), 0);
      return {
        ...user,
        bookings: userBookings.length,
        spent: totalSpent,
        status: user.status || 'active',
        joined: user.createdAt || new Date().toISOString().split('T')[0]
      };
    });
    
    setUsers(usersWithStats);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
    u.phone?.toLowerCase().includes(effectiveSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="search"
            placeholder="Search users..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button onClick={fetchUsers} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
          <RefreshCw className={isLoading ? 'animate-spin' : ''} size={20} />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Bookings</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total Spent</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Joined</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Phone</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-900">{user.bookings}</td>
                <td className="px-6 py-4 text-gray-900 font-semibold">₹{user.spent.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                    user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{new Date(user.joined).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-gray-500 text-sm">{user.phone || 'N/A'}</td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
