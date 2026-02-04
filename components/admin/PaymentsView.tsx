'use client';

import { useState, useEffect } from 'react';
import { CreditCard, TrendingUp, DollarSign, RefreshCw } from 'lucide-react';

export default function PaymentsView({ searchTerm = '' }: { searchTerm?: string }) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({ todayRevenue: 0, todayTransactions: 0, successRate: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchPayments = () => {
    setIsLoading(true);
    const bookings = JSON.parse(localStorage.getItem('allBookings') || '[]');
    const users = JSON.parse(localStorage.getItem('allUsers') || '[]');
    
    const today = new Date().toDateString();
    const todayBookings = bookings.filter((b: any) => new Date(b.date).toDateString() === today);
    const todayRevenue = todayBookings.reduce((sum: number, b: any) => sum + (b.amount || 0), 0);
    
    const txns = bookings.map((booking: any, idx: number) => {
      const user = users.find((u: any) => u.id === booking.userId);
      return {
        id: `TXN${String(idx + 1).padStart(3, '0')}`,
        user: user?.name || 'Unknown User',
        amount: booking.amount || 0,
        method: booking.paymentMethod || 'UPI',
        date: new Date(booking.date).toLocaleString(),
        status: booking.paymentStatus || 'success'
      };
    });
    
    const successCount = txns.filter(t => t.status === 'success').length;
    const successRate = txns.length > 0 ? ((successCount / txns.length) * 100).toFixed(1) : '0';
    
    setStats({
      todayRevenue,
      todayTransactions: todayBookings.length,
      successRate: parseFloat(successRate)
    });
    setAllTransactions(txns);
    setTransactions(txns.slice(-10).reverse());
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPayments();
    const interval = setInterval(fetchPayments, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = allTransactions.filter(t =>
        t.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.method?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setTransactions(filtered);
    } else {
      setTransactions(allTransactions.slice(-10).reverse());
    }
  }, [searchTerm, allTransactions]);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={fetchPayments} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
          <RefreshCw className={isLoading ? 'animate-spin' : ''} size={20} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <DollarSign className="text-white" size={24} />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium">Today's Revenue</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">₹{(stats.todayRevenue / 1000).toFixed(1)}K</p>
          <p className="text-green-600 text-sm font-semibold mt-2">+18.2% from yesterday</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <CreditCard className="text-white" size={24} />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium">Transactions</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.todayTransactions}</p>
          <p className="text-blue-600 text-sm font-semibold mt-2">+12.5% from yesterday</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-white" size={24} />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium">Success Rate</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.successRate}%</p>
          <p className="text-purple-600 text-sm font-semibold mt-2">+2.1% from yesterday</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Transaction ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Method</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date & Time</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.length > 0 ? transactions.map((txn) => (
              <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-mono text-sm text-blue-600 font-semibold">{txn.id}</td>
                <td className="px-6 py-4 text-gray-900">{txn.user}</td>
                <td className="px-6 py-4 text-gray-900 font-semibold">₹{txn.amount.toLocaleString()}</td>
                <td className="px-6 py-4 text-gray-600 capitalize">{txn.method}</td>
                <td className="px-6 py-4 text-gray-500 text-sm">{txn.date}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                    txn.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {txn.status}
                  </span>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No transactions found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
