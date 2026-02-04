'use client';

import { useState, useEffect } from 'react';
import {
  Phone,
  PhoneCall,
  PhoneOff,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  Search,
  X,
  Menu,
  Home,
  LayoutDashboard,
  Mic,
  Plane,
} from 'lucide-react';
import Link from 'next/link';

interface Call {
  sid: string;
  to: string;
  from: string;
  status: string;
  startTime: string;
  endTime?: string;
  duration?: string;
  direction: 'inbound' | 'outbound' | 'outbound-api';
}

interface CallStats {
  total: number;
  completed: number;
  inProgress: number;
  failed: number;
  avgDuration: string;
}

export default function CallManagementDashboard() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showInitiateForm, setShowInitiateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState<CallStats>({
    total: 0,
    completed: 0,
    inProgress: 0,
    failed: 0,
    avgDuration: '0',
  });
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Form fields
  const [callType, setCallType] = useState<string>('booking_confirmation');
  const [phoneNumber, setPhoneNumber] = useState<string>('+91');
  const [bookingId, setBookingId] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [transportType, setTransportType] = useState<string>('Flight');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleVoiceAI = () => {
    const event = new CustomEvent('activateVoiceAssistant');
    window.dispatchEvent(event);
    setMobileMenuOpen(false);
  };

  // Fetch calls on mount + every 10s
  useEffect(() => {
    fetchCalls();
    const interval = setInterval(fetchCalls, 10000);
    return () => clearInterval(interval);
  }, []);

  // Recalculate stats whenever calls change
  useEffect(() => {
    calculateStats();
  }, [calls]);

  const calculateStats = () => {
    const total = calls.length;
    const completed = calls.filter((c) => c.status === 'completed').length;
    const inProgress = calls.filter((c) =>
      ['in-progress', 'ringing', 'queued'].includes(c.status)
    ).length;
    const failed = calls.filter((c) =>
      ['failed', 'busy', 'no-answer', 'canceled'].includes(c.status)
    ).length;

    const durations = calls
      .filter((c) => c.duration)
      .map((c) => parseInt(c.duration || '0', 10));
    const avgDuration =
      durations.length > 0
        ? Math.round(
            durations.reduce((a, b) => a + b, 0) / durations.length
          ).toString()
        : '0';

    setStats({ total, completed, inProgress, failed, avgDuration });
  };

  const fetchCalls = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/voice/manage?limit=50');
      const data = await res.json();
      if (data.success && Array.isArray(data.calls)) {
        setCalls(data.calls);
      }
    } catch (err) {
      console.error('Failed to fetch calls:', err);
      showNotification('error', 'Failed to load calls');
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (
    type: 'success' | 'error',
    message: string,
    timeout = 5000
  ) => {
    setNotification({ type, message });
    if (timeout > 0) {
      setTimeout(() => setNotification(null), timeout);
    }
  };

  const resetForm = () => {
    setPhoneNumber('+91');
    setBookingId('');
    setCustomerName('');
    setFrom('');
    setTo('');
    setDate('');
    setTransportType('Flight');
    setCustomMessage('');
  };

  const handleInitiateCall = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setNotification(null);

    const payload: any = {
      callType,
      phoneNumber,
      data: {},
    };

    if (callType === 'booking_confirmation') {
      payload.data = {
        bookingId: bookingId || 'N/A',
        customerName: customerName || 'Valued Customer',
        from: from || 'Origin',
        to: to || 'Destination',
        date: date || new Date().toISOString().split('T')[0],
        transportType,
      };
    } else if (callType === 'payment_reminder') {
      payload.data = {
        bookingId: bookingId || 'N/A',
        customerName: customerName || 'Customer',
        amount: 5000,
      };
    } else if (callType === 'flight_update') {
      payload.data = {
        bookingId: bookingId || 'N/A',
        customerName: customerName || 'Passenger',
        message: 'Your flight has been delayed by 2 hours',
      };
    } else if (callType === 'custom') {
      if (!customMessage.trim()) {
        showNotification('error', 'Custom message is required');
        setIsLoading(false);
        return;
      }
      payload.data = { message: customMessage.trim() };
    }

    try {
      const res = await fetch('/api/voice/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result.success) {
        showNotification(
          'success',
          `Call initiated! SID: ${result.callSid.substring(0, 12)}...`
        );
        setShowInitiateForm(false);
        resetForm();
        fetchCalls();
      } else {
        showNotification('error', result.error || 'Failed to initiate call');
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndCall = async (callSid: string) => {
    if (!confirm('Are you sure you want to end this call?')) return;

    try {
      const res = await fetch('/api/voice/manage', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callSid }),
      });

      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Call ended successfully');
        fetchCalls();
      } else {
        showNotification('error', data.error || 'Failed to end call');
      }
    } catch (err) {
      showNotification('error', 'Failed to end call');
    }
  };

  const filteredCalls = calls.filter((call) => {
    const matchesSearch =
      call.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.sid.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' || call.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'in-progress':
      case 'ringing':
        return <PhoneCall className="w-5 h-5 text-blue-600 animate-pulse" />;
      case 'failed':
      case 'busy':
      case 'no-answer':
      case 'canceled':
        return <XCircle className="w-5 h-5 text-rose-600" />;
      default:
        return <Clock className="w-5 h-5 text-amber-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const base = 'px-3 py-1.5 rounded-full text-xs font-semibold border';
    switch (status.toLowerCase()) {
      case 'completed':
        return `${base} bg-emerald-100 text-emerald-800 border-emerald-300`;
      case 'in-progress':
      case 'ringing':
        return `${base} bg-blue-100 text-blue-800 border-blue-300`;
      case 'failed':
      case 'busy':
      case 'no-answer':
      case 'canceled':
        return `${base} bg-100 text-rose-800 border-rose-300`;
      default:
        return `${base} bg-amber-100 text-amber-800 border-amber-300`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Professional Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-50 group-hover:opacity-75 transition"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                  <Plane className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">TravixAI</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/" className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition">
                <Home className="w-4 h-4" />
                Home
              </Link>
              <Link href="/call-management" className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg font-medium">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <button
                onClick={handleVoiceAI}
                className="flex items-center gap-2 px-4 py-2 ml-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition"
              >
                <Mic className="w-4 h-4" />
                Voice AI
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-200 animate-in slide-in-from-top duration-200">
              <nav className="flex flex-col gap-2">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"
                >
                  <Home className="w-5 h-5" />
                  Home
                </Link>
                <Link
                  href="/call-management"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-blue-600 bg-blue-50 rounded-lg"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </Link>
                <button
                  onClick={handleVoiceAI}
                  className="flex items-center gap-3 px-4 py-3 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium"
                >
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

          {/* Notification Toast */}
          {notification && (
            <div
              className={`fixed top-20 right-4 z-50 max-w-sm w-full p-4 rounded-xl shadow-2xl border animate-in slide-in-from-top-4 duration-300 ${
                notification.type === 'success'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              <div className="flex items-center gap-3">
                {notification.type === 'success' ? (
                  <CheckCircle className="w-6 h-6 flex-shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 flex-shrink-0" />
                )}
                <div>
                  <p className="font-bold">
                    {notification.type === 'success' ? 'Success' : 'Error'}
                  </p>
                  <p className="text-sm mt-0.5">{notification.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotification(null)}
                  className="ml-auto opacity-60 hover:opacity-100"
                  aria-label="Close notification"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-lg opacity-40"></div>
                  <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-2xl">
                    <Phone className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Call Management
                  </h1>
                  <p className="text-slate-600 mt-1">Real-time voice call dashboard</p>
                </div>
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                <button
                  onClick={fetchCalls}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-60 font-medium transition"
                >
                  <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  onClick={() => setShowInitiateForm(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition font-medium"
                >
                  <PhoneCall className="w-5 h-5" />
                  New Call
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {[
              { label: 'Total Calls', value: stats.total, icon: Activity, color: 'blue' },
              { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'emerald' },
              { label: 'In Progress', value: stats.inProgress, icon: PhoneCall, color: 'blue' },
              { label: 'Failed', value: stats.failed, icon: XCircle, color: 'rose' },
              { label: 'Avg Duration', value: `${stats.avgDuration}s`, icon: Clock, color: 'indigo' },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm">{item.label}</p>
                    <p className={`text-3xl font-bold mt-2 text-${item.color}-600`}>
                      {item.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl bg-${item.color}-100`}>
                    <item.icon className={`w-7 h-7 text-${item.color}-600`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Initiate Call Modal/Form */}
          {showInitiateForm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">Initiate New Call</h2>
                    <button
                      type="button"
                      onClick={() => setShowInitiateForm(false)}
                      className="text-slate-400 hover:text-slate-700"
                      aria-label="Close form"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleInitiateCall} className="space-y-6">
                    {/* Form content same as before, just cleaned up */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Call Type
                        </label>
                        <select
                          value={callType}
                          onChange={(e) => setCallType(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                          aria-label="Call type"
                        >
                          <option value="booking_confirmation">Booking Confirmation</option>
                          <option value="payment_reminder">Payment Reminder</option>
                          <option value="flight_update">Flight Update</option>
                          <option value="custom">Custom Message</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+919876543210"
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                        />
                      </div>
                    </div>

                    {/* Conditional fields */}
                    {callType !== 'custom' && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Booking ID
                            </label>
                            <input
                              type="text"
                              value={bookingId}
                              onChange={(e) => setBookingId(e.target.value)}
                              placeholder="TRIP-123456"
                              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Customer Name
                            </label>
                            <input
                              type="text"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              placeholder="John Doe"
                              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {callType === 'booking_confirmation' && (
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <input placeholder="From" value={from} onChange={(e) => setFrom(e.target.value)} className="px-4 py-3 border-2 rounded-xl" />
                        <input placeholder="To" value={to} onChange={(e) => setTo(e.target.value)} className="px-4 py-3 border-2 rounded-xl" />
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-4 py-3 border-2 rounded-xl" aria-label="Travel date" />
                        <select value={transportType} onChange={(e) => setTransportType(e.target.value)} className="px-4 py-3 border-2 rounded-xl" aria-label="Transport type">
                          <option>Flight</option>
                          <option>Train</option>
                          <option>Bus</option>
                          <option>Car</option>
                        </select>
                      </div>
                    )}

                    {callType === 'custom' && (
                      <textarea
                        required
                        rows={5}
                        placeholder="Type your message here..."
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                      />
                    )}

                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 disabled:opacity-60 transition"
                      >
                        {isLoading ? 'Calling...' : 'Make Call'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowInitiateForm(false)}
                        className="px-8 py-4 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Call History Table */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Call History</h2>
                  <p className="text-slate-500 text-sm">
                    {filteredCalls.length} of {calls.length} calls
                  </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    aria-label="Filter by status"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="in-progress">In Progress</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    {['Status', 'Phone', 'Direction', 'Started', 'Duration', 'Call ID', 'Actions'].map((h) => (
                      <th key={h} className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCalls.map((call) => (
                    <tr key={call.sid} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(call.status)}
                          <span className={getStatusBadge(call.status)}>
                            {call.status.replace('-', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">{call.to}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 capitalize">
                        {call.direction.replace('outbound-', '')}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(call.startTime).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {call.duration ? `${call.duration}s` : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                          {call.sid.slice(0, 15)}...
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        {(call.status === 'in-progress' || call.status === 'ringing') && (
                          <button
                            onClick={() => handleEndCall(call.sid)}
                            className="flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 text-sm font-medium transition"
                          >
                            <PhoneOff className="w-4 h-4" />
                            End
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!isLoading && filteredCalls.length === 0 && (
                <div className="text-center py-20">
                  <Phone className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">No calls found</p>
                </div>
              )}

              {isLoading && (
                <div className="text-center py-20">
                  <RefreshCw className="w-12 h-12 text-blue-600 mx-auto animate-spin" />
                  <p className="text-slate-500 mt-4">Loading calls...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}