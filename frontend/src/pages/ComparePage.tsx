import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, formatCurrency } from '../lib/api';
import type { Comparison } from '../types';
import { ComparisonCard } from '../components/ComparisonCard';
import { ComparisonSkeleton } from '../components/SkeletonLoader';
import { Sparkles, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const ComparePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await api.get(`/compare/${id}`);
        setComparison(res.data.comparison);
      } catch (err) {
        console.error('Fetch comparison error:', err);
        setError(true);
        toast.error('Failed to load comparison results');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchComparison();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
        <div className="w-1/3 h-8 skeleton rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <ComparisonSkeleton key={i} />
          ))}
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
            Comparison Failed
          </h2>
          <p className="text-sm text-[#6B6B6B] dark:text-[#A0A09A]">Could not load the comparison results.</p>
          <Link
            to="/cart"
            className="inline-block px-6 py-3 bg-[#2D6A4F] text-white font-semibold text-sm rounded-xl"
          >
            Back to Cart
          </Link>
        </div>
      </div>
    );
  }

  if (!comparison) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <h2 className="font-serif font-bold text-2xl text-[#1A1A1A] dark:text-[#F0EDE6] mb-2">
          Comparison Not Found
        </h2>
        <p className="text-xs text-[#6B6B6B] dark:text-[#A0A09A] mb-6">
          The requested comparison session could not be located or has expired.
        </p>
        <Link
          to="/cart"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-[#2D6A4F] text-white font-semibold text-xs rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Build a New Cart</span>
        </Link>
      </div>
    );
  }

  const results = comparison.results || [];
  const maxTotal = Math.max(...results.map((r) => r.finalTotal), 0);

  // Compute Smart Recommendation logic on the fly
  const cheapestResult = [...results].sort((a, b) => a.finalTotal - b.finalTotal)[0];
  const fastestResult = [...results].sort((a, b) => a.estimatedDeliveryMins - b.estimatedDeliveryMins)[0];

  // Best Value = lowest total + reasonable delivery (within 10-15% of fastest delivery)
  const fastestDeliveryTime = fastestResult?.estimatedDeliveryMins || 0;
  const reasonableDeliveryTimeThreshold = fastestDeliveryTime * 1.15;
  
  const reasonableSpeedResults = results.filter(
    (r) => r.estimatedDeliveryMins <= reasonableDeliveryTimeThreshold
  );

  const bestValueResult = [...reasonableSpeedResults].sort(
    (a, b) => a.finalTotal - b.finalTotal
  )[0] || cheapestResult;

  // Map results with correct override flags for children ComparisonCards
  const processedResults = results.map((res) => {
    return {
      ...res,
      isCheapest: res.platform.id === cheapestResult?.platform.id,
      isFastest: res.platform.id === fastestResult?.platform.id,
      isBestValue: res.platform.id === bestValueResult?.platform.id,
    };
  });

  const recommendedSavings = maxTotal - (bestValueResult?.finalTotal || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header Section */}
      <div>
        <button
          onClick={() => navigate('/cart')}
          className="inline-flex items-center space-x-1 text-xs text-[#6B6B6B] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE6] mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Edit Basket</span>
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-[#2D6A4F]/10 rounded-lg text-[#2D6A4F] dark:text-[#40916C]">
                <Sparkles className="w-5 h-5" />
              </span>
              <h1 className="font-serif font-bold text-3xl md:text-4xl text-[#1A1A1A] dark:text-[#F0EDE6]">
                Basket Comparison
              </h1>
            </div>
            <p className="text-xs text-[#6B6B6B] dark:text-[#A0A09A] mt-1">
              {comparison.cart?.items?.length || 0} items compared across {results.length} platforms
            </p>
          </div>

          <button
            onClick={() => navigate('/cart')}
            className="px-4 py-2 bg-white dark:bg-[#1E1E1A] border border-[#E8E6DF] dark:border-[#2E2E28] text-xs font-semibold text-[#1A1A1A] dark:text-[#F0EDE6] rounded-xl hover:border-[#2D6A4F] transition-all flex items-center space-x-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#2D6A4F]" />
            <span>Re-run Comparison</span>
          </button>
        </div>
      </div>

      {/* Smart Recommendation Banner */}
      {bestValueResult && (
        <div className="bg-gradient-to-br from-[#F8F6F0] to-white dark:from-[#20201C] dark:to-[#1E1E1A] border-2 border-[#2D6A4F]/20 dark:border-[#2D6A4F]/30 rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#2D6A4F]/5 rounded-full -mr-16 -mt-16 pointer-events-none" />
          
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#2D6A4F]/10 dark:bg-[#2D6A4F]/20 rounded-2xl text-[#2D6A4F] dark:text-[#49A078] shrink-0 mt-0.5">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1 flex-1">
              <h2 className="text-[10px] uppercase font-bold text-[#2D6A4F] dark:text-[#49A078] tracking-widest">
                Smart Recommendation
              </h2>
              <p className="font-serif font-bold text-lg sm:text-xl text-[#1A1A1A] dark:text-[#F0EDE6] leading-snug">
                You should order from{' '}
                <span className="text-[#2D6A4F] dark:text-[#49A078]">{bestValueResult.platform.name}</span>
                {recommendedSavings > 0 ? (
                  <> — {formatCurrency(recommendedSavings)} cheaper </>
                ) : (
                  <> — lowest cost option </>
                )}
                and delivers in {bestValueResult.estimatedDeliveryMins} mins.
              </p>
              
              {fastestResult && fastestResult.platform.id !== bestValueResult.platform.id && (
                <p className="text-xs text-[#6B6B6B] dark:text-[#A0A09A] pt-1">
                  Alternative suggestion:{' '}
                  <span className="font-medium text-[#1A1A1A] dark:text-[#F0EDE6]">
                    Or choose {fastestResult.platform.name} for fastest delivery ({fastestResult.estimatedDeliveryMins} mins).
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Store Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {processedResults.map((res) => (
          <ComparisonCard
            key={res.id}
            result={res}
            comparisonId={comparison.id}
            maxTotal={maxTotal}
            isRecommended={res.platform.id === bestValueResult?.platform.id}
          />
        ))}
      </div>

      {results.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[#9B9B9B] text-sm">No comparison results available.</p>
          <Link to="/cart" className="mt-4 inline-block text-xs text-[#2D6A4F] font-semibold hover:underline">
            Build a new cart →
          </Link>
        </div>
      )}
    </div>
  );
};
