'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFlask,
  faSpinner,
  faRefresh,
  faSearch,
  faTimes,
  faUser,
  faChevronDown,
  faChevronRight,
  faFilePdf,
  faExternalLink,
  faLeaf,
  faSeedling,
  faCircleXmark,
  faFilter,
  faRobot,
} from '@fortawesome/free-solid-svg-icons';

interface AnalysisResult {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  countryRegion: string;
  title: string;
  type: string;
  status: string;
  summary: string;
  createdAt: string | null;
  fileUrl: string;
  recommendationsArray: string[];
  recommendationsArrayMs: string[];
  recommendationsCount: number;
  soilData: any;
  leafData: any;
  analysisData: any;
}

interface UserGroup {
  userId: string;
  userName: string;
  userEmail: string;
  countryRegion: string;
  results: AnalysisResult[];
}

function groupByUser(results: AnalysisResult[]): UserGroup[] {
  const map = new Map<string, UserGroup>();
  for (const r of results) {
    if (!map.has(r.userId)) {
      map.set(r.userId, {
        userId: r.userId,
        userName: r.userName,
        userEmail: r.userEmail,
        countryRegion: r.countryRegion,
        results: [],
      });
    }
    map.get(r.userId)!.results.push(r);
  }
  return Array.from(map.values()).sort((a, b) => a.userName.localeCompare(b.userName));
}

