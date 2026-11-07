import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api, formatCurrency } from '../lib/api';
import type { Comparison, ItemBreakdown } from '../types';
import {
  ArrowLeft, Copy, Check, ExternalLink, Loader2,
  TrendingDown, Clock, ShoppingBag, Search, Sparkles, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const PLATFORM_COLORS: Record<string, string> = {
  blinkit: '#F8C02F',
  zepto: '#9B5DE5',
  instamart: '#FC8019',
  bigbasket: '#84BA40',
};

const PLATFORM_URLS: Record<string, string> = {
  blinkit: 'https://blinkit.com',
  zepto: 'https://www.zeptonow.com',
  instamart: 'https://www.swiggy.com/instamart',
  bigbasket: 'https://www.bigbasket.com',
};

const getPlatformSearchUrl = (platformSlug: string, query: string): string => {
  const q = encodeURIComponent(query);
  switch (platformSlug) {
    case 'blinkit':
      return `https://blinkit.com/s/?q=${q}`;
    case 'zepto':
      return `https://www.zeptonow.com/search?query=${q}`;
    case 'instamart':
      return `https://www.swiggy.com/instamart/search?query=${q}`;
    case 'bigbasket':
      return `https://www.bigbasket.com/ps/?q=${q}`;
    default:
      return `https://google.com/search?q=${q}`;
  }
};

export const HandoffPage: React.FC = () => {
  const { platformSlug } = useParams<{ platformSlug: string }>();
  const [searchParams] = useSearchParams();
  const comparisonId = searchParams.get('comparisonId');
  const navigate = useNavigate();

  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchComparison = async () => {
      if (!comparisonId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await api.get(`/compare/${comparisonId}`);
        setComparison(res.data.comparison);
      } catch (err) {
        console.error('Fetch comparison error:', err);
        toast.error('Failed to load comparison details');
      } finally {
        setLoading(false);
      }
    };
    fetchComparison();
  }, [comparisonId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#2D6A4F] animate-spin mx-auto" />
          <p className="text-sm text-[#6B6B6B] dark:text-[#A0A09A]">Preparing your handoff...</p>
        </div>
      </div>
    );
  }

  // Find platform details
  const results = comparison?.results || [];
  const result = results.find((r) => r.platform.slug === platformSlug);
  const platform = result?.platform;

  if (!comparison || !result || !platform) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-sm text-center space-y-4">
          <h2 className="font-serif font-bold text-2xl text-[#1A1A1A] dark:text-[#F0EDE6]">
            Handoff Details Not Found
          </h2>
          <p className="text-sm text-[#6B6B6B] dark:text-[#A0A09A]">
            Could not retrieve comparison or platform details.
          </p>
          <Link
            to="/cart"
            className="inline-block px-6 py-3 bg-[#2D6A4F] text-white font-semibold text-sm rounded-xl"
          >
            Go to Cart
          </Link>
        </div>
      </div>
    );
  }

  // Compute recommendation context
  const cheapestResult = [...results].sort((a, b) => a.finalTotal - b.finalTotal)[0];
  const fastestResult = [...results].sort((a, b) => a.estimatedDeliveryMins - b.estimatedDeliveryMins)[0];
  
  const fastestDeliveryTime = fastestResult?.estimatedDeliveryMins || 0;
  const reasonableDeliveryTimeThreshold = fastestDeliveryTime * 1.15;
  const reasonableSpeedResults = results.filter(
    (r) => r.estimatedDeliveryMins <= reasonableDeliveryTimeThreshold
  );
  
  const bestValueResult = [...reasonableSpeedResults].sort(
    (a, b) => a.finalTotal - b.finalTotal
  )[0] || cheapestResult;

  const isBestValue = platform.id === bestValueResult?.platform.id;
  const isCheapest = platform.id === cheapestResult?.platform.id;
  const isFastest = platform.id === fastestResult?.platform.id;

  const breakdown: ItemBreakdown[] = (() => {
    if (!result.itemBreakdown) return [];
    if (typeof result.itemBreakdown === 'string') {
      try { return JSON.parse(result.itemBreakdown); } catch { return []; }
    }
    return Array.isArray(result.itemBreakdown) ? result.itemBreakdown : [];
  })();

  const availableItems = breakdown.filter((item) => item.available);
  const unavailableItems = breakdown.filter((item) => !item.available);
  const platformColor = PLATFORM_COLORS[platform.slug] || platform.color || '#2D6A4F';
  const targetUrl = PLATFORM_URLS[platform.slug] || 'https://google.com';

  const handleCopyBasket = () => {
    const divider = '---------------------------------------------';
    const itemsText = availableItems
      .map((item) => `• ${item.quantity} x ${item.productName}`)
      .join('\n');
    
    const formattedText = `🛒 BasketIQ Cart for ${platform.name}
${divider}
${itemsText}
${divider}
Items Subtotal: ${formatCurrency(result.totalPrice)}
Delivery Fee: ${result.deliveryFee === 0 ? 'FREE' : formatCurrency(result.deliveryFee)}
Estimated Taxes: ${formatCurrency(result.estimatedTax)}
${divider}
Final Total: ${formatCurrency(result.finalTotal)}
Savings vs Max: ${formatCurrency(result.savingsVsMax)}
${divider}
Generated by BasketIQ`;

    navigator.clipboard.writeText(formattedText);
    setCopied(true);
    toast.success('Formatted basket copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenPlatform = () => {
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenAllSearches = () => {
    if (availableItems.length === 0) return;
    
    toast.loading('Opening tabs... Please allow popups if prompted!', {
      duration: 3000,
    });
    
    availableItems.forEach((item) => {
      const searchUrl = getPlatformSearchUrl(platform.slug, item.productName);
      window.open(searchUrl, '_blank', 'noopener,noreferrer');
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      {/* Back Link */}
      <button
        onClick={() => navigate(`/compare/${comparisonId}`)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6B6B6B] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE6] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Comparison
      </button>

      {/* Smart Recommendation Banner at top of page */}
      {bestValueResult && (
        <div className="bg-white dark:bg-[#1E1E1A] border border-[#E8E6DF] dark:border-[#2E2E28] rounded-3xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-[#2D6A4F]/10 dark:bg-[#2D6A4F]/20 rounded-xl text-[#2D6A4F] dark:text-[#49A078] shrink-0 mt-0.5 animate-pulse">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <span className="text-[10px] uppercase font-bold text-[#2D6A4F] dark:text-[#49A078] tracking-widest block">
                Store Comparison Context
              </span>
              {isBestValue ? (
                <p className="font-serif font-bold text-base text-[#1A1A1A] dark:text-[#F0EDE6] leading-snug">
                  ⭐ Excellent decision! You are ordering from <span className="text-[#2D6A4F] dark:text-[#49A078]">{platform.name}</span>, which is the recommended <span className="underline">Best Value</span> option (combines low price and fast delivery).
                </p>
              ) : isCheapest ? (
                <p className="font-serif font-bold text-base text-[#1A1A1A] dark:text-[#F0EDE6] leading-snug">
                  🟢 You are ordering from <span className="text-[#2D6A4F] dark:text-[#49A078]">{platform.name}</span>, which is your <span className="underline">Cheapest</span> store option.
                </p>
              ) : isFastest ? (
                <p className="font-serif font-bold text-base text-[#1A1A1A] dark:text-[#F0EDE6] leading-snug">
                  ⚡ You are ordering from <span className="text-[#2D6A4F] dark:text-[#49A078]">{platform.name}</span>, which is your <span className="underline">Fastest</span> delivery option (~{result.estimatedDeliveryMins} mins).
                </p>
              ) : (
                <div className="space-y-1.5">
                  <p className="font-serif font-bold text-base text-amber-700 dark:text-amber-500 leading-snug">
                    ⚠️ Just a heads up! <span className="text-[#2D6A4F] dark:text-[#49A078]">{bestValueResult.platform.name}</span> is the recommended Best Value platform for this basket.
                  </p>
                  <p className="text-xs text-[#6B6B6B] dark:text-[#A0A09A]">
                    By choosing <span className="font-medium text-[#1A1A1A] dark:text-[#F0EDE6]">{bestValueResult.platform.name}</span> instead, you could save{' '}
                    <span className="font-semibold text-[#2D6A4F] dark:text-[#49A078]">
                      {formatCurrency(result.finalTotal - bestValueResult.finalTotal)}
                    </span>{' '}
                    and get it in {bestValueResult.estimatedDeliveryMins} mins.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Platform Summary Header */}
      <div className="bg-white dark:bg-[#1E1E1A] border border-[#E8E6DF] dark:border-[#2E2E28] rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-[#E8E6DF] dark:border-[#2E2E28]">
          <div className="flex items-center space-x-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white text-2xl shadow-md shrink-0 animate-scale-in"
              style={{ backgroundColor: platformColor }}
            >
              {platform.name.charAt(0)}
            </div>
            <div>
              <h1 className="font-serif font-bold text-2xl text-[#1A1A1A] dark:text-[#F0EDE6]">
                Order on {platform.name}
              </h1>
              <p className="text-xs text-[#6B6B6B] dark:text-[#A0A09A] mt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>~{result.estimatedDeliveryMins} min delivery</span>
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs text-[#6B6B6B] dark:text-[#A0A09A] block">Handoff Total</span>
            <span className="font-serif font-bold text-3xl text-[#2D6A4F] dark:text-[#40916C]">
              {formatCurrency(result.finalTotal)}
            </span>
          </div>
        </div>

        {/* Highlight breakdown numbers */}
        <div className="grid grid-cols-3 gap-4 pt-6 text-xs">
          {[
            { label: 'Available', value: `${availableItems.length} items` },
            { label: 'Delivery Fee', value: result.deliveryFee === 0 ? 'FREE' : formatCurrency(result.deliveryFee), green: result.deliveryFee === 0 },
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

      {/* Cart Items list */}
      <div className="bg-white dark:bg-[#1E1E1A] border border-[#E8E6DF] dark:border-[#2E2E28] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[#E8E6DF] dark:border-[#2E2E28] bg-[#F8F6F0] dark:bg-[#242420] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="font-serif font-bold text-base text-[#1A1A1A] dark:text-[#F0EDE6]">
              Items in your Basket
            </h2>
            <span className="text-xs text-[#6B6B6B] dark:text-[#A0A09A]">
              {availableItems.length} items to order
            </span>
          </div>
          {availableItems.length > 0 && (
            <button
              onClick={handleOpenAllSearches}
              className="text-xs bg-[#2D6A4F] hover:bg-[#245A42] text-white font-semibold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Open All Items in Tabs</span>
            </button>
          )}
        </div>
        <div className="divide-y divide-[#E8E6DF] dark:divide-[#2E2E28]">
          {availableItems.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between px-6 py-3.5 hover:bg-[#F8F6F0]/30 dark:hover:bg-[#242420]/30 transition-colors">
              <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
                <ShoppingBag className="w-4 h-4 text-[#9B9B9B] shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#1A1A1A] dark:text-[#F0EDE6] truncate">
                    {item.productName}
                  </p>
                  <p className="text-xs text-[#9B9B9B]">Qty: {item.quantity}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 shrink-0">
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#1A1A1A] dark:text-[#F0EDE6]">
                    {item.totalPrice ? formatCurrency(item.totalPrice) : '—'}
                  </p>
                  {item.mrp && item.unitPrice && item.mrp > item.unitPrice && (
                    <p className="text-[10px] text-[#9B9B9B] line-through">₹{item.mrp}</p>
                  )}
                </div>
                
                {/* Per-item search button */}
                <button
                  onClick={() => window.open(getPlatformSearchUrl(platform.slug, item.productName), '_blank')}
                  title={`Search for "${item.productName}" on ${platform.name}`}
                  className="p-2 border border-[#E8E6DF] dark:border-[#3E3E38] hover:border-[#2D6A4F] text-[#6B6B6B] hover:text-[#2D6A4F] dark:hover:text-[#49A078] rounded-lg bg-white dark:bg-[#1E1E1A] transition-colors cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {/* Out of Stock notice */}
          {unavailableItems.map((item, idx) => (
            <div key={`un-${idx}`} className="flex items-center justify-between px-6 py-3.5 bg-red-50/10 dark:bg-red-950/5">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-500/80 dark:text-red-400/80 line-through">
                    {item.productName}
                  </p>
                  <p className="text-xs text-red-400">Unavailable at this store</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-red-500 font-medium">Out of Stock</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Copy & Handoff CTA Section */}
      <div className="bg-white dark:bg-[#1E1E1A] border border-[#E8E6DF] dark:border-[#2E2E28] rounded-2xl p-6 space-y-4 shadow-sm text-center">
        <h3 className="font-serif font-bold text-lg text-[#1A1A1A] dark:text-[#F0EDE6]">
          Ready to order?
        </h3>
        <p className="text-xs text-[#6B6B6B] dark:text-[#A0A09A] max-w-md mx-auto">
          Copy your items list, open {platform.name}, and build your basket quickly. We will transition you directly to their website.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={handleCopyBasket}
            className="px-6 py-3.5 border border-[#E8E6DF] dark:border-[#2E2E28] text-sm font-semibold text-[#1A1A1A] dark:text-[#F0EDE6] rounded-xl hover:border-[#2D6A4F] transition-all flex items-center justify-center gap-2 font-medium cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-[#2D6A4F]" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Basket Copied!' : 'Copy Formatted Basket'}</span>
          </button>
          
          <button
            onClick={handleOpenPlatform}
            className="px-8 py-3.5 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:opacity-90 flex-1 sm:flex-initial cursor-pointer"
            style={{ backgroundColor: platformColor }}
          >
            <span>Open {platform.name}</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Savings Footer Banner */}
      {result.savingsVsMax > 0 && (
        <div className="flex items-center justify-center gap-2 p-4 bg-[#2D6A4F]/10 dark:bg-[#2D6A4F]/20 rounded-2xl text-center">
          <TrendingDown className="w-4 h-4 text-[#2D6A4F]" />
          <p className="text-xs text-[#2D6A4F] font-semibold">
            Smart Decision! Ordering here saves you {formatCurrency(result.savingsVsMax)} compared to other options.
          </p>
        </div>
      )}
    </div>
  );
};
