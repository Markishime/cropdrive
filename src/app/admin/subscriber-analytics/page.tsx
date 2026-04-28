'use client';

import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSpinner, faRefresh, faUsers, faGlobe, faSearch, faTimes,
  faSort, faSortUp, faSortDown, faCircle,
} from '@fortawesome/free-solid-svg-icons';

interface UserRecord {
  uid: string;
  name: string;
  email: string;
  phone: string;
  countryRegion: string;
  country: string;
  registrationDate: string | null;
  plan: string;
  uploadsUsed: number;
  uploadsLimit: number;
}

interface AnalyticsData {
  totalUsers: number;
  totalSubscribers: number;
  users: UserRecord[];
  growth: Array<{ month: string; count: number }>;
  geography: Array<{ country: string; count: number }>;
  priorityMarkets: { malaysia: number; indonesia: number };
  expansionMarkets: string[];
}

type SortField = 'name' | 'email' | 'country' | 'registrationDate' | 'plan';
type SortDir = 'asc' | 'desc';

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (field !== sortField) return <FontAwesomeIcon icon={faSort} className="w-3 h-3 text-gray-300 ml-1" />;
  return sortDir === 'asc'
    ? <FontAwesomeIcon icon={faSortUp} className="w-3 h-3 text-green-600 ml-1" />
    : <FontAwesomeIcon icon={faSortDown} className="w-3 h-3 text-green-600 ml-1" />;
}

