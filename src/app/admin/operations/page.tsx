'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';

interface OperationsData {
  uploadedFiles: Array<Record<string, any>>;
  internalReports: Array<Record<string, any>>;
  chatLogs: Array<Record<string, any>>;
}

export default function AdminOperationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [data, setData] = useState<OperationsData>({ uploadedFiles: [], internalReports: [], chatLogs: [] });

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

        const [adminRes, opsRes] = await Promise.all([
          fetch('/api/admin/check', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/operations', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const adminJson = await adminRes.json();
        if (!adminJson?.isAdmin) {
          router.replace('/dashboard');
          return;
        }
        setIsAdmin(true);

        const opsJson = await opsRes.json();
        if (opsJson?.success) {
          setData(opsJson.data);
        }
      } finally {
        setLoadingData(false);
      }
    };

    run();
  }, [user, loading, router]);

  if (loading || loadingData) {
    return <div className="min-h-screen flex items-center justify-center">Loading admin operations...</div>;
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-black text-gray-900">Admin Operations Access</h1>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-xl font-bold mb-3">Uploaded Files</h2>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">User</th>
                  <th className="py-2 pr-4">Country/Region</th>
                  <th className="py-2 pr-4">File</th>
                  <th className="py-2 pr-4">Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {data.uploadedFiles.map((item) => (
                  <tr key={item.id} className="border-b last:border-b-0">
                    <td className="py-2 pr-4">{item.userName} ({item.userEmail})</td>
                    <td className="py-2 pr-4">{item.countryRegion || '-'}</td>
                    <td className="py-2 pr-4">{item.fileName || item.storagePath || '-'}</td>
                    <td className="py-2 pr-4">{item.createdAt ? new Date(item.createdAt).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-xl font-bold mb-3">Internal Report Copies</h2>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">User</th>
                  <th className="py-2 pr-4">Country/Region</th>
                  <th className="py-2 pr-4">Report</th>
                  <th className="py-2 pr-4">Created</th>
                </tr>
              </thead>
              <tbody>
                {data.internalReports.map((item) => (
                  <tr key={item.id} className="border-b last:border-b-0">
                    <td className="py-2 pr-4">{item.userName} ({item.userEmail})</td>
                    <td className="py-2 pr-4">{item.countryRegion || '-'}</td>
                    <td className="py-2 pr-4">{item.title || item.reportId}</td>
                    <td className="py-2 pr-4">{item.createdAt ? new Date(item.createdAt).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-xl font-bold mb-3">Palmira Conversation Logs</h2>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">User</th>
                  <th className="py-2 pr-4">Country/Region</th>
                  <th className="py-2 pr-4">Chat</th>
                  <th className="py-2 pr-4">Updated</th>
                </tr>
              </thead>
              <tbody>
                {data.chatLogs.map((item) => (
                  <tr key={item.id} className="border-b last:border-b-0">
                    <td className="py-2 pr-4">{item.userName} ({item.userEmail})</td>
                    <td className="py-2 pr-4">{item.countryRegion || '-'}</td>
                    <td className="py-2 pr-4">{item.title || 'New Chat'}</td>
                    <td className="py-2 pr-4">{item.updatedAt ? new Date(item.updatedAt).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
