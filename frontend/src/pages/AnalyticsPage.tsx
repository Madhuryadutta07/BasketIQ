import React, { useState, useEffect } from 'react';
import { api, formatCurrency } from '../lib/api';
import { BarChart3, DollarSign, Award, Calendar, Layers } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [overview, setOverview] = useState<any>(null);
  const [platformStats, setPlatformStats] = useState<any[]>([]);
  const [priceTrends, setPriceTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [overviewRes, platformRes, trendRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/analytics/platform-comparison'),
          api.get('/analytics/price-trends'),
        ]);

        setOverview(overviewRes.data);
        setPlatformStats(platformRes.data.platformStats || []);
        setPriceTrends(trendRes.data.trends || []);
      } catch (err) {
        console.error('Analytics error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchAnalytics();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <h2 className="font-serif font-bold text-2xl mb-2">Login Required</h2>
        <p className="text-xs text-[#6B6B6B] mb-6">
          Log in to unlock historical price analytics and savings dashboards.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2.5 bg-[#2D6A4F] text-white font-semibold text-xs rounded-xl"
        >
          Log In
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
        <div className="w-1/3 h-8 skeleton" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 skeleton rounded-2xl" />
          ))}
        </div>
        <div className="w-full h-80 skeleton rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-[#2D6A4F]/10 rounded-lg text-[#2D6A4F]">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h1 className="font-serif font-bold text-3xl md:text-4xl text-[#1A1A1A] dark:text-[#F0EDE6]">
              Analytics Dashboard
            </h1>
          </div>
          <p className="text-xs text-[#6B6B6B] dark:text-[#A0A09A] mt-1">
            Personalized grocery intelligence, price trends, and platform savings metrics.
          </p>
        </div>

        <div className="px-3.5 py-1.5 bg-[#2D6A4F]/10 text-[#2D6A4F] dark:text-[#40916C] rounded-full text-xs font-semibold flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-[#2D6A4F] animate-pulse" />
          <span>Power BI & Data Sync Ready</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1E1E1A] border border-[#E8E6DF] dark:border-[#2E2E28] rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center text-[#9B9B9B] mb-2">
            <span className="text-xs font-semibold">Total Savings</span>
            <DollarSign className="w-4 h-4 text-[#2D6A4F]" />
          </div>
          <span className="font-serif font-bold text-3xl text-[#2D6A4F] dark:text-[#40916C]">
            {formatCurrency(overview?.totalSavings || 0)}
          </span>
          <p className="text-[11px] text-[#6B6B6B] mt-1">Saved by choosing recommended stores</p>
        </div>

        <div className="bg-white dark:bg-[#1E1E1A] border border-[#E8E6DF] dark:border-[#2E2E28] rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center text-[#9B9B9B] mb-2">
            <span className="text-xs font-semibold">Total Comparisons</span>
            <Calendar className="w-4 h-4 text-[#D4A853]" />
          </div>
          <span className="font-serif font-bold text-3xl text-[#1A1A1A] dark:text-[#F0EDE6]">
            {overview?.totalComparisons || 0}
          </span>
          <p className="text-[11px] text-[#6B6B6B] mt-1">Baskets evaluated across platforms</p>
        </div>

        <div className="bg-white dark:bg-[#1E1E1A] border border-[#E8E6DF] dark:border-[#2E2E28] rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center text-[#9B9B9B] mb-2">
            <span className="text-xs font-semibold">Favorite Store</span>
            <Award className="w-4 h-4 text-[#2D6A4F]" />
          </div>
          <span className="font-serif font-bold text-2xl text-[#1A1A1A] dark:text-[#F0EDE6]">
            {overview?.favoritePlatform?.name || 'BigBasket'}
          </span>
          <p className="text-[11px] text-[#6B6B6B] mt-1">Most frequent cheapest store</p>
        </div>

        <div className="bg-white dark:bg-[#1E1E1A] border border-[#E8E6DF] dark:border-[#2E2E28] rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center text-[#9B9B9B] mb-2">
            <span className="text-xs font-semibold">Searches Logged</span>
            <Layers className="w-4 h-4 text-[#6B6B6B]" />
          </div>
          <span className="font-serif font-bold text-3xl text-[#1A1A1A] dark:text-[#F0EDE6]">
            {overview?.totalSearches || 0}
          </span>
          <p className="text-[11px] text-[#6B6B6B] mt-1">Product queries analyzed</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Price History Line Chart */}
        <div className="bg-white dark:bg-[#1E1E1A] border border-[#E8E6DF] dark:border-[#2E2E28] rounded-3xl p-6 shadow-sm">
          <h3 className="font-serif font-bold text-lg text-[#1A1A1A] dark:text-[#F0EDE6] mb-1">
            Price History Trends (Last 30 Days)
          </h3>
          <p className="text-xs text-[#6B6B6B] dark:text-[#A0A09A] mb-6">
            Track historical minimum basket totals over time.
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceTrends.length > 0 ? priceTrends : [
                { date: 'Jul 01', cheapestTotal: 420 },
                { date: 'Jul 07', cheapestTotal: 395 },
                { date: 'Jul 14', cheapestTotal: 410 },
                { date: 'Jul 21', cheapestTotal: 380 },
                { date: 'Jul 28', cheapestTotal: 370 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E6DF" />
                <XAxis dataKey="date" stroke="#9B9B9B" fontSize={11} />
                <YAxis stroke="#9B9B9B" fontSize={11} />
                <Tooltip
                  formatter={(val: any) => [`₹${val}`, 'Basket Total']}
                  contentStyle={{ backgroundColor: '#1A1A1A', borderRadius: '10px', color: '#FFF' }}
                />
                <Line type="monotone" dataKey="cheapestTotal" stroke="#2D6A4F" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Comparison Bar Chart */}
        <div className="bg-white dark:bg-[#1E1E1A] border border-[#E8E6DF] dark:border-[#2E2E28] rounded-3xl p-6 shadow-sm">
          <h3 className="font-serif font-bold text-lg text-[#1A1A1A] dark:text-[#F0EDE6] mb-1">
            Platform Cheapest Store Frequency
          </h3>
          <p className="text-xs text-[#6B6B6B] dark:text-[#A0A09A] mb-6">
            How often each platform won the cheapest basket award.
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E6DF" />
                <XAxis dataKey="name" stroke="#9B9B9B" fontSize={11} />
                <YAxis stroke="#9B9B9B" fontSize={11} />
                <Tooltip
                  formatter={(val: any) => [val, 'Times Cheapest']}
                  contentStyle={{ backgroundColor: '#1A1A1A', borderRadius: '10px', color: '#FFF' }}
                />
                <Bar dataKey="cheapestCount" radius={[6, 6, 0, 0]}>
                  {platformStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#2D6A4F'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
