import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, formatCurrency } from '../lib/api';
import type { Comparison, ItemBreakdown } from '../types';
import { StoreBreakdownTable } from '../components/StoreBreakdownTable';
import { ArrowLeft, Clock, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const PLATFORM_COLORS: Record<string, string> = {
  blinkit: '#F8C02F',
  zepto: '#9B5DE5',
  instamart: '#FC8019',
  bigbasket: '#84BA40',
};

export const StoreBreakdownPage: React.FC = () => {
  const { comparisonId, platformId } = useParams<{ comparisonId: string; platformId: string }>();
  const navigate = useNavigate();
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await api.get(`/compare/${comparisonId}`);
        setComparison(res.data.comparison);
      } catch (err) {
        console.error('Fetch breakdown error:', err);
        setError(true);
        toast.error('Failed to load store breakdown');
      } finally {
        setLoading(false);
      }
    };
    if (comparisonId) fetchComparison();
  }, [comparisonId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#2D6A4F] animate-spin mx-auto" />
          <p className="text-sm text-[#6B6B6B]">Loading store breakdown...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-sm text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="font-serif font-bold text-xl text-[#1A1A1A] dark:text-[#F0EDE6]">
            Failed to Load
          </h2>
          <p className="text-sm text-[#6B6B6B]">Could not fetch the store breakdown.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-[#2D6A4F] text-white font-semibold text-sm rounded-xl"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const result = comparison?.results.find((r) => r.platformId === platformId);

  if (!comparison || !result) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-sm text-center space-y-4">
          <h2 className="font-serif font-bold text-2xl text-[#1A1A1A] dark:text-[#F0EDE6]">
            Store Not Found
          </h2>
          <p className="text-sm text-[#6B6B6B]">This store breakdown could not be located.</p>
          <Link
            to="/cart"
            className="inline-block px-6 py-3 bg-[#2D6A4F] text-white font-semibold text-sm rounded-xl"
          >
            Return to Cart
          </Link>
        </div>
      </div>
    );
  }

  const platform = result.platform;
  const platformColor = PLATFORM_COLORS[platform.slug] || platform.color;

  // Parse itemBreakdown safely
  let breakdown: ItemBreakdown[] = [];
  if (typeof result.itemBreakdown === 'string') {
    try { breakdown = JSON.parse(result.itemBreakdown); } catch { breakdown = []; }
  } else if (Array.isArray(result.itemBreakdown)) {
    breakdown = result.itemBreakdown;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back */}
      <button
        onClick={() => navigate(`/compare/${comparisonId}`)}
        className="inline-flex items-center space-x-1.5 text-xs font-medium text-[#6B6B6B] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE6] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Comparison Results</span>
      </button>

      {/* Platform Header Card */}
      <div className="bg-white dark:bg-[#1E1E1A] border border-[#E8E6DF] dark:border-[#2E2E28] rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-[#E8E6DF] dark:border-[#2E2E28]">
          <div className="flex items-center space-x-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white text-2xl shadow-md"
              style={{ backgroundColor: platformColor }}
            >
              {platform.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#1A1A1A] dark:text-[#F0EDE6]">
                  {platform.name}
                </h1>
                {result.isCheapest && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#2D6A4F] text-white">
                    Cheapest
                  </span>
                )}
                {result.isFastest && !result.isCheapest && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D4A853] text-white">
                    Fastest
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6B6B6B] dark:text-[#A0A09A] mt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>~{result.estimatedDeliveryMins} min estimated delivery</span>
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-[#6B6B6B] dark:text-[#A0A09A] block">Final Total</span>
            <span className="font-serif font-bold text-3xl text-[#2D6A4F] dark:text-[#40916C]">
              {formatCurrency(result.finalTotal)}
            </span>
          </div>
        </div>

        {/* Cost Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-xs">
          {[
            { label: 'Items Total', value: formatCurrency(result.totalPrice) },
            { label: 'Delivery Fee', value: result.deliveryFee === 0 ? 'FREE' : formatCurrency(result.deliveryFee), green: result.deliveryFee === 0 },
            { label: 'Est. GST', value: formatCurrency(result.estimatedTax) },
            { label: 'Savings vs Max', value: formatCurrency(result.savingsVsMax), green: true },
          ].map(({ label, value, green }) => (
            <div key={label} className="p-3 bg-[#F8F6F0] dark:bg-[#242420] rounded-xl border border-[#E8E6DF] dark:border-[#2E2E28]">
              <span className="text-[#9B9B9B] block mb-1">{label}</span>
              <span className={`font-semibold text-sm ${green ? 'text-[#2D6A4F]' : 'text-[#1A1A1A] dark:text-[#F0EDE6]'}`}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Itemized Table */}
      <StoreBreakdownTable breakdown={breakdown} platformName={platform.name} />

      {/* Checkout CTA */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <button
          onClick={() => navigate(`/compare/${comparisonId}`)}
          className="px-6 py-3 border border-[#E8E6DF] dark:border-[#2E2E28] text-sm font-semibold text-[#1A1A1A] dark:text-[#F0EDE6] rounded-xl hover:border-[#2D6A4F] transition-all"
        >
          ← Other Stores
        </button>
        <button
          onClick={() => navigate(`/handoff/${platform.slug}?comparisonId=${comparisonId}`)}
          className="px-8 py-3.5 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center space-x-2 hover:opacity-90 cursor-pointer"
          style={{ backgroundColor: platformColor }}
        >
          <span>Continue on {platform.name} 🛒</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