function TypeBadge({ type }: { type: string }) {
  const isSoil = type === 'soil';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
        isSoil
          ? 'bg-amber-100 text-amber-800 border border-amber-200'
          : 'bg-green-100 text-green-800 border border-green-200'
      }`}
    >
      <FontAwesomeIcon icon={isSoil ? faSeedling : faLeaf} className="w-3 h-3" />
      {isSoil ? 'Soil' : 'Leaf'}
    </span>
  );
}

function ReportDetailPanel({ result, router }: { result: AnalysisResult; router: ReturnType<typeof useRouter> }) {
  const data = result.analysisData || {};
  const soilData = result.soilData || data.soilData || data.soil_data || {};
  const leafData = result.leafData || data.leafData || data.leaf_data || {};

  // Prefer the pre-normalised arrays from the API; fall back to analysisData
  const recommendations: string[] =
    result.recommendationsArray?.length > 0 ? result.recommendationsArray :
    Array.isArray(data.recommendations) ? data.recommendations.filter((r: any) => typeof r === 'string') :
    [];

  const summary = result.summary || data.summary || '';

  // Soil nutrient table helpers
  const soilNutrients = [
    { label: 'pH', value: soilData.pH ?? soilData.ph ?? soilData.soilPH },
    { label: 'Organic Matter (%)', value: soilData.organicMatter ?? soilData.organic_matter },
    { label: 'Nitrogen (N)', value: soilData.nitrogen ?? soilData.N },
    { label: 'Phosphorus (P)', value: soilData.phosphorus ?? soilData.P },
    { label: 'Potassium (K)', value: soilData.potassium ?? soilData.K },
    { label: 'Magnesium (Mg)', value: soilData.magnesium ?? soilData.Mg },
    { label: 'Calcium (Ca)', value: soilData.calcium ?? soilData.Ca },
    { label: 'Boron (B)', value: soilData.boron ?? soilData.B },
    { label: 'Copper (Cu)', value: soilData.copper ?? soilData.Cu },
    { label: 'Zinc (Zn)', value: soilData.zinc ?? soilData.Zn },
  ].filter((n) => n.value !== undefined && n.value !== null && n.value !== '');

  const leafNutrients = [
    { label: 'Nitrogen (N)', value: leafData.nitrogen ?? leafData.N },
    { label: 'Phosphorus (P)', value: leafData.phosphorus ?? leafData.P },
    { label: 'Potassium (K)', value: leafData.potassium ?? leafData.K },
    { label: 'Magnesium (Mg)', value: leafData.magnesium ?? leafData.Mg },
    { label: 'Calcium (Ca)', value: leafData.calcium ?? leafData.Ca },
    { label: 'Boron (B)', value: leafData.boron ?? leafData.B },
    { label: 'Copper (Cu)', value: leafData.copper ?? leafData.Cu },
    { label: 'Zinc (Zn)', value: leafData.zinc ?? leafData.Zn },
  ].filter((n) => n.value !== undefined && n.value !== null && n.value !== '');

  const hasNutrients = soilNutrients.length > 0 || leafNutrients.length > 0;

  return (
    <div className="bg-gray-50 border-t border-gray-200 p-5 space-y-5">
      {/* Header row: date + type + action buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <TypeBadge type={result.type} />
        {result.createdAt && (
          <span className="text-xs text-gray-500">
            {new Date(result.createdAt).toLocaleString('en-US', {
              year: 'numeric', month: 'short', day: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </span>
        )}
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <AssistantButton resultId={result.id} router={router} />
          {result.fileUrl && (
            <a
              href={result.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition"
            >
              <FontAwesomeIcon icon={faFilePdf} className="w-3.5 h-3.5" />
              Download PDF
              <FontAwesomeIcon icon={faExternalLink} className="w-3 h-3 opacity-70" />
            </a>
          )}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Summary</p>
          <p className="text-sm text-gray-700 leading-relaxed bg-white rounded-lg border border-gray-200 p-4">
            {summary}
          </p>
        </div>
      )}

      {/* Nutrient Data */}
      {hasNutrients && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {soilNutrients.length > 0 ? 'Soil Nutrients' : 'Leaf Nutrients'}
          </p>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">Parameter</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(soilNutrients.length > 0 ? soilNutrients : leafNutrients).map((n, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-700 font-medium">{n.label}</td>
                    <td className="px-4 py-2 text-gray-900 font-semibold text-right">{String(n.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Recommendations ({recommendations.length})
          </p>
          <ul className="space-y-2">
            {recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-3 bg-white rounded-lg border border-gray-200 p-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-bold mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-700 leading-relaxed">{rec}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* No detail available */}
      {!summary && !hasNutrients && recommendations.length === 0 && (
        <p className="text-sm text-gray-400 italic text-center py-4">
          No detailed data stored for this report.
          {result.fileUrl && ' Download the PDF for the full report.'}
        </p>
      )}
    </div>
  );
}

function AssistantButton({ resultId, router }: { resultId: string; router: ReturnType<typeof useRouter> }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); router.push(`/assistant?analysisId=${resultId}`); }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition"
      title="Open this analysis in the AI Assistant"
    >
      <FontAwesomeIcon icon={faRobot} className="w-3.5 h-3.5" />
      View in AI Assistant
    </button>
  );
}

export default function AdminAnalysisHistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'soil' | 'leaf'>('all');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [expandedResultId, setExpandedResultId] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getFreshToken = useCallback(async (): Promise<string | null> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    return currentUser.getIdToken();
  }, []);

  const fetchResults = useCallback(async () => {
    const token = await getFreshToken();
    if (!token) return;
    try {
      const res = await fetch('/api/admin/analysis-results', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json?.success) {
        setResults(json.results || []);
        setLastUpdated(new Date());
      }
    } catch (e) {
      console.error('Error fetching analysis results:', e);
    }
  }, [getFreshToken]);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/login'); return; }

    const run = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        const token = await currentUser.getIdToken();

        const adminRes = await fetch('/api/admin/check', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const adminJson = await adminRes.json();
        if (!adminJson?.isAdmin) { router.replace('/dashboard'); return; }
        setIsAdmin(true);
        await fetchResults();
      } finally {
        setLoadingData(false);
      }
    };
    run();
  }, [user, loading, router, fetchResults]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!isAdmin) return;
    intervalRef.current = setInterval(() => { fetchResults(); }, 30000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isAdmin, fetchResults]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchResults();
    setRefreshing(false);
  };

  const users = groupByUser(results);

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      u.userName.toLowerCase().includes(q) ||
      u.userEmail.toLowerCase().includes(q) ||
      u.countryRegion.toLowerCase().includes(q);
    const matchesType =
      typeFilter === 'all' ||
      u.results.some((r) => r.type === typeFilter);
    return matchesSearch && matchesType;
  });

  const selectedUser = users.find((u) => u.userId === selectedUserId) ?? null;

  const visibleResults = selectedUser
    ? selectedUser.results.filter((r) => typeFilter === 'all' || r.type === typeFilter)
    : [];

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <FontAwesomeIcon icon={faSpinner} className="w-10 h-10 text-green-600 animate-spin" />
          <p className="text-gray-600 font-medium">Loading analysis history...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const totalResults = results.length;
  const soilCount = results.filter((r) => r.type === 'soil').length;
  const leafCount = results.filter((r) => r.type === 'leaf').length;
  const withPdf = results.filter((r) => r.fileUrl).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-900 to-green-800 text-white p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-3">
              <FontAwesomeIcon icon={faFlask} className="w-8 h-8 text-yellow-400" />
              Analysis History
            </h1>
            <p className="text-green-200 mt-1 text-sm">
              {totalResults} results across {users.length} users ·{' '}
              {soilCount} soil · {leafCount} leaf · {withPdf} with PDF
            </p>
            {lastUpdated && (
              <p className="text-green-300 text-xs mt-0.5">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faRefresh} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3 flex flex-wrap gap-4 text-sm">
          <button
            onClick={() => setTypeFilter('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${typeFilter === 'all' ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <FontAwesomeIcon icon={faFilter} className="w-3.5 h-3.5" />
            All ({totalResults})
          </button>
          <button
            onClick={() => setTypeFilter('soil')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${typeFilter === 'soil' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <FontAwesomeIcon icon={faSeedling} className="w-3.5 h-3.5" />
            Soil ({soilCount})
          </button>
          <button
            onClick={() => setTypeFilter('leaf')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${typeFilter === 'leaf' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <FontAwesomeIcon icon={faLeaf} className="w-3.5 h-3.5" />
            Leaf ({leafCount})
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6 flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Left panel: user list */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">No users found</div>
              ) : (
                filteredUsers.map((u) => {
                  const userResults = typeFilter === 'all'
                    ? u.results
                    : u.results.filter((r) => r.type === typeFilter);
                  if (userResults.length === 0) return null;
                  return (
                    <button
                      key={u.userId}
                      onClick={() => {
                        setSelectedUserId(u.userId);
                        setExpandedResultId(null);
                      }}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition ${
                        selectedUserId === u.userId
                          ? 'bg-green-50 border-r-4 border-green-600'
                          : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
                          {u.userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{u.userName}</p>
                          <p className="text-xs text-gray-500 truncate">{u.userEmail}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{u.countryRegion || '—'}</p>
                          <div className="flex gap-2 mt-1.5 flex-wrap">
                            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                              {userResults.length} report{userResults.length !== 1 ? 's' : ''}
                            </span>
                            {userResults.filter((r) => r.fileUrl).length > 0 && (
                              <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                                {userResults.filter((r) => r.fileUrl).length} PDF
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right panel: results */}
        <div className="flex-1 min-w-0">
          {!selectedUser ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
              <FontAwesomeIcon icon={faUser} className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">Select a user to view their analysis history</p>
              <p className="text-gray-400 text-sm mt-1">Choose from the user list on the left</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* User header */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                      {selectedUser.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-gray-900">{selectedUser.userName}</h2>
                      <p className="text-gray-600">{selectedUser.userEmail}</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {selectedUser.countryRegion || 'Location unknown'} · ID: {selectedUser.userId.slice(0, 12)}…
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <div className="text-center px-4 py-2 bg-blue-50 rounded-xl">
                      <p className="text-2xl font-black text-blue-700">{visibleResults.length}</p>
                      <p className="text-xs text-blue-600">Reports</p>
                    </div>
                    <div className="text-center px-4 py-2 bg-amber-50 rounded-xl">
                      <p className="text-2xl font-black text-amber-700">
                        {visibleResults.filter((r) => r.type === 'soil').length}
                      </p>
                      <p className="text-xs text-amber-600">Soil</p>
                    </div>
                    <div className="text-center px-4 py-2 bg-green-50 rounded-xl">
                      <p className="text-2xl font-black text-green-700">
                        {visibleResults.filter((r) => r.type === 'leaf').length}
                      </p>
                      <p className="text-xs text-green-600">Leaf</p>
                    </div>
                    <div className="text-center px-4 py-2 bg-red-50 rounded-xl">
                      <p className="text-2xl font-black text-red-700">
                        {visibleResults.filter((r) => r.fileUrl).length}
                      </p>
                      <p className="text-xs text-red-600">PDFs</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results list */}
              {visibleResults.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
                  <FontAwesomeIcon icon={faCircleXmark} className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No {typeFilter !== 'all' ? typeFilter : ''} analysis results for this user
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {visibleResults.map((result) => (
                    <div
                      key={result.id}
                      className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
                    >
                      {/* Result row */}
                      <button
                        onClick={() =>
                          setExpandedResultId(
                            expandedResultId === result.id ? null : result.id
                          )
                        }
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition text-left"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              result.type === 'soil'
                                ? 'bg-amber-100'
                                : 'bg-green-100'
                            }`}
                          >
                            <FontAwesomeIcon
                              icon={result.type === 'soil' ? faSeedling : faLeaf}
                              className={`w-5 h-5 ${
                                result.type === 'soil'
                                  ? 'text-amber-600'
                                  : 'text-green-600'
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">
                              {result.title}
                            </p>
                            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                              <TypeBadge type={result.type} />
                              {result.createdAt && (
                                <span className="text-xs text-gray-500">
                                  {new Date(result.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              )}
                              {result.recommendationsCount > 0 && (
                                <span className="text-xs text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                                  {result.recommendationsCount} rec
                                </span>
                              )}
                              {result.fileUrl && (
                                <span className="text-xs text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <FontAwesomeIcon icon={faFilePdf} className="w-3 h-3" />
                                  PDF
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <AssistantButton resultId={result.id} router={router} />
                          {result.fileUrl && (
                            <a
                              href={result.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition"
                              title="Download PDF"
                            >
                              <FontAwesomeIcon icon={faFilePdf} className="w-3.5 h-3.5" />
                              PDF
                            </a>
                          )}
                          <FontAwesomeIcon
                            icon={
                              expandedResultId === result.id
                                ? faChevronDown
                                : faChevronRight
                            }
                            className="w-4 h-4 text-gray-400"
                          />
                        </div>
                      </button>

                      {/* Expanded detail */}
                      {expandedResultId === result.id && (
                        <ReportDetailPanel result={result} router={router} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
