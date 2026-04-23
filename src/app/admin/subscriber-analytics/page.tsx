'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';

interface AnalyticsData {
  totalSubscribers: number;
  growth: Array<{ month: string; count: number }>;
  geography: Array<{ country: string; count: number }>;
  priorityMarkets: { malaysia: number; indonesia: number };
  expansionMarkets: string[];
}

export default function SubscriberAnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }

    const run = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        const token = await currentUser.getIdToken();

        const [adminRes, analyticsRes] = await Promise.all([
          fetch('/api/admin/check', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/subscriber-analytics', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const adminJson = await adminRes.json();
        if (!adminJson?.isAdmin) {
          router.replace('/dashboard');
          return;
        }
        setIsAdmin(true);

        const analyticsJson = await analyticsRes.json();
        if (analyticsJson?.success) {
          setData(analyticsJson.data);
        }
      } finally {
        setLoadingData(false);
      }
    };

    run();
  }, [user, loading, router]);

  const maxGrowth = useMemo(() => Math.max(...(data?.growth.map((g) => g.count) || [1])), [data]);

  if (loading || loadingData) {
    return <div className="min-h-screen flex items-center justify-center">Loading subscriber analytics...</div>;
  }

  if (!isAdmin || !data) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-black text-gray-900">Subscriber Analytics Dashboard</h1>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-sm text-gray-600">Total Subscribers</p>
            <p className="text-3xl font-black text-gray-900 mt-2">{data.totalSubscribers}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-sm text-gray-600">Malaysia</p>
            <p className="text-3xl font-black text-gray-900 mt-2">{data.priorityMarkets.malaysia}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-sm text-gray-600">Indonesia</p>
            <p className="text-3xl font-black text-gray-900 mt-2">{data.priorityMarkets.indonesia}</p>
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-2xl p-5">
          <h2 className="text-xl font-bold mb-4">Subscriber Growth Over Time</h2>
          <div className="space-y-3">
            {data.growth.map((item) => (
              <div key={item.month}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.month}</span>
                  <span>{item.count}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600 rounded-full"
                    style={{ width: `${Math.max(4, (item.count / maxGrowth) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-2xl p-5">
          <h2 className="text-xl font-bold mb-4">Geographic Breakdown</h2>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">Country/Region</th>
                  <th className="py-2 pr-4">Subscribers</th>
                </tr>
              </thead>
              <tbody>
                {data.geography.map((row) => (
                  <tr key={row.country} className="border-b last:border-b-0">
                    <td className="py-2 pr-4">{row.country}</td>
                    <td className="py-2 pr-4">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-2xl p-5">
          <h2 className="text-xl font-bold mb-2">Expansion-Ready Markets</h2>
          <p className="text-gray-700">{data.expansionMarkets.join(', ')}</p>
        </section>
      </div>
    </div>
  );
}