export default function SubscriberAnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [sortField, setSortField] = useState<SortField>('registrationDate');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAnalytics = useCallback(async (authToken: string) => {
    const res = await fetch('/api/admin/subscriber-analytics', {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const json = await res.json();
    if (json?.success) {
      setData(json.data);
      setLastUpdated(new Date());
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/login'); return; }

    const run = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        const authToken = await currentUser.getIdToken();
        setToken(authToken);

        const adminRes = await fetch('/api/admin/check', { headers: { Authorization: `Bearer ${authToken}` } });
        const adminJson = await adminRes.json();
        if (!adminJson?.isAdmin) { router.replace('/dashboard'); return; }
        setIsAdmin(true);

        await fetchAnalytics(authToken);
      } finally {
        setLoadingData(false);
      }
    };
    run();
  }, [user, loading, router, fetchAnalytics]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!token || !isAdmin) return;
    intervalRef.current = setInterval(() => {
      fetchAnalytics(token);
    }, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [token, isAdmin, fetchAnalytics]);

  const handleRefresh = async () => {
    if (!token) return;
    setRefreshing(true);
    await fetchAnalytics(token);
    setRefreshing(false);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const maxGrowth = useMemo(() => Math.max(...(data?.growth.map((g) => g.count) || [1])), [data]);

  const countries = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.users.map((u) => u.country).filter(Boolean))).sort();
  }, [data]);

  const filteredUsers = useMemo(() => {
    if (!data) return [];
    let users = data.users;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.countryRegion.toLowerCase().includes(q)
      );
    }

    if (countryFilter) {
      users = users.filter((u) => u.country === countryFilter);
    }

    return [...users].sort((a, b) => {
      let va: string | number = '';
      let vb: string | number = '';

      if (sortField === 'name') { va = a.name; vb = b.name; }
      else if (sortField === 'email') { va = a.email; vb = b.email; }
      else if (sortField === 'country') { va = a.country; vb = b.country; }
      else if (sortField === 'registrationDate') {
        va = a.registrationDate ? new Date(a.registrationDate).getTime() : 0;
        vb = b.registrationDate ? new Date(b.registrationDate).getTime() : 0;
      } else if (sortField === 'plan') { va = a.plan; vb = b.plan; }

      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDir === 'asc' ? va - vb : vb - va;
      }
      const cmp = String(va).localeCompare(String(vb));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, searchQuery, countryFilter, sortField, sortDir]);

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <FontAwesomeIcon icon={faSpinner} className="w-10 h-10 text-green-600 animate-spin" />
          <p className="text-gray-600 font-medium">Loading subscriber analytics...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin || !data) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-900 to-green-800 text-white p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black">Subscriber Analytics</h1>
            <div className="flex items-center gap-2 mt-1">
              <FontAwesomeIcon icon={faCircle} className="w-2 h-2 text-green-400 animate-pulse" />
              <span className="text-green-200 text-sm">
                Real-time · Auto-refreshes every 30s
                {lastUpdated && ` · Last updated ${lastUpdated.toLocaleTimeString()}`}
              </span>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faRefresh} className={refreshing ? 'animate-spin' : ''} />
            Refresh Now
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                <FontAwesomeIcon icon={faUsers} className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600 font-medium">Total Users</p>
            </div>
            <p className="text-4xl font-black text-gray-900">{data.totalUsers}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
                <FontAwesomeIcon icon={faGlobe} className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-sm text-gray-600 font-medium">Countries</p>
            </div>
            <p className="text-4xl font-black text-gray-900">{data.geography.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-sm text-gray-600 mb-2 font-medium">🇲🇾 Malaysia</p>
            <p className="text-4xl font-black text-gray-900">{data.priorityMarkets.malaysia}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-sm text-gray-600 mb-2 font-medium">🇮🇩 Indonesia</p>
            <p className="text-4xl font-black text-gray-900">{data.priorityMarkets.indonesia}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Geographic Breakdown */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faGlobe} className="w-4 h-4 text-green-600" />
              Users by Country
            </h2>
            <div className="space-y-3">
              {data.geography.map((row) => (
                <div key={row.country}>
                  <div className="flex justify-between text-sm mb-1">
                    <button
                      onClick={() => setCountryFilter(countryFilter === row.country ? '' : row.country)}
                      className={`font-medium transition hover:text-green-700 ${countryFilter === row.country ? 'text-green-700 font-bold' : 'text-gray-700'}`}
                    >
                      {row.country}
                    </button>
                    <span className="font-bold text-gray-900">{row.count}</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                      style={{ width: `${Math.max(4, (row.count / data.totalUsers) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {countryFilter && (
              <button
                onClick={() => setCountryFilter('')}
                className="mt-3 text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                Clear filter ({countryFilter})
              </button>
            )}
          </div>

          {/* Growth Chart */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-5">
            <h2 className="text-lg font-bold mb-4">Registration Growth</h2>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {data.growth.map((item) => (
                <div key={item.month}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.month}</span>
                    <span className="font-bold text-gray-900">{item.count}</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                      style={{ width: `${Math.max(4, (item.count / maxGrowth) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FontAwesomeIcon icon={faUsers} className="w-4 h-4 text-green-600" />
                All Registered Users
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Showing {filteredUsers.length} of {data.totalUsers} users
                {countryFilter && ` · Filtered by: ${countryFilter}`}
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search name, email, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                  </button>
                )}
              </div>
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="">All Countries</option>
                {countries.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">
                    <button onClick={() => handleSort('name')} className="flex items-center hover:text-gray-900">
                      Name <SortIcon field="name" sortField={sortField} sortDir={sortDir} />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">
                    <button onClick={() => handleSort('email')} className="flex items-center hover:text-gray-900">
                      Email <SortIcon field="email" sortField={sortField} sortDir={sortDir} />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden md:table-cell">Phone</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">
                    <button onClick={() => handleSort('country')} className="flex items-center hover:text-gray-900">
                      Country <SortIcon field="country" sortField={sortField} sortDir={sortDir} />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">
                    <button onClick={() => handleSort('registrationDate')} className="flex items-center hover:text-gray-900">
                      Joined <SortIcon field="registrationDate" sortField={sortField} sortDir={sortDir} />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">
                    <button onClick={() => handleSort('plan')} className="flex items-center hover:text-gray-900">
                      Plan <SortIcon field="plan" sortField={sortField} sortDir={sortDir} />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden lg:table-cell">Uploads</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                      No users match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.uid} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900 whitespace-nowrap">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{u.email || '—'}</td>
                      <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{u.phone || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap">
                          {u.country || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {u.registrationDate
                          ? new Date(u.registrationDate).toLocaleDateString('en-US', {
                              year: 'numeric', month: 'short', day: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${
                          u.plan === 'free' || !u.plan
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {u.plan || 'free'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                        {u.uploadsUsed}/{u.uploadsLimit === -1 ? '∞' : u.uploadsLimit}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expansion Markets */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h2 className="text-lg font-bold mb-2">Expansion-Ready Markets</h2>
          <div className="flex flex-wrap gap-2">
            {data.expansionMarkets.map((market) => (
              <span key={market} className="bg-yellow-50 text-yellow-800 border border-yellow-200 text-sm font-semibold px-3 py-1.5 rounded-full">
                {market}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

