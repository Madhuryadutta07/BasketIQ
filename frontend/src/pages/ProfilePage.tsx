import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, formatCurrency } from '../lib/api';
import type { SavedList, Comparison } from '../types';
import { LogOut, ArrowRight, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [savedLists, setSavedLists] = useState<SavedList[]>([]);
  const [recentComparisons, setRecentComparisons] = useState<Comparison[]>([]);
  const [totalSavings, setTotalSavings] = useState(0);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await api.get('/profile');
        setSavedLists(res.data.savedLists || []);
        setRecentComparisons(res.data.recentComparisons || []);
        setTotalSavings(res.data.totalSavings || 0);
      } catch (err) {
        console.error('Fetch profile error:', err);
      }
    };
    if (user) fetchProfileData();
  }, [user]);

  const handleDeleteList = async (id: string) => {
    try {
      await api.delete(`/profile/saved-lists/${id}`);
      setSavedLists(savedLists.filter((l) => l.id !== id));
      toast.success('Saved list deleted');
    } catch (err) {
      toast.error('Failed to delete list');
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <h2 className="font-serif font-bold text-2xl mb-2">Please Log In</h2>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2.5 bg-[#2D6A4F] text-white font-semibold text-xs rounded-xl"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header */}
      <div className="bg-white dark:bg-[#1E1E1A] border border-[#E8E6DF] dark:border-[#2E2E28] rounded-3xl p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center font-bold text-2xl shadow-md">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#1A1A1A] dark:text-[#F0EDE6]">
              {user.name}
            </h1>
            <p className="text-xs text-[#6B6B6B] dark:text-[#A0A09A]">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="p-4 bg-[#F8F6F0] dark:bg-[#242420] rounded-2xl border border-[#E8E6DF] dark:border-[#2E2E28] text-right">
            <span className="text-[10px] uppercase font-semibold text-[#9B9B9B] block">Lifetime Savings</span>
            <span className="font-serif font-bold text-xl text-[#2D6A4F] dark:text-[#40916C]">
              {formatCurrency(totalSavings)}
            </span>
          </div>

          <button
            onClick={logout}
            className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-2xl border border-[#E8E6DF] dark:border-[#2E2E28] transition-colors"
            title="Log out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid: Saved Lists & Comparison History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Saved Lists */}
        <div className="bg-white dark:bg-[#1E1E1A] border border-[#E8E6DF] dark:border-[#2E2E28] rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="font-serif font-bold text-xl text-[#1A1A1A] dark:text-[#F0EDE6]">
            Saved Baskets ({savedLists.length})
          </h2>

          {savedLists.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#9B9B9B]">
              No saved lists yet. Save your favorite grocery lists for quick comparisons!
            </div>
          ) : (
            <div className="space-y-3">
              {savedLists.map((list) => (
                <div
                  key={list.id}
                  className="flex items-center justify-between p-4 bg-[#F8F6F0] dark:bg-[#242420] rounded-2xl border border-[#E8E6DF] dark:border-[#2E2E28]"
                >
                  <div>
                    <h4 className="font-semibold text-sm text-[#1A1A1A] dark:text-[#F0EDE6]">
                      {list.name}
                    </h4>
                    <p className="text-xs text-[#6B6B6B] dark:text-[#A0A09A]">
                      {list.cart?._count?.items || 0} items • Created {new Date(list.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteList(list.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comparison History */}
        <div className="bg-white dark:bg-[#1E1E1A] border border-[#E8E6DF] dark:border-[#2E2E28] rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="font-serif font-bold text-xl text-[#1A1A1A] dark:text-[#F0EDE6]">
            Recent Comparisons ({recentComparisons.length})
          </h2>

          {recentComparisons.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#9B9B9B]">
              No past comparisons found. Build a cart and click compare!
            </div>
          ) : (
            <div className="space-y-3">
              {recentComparisons.map((comp) => {
                const topResult = comp.results[0];
                return (
                  <div
                    key={comp.id}
                    onClick={() => navigate(`/compare/${comp.id}`)}
                    className="flex items-center justify-between p-4 bg-[#F8F6F0] dark:bg-[#242420] rounded-2xl border border-[#E8E6DF] dark:border-[#2E2E28] hover:border-[#2D6A4F] cursor-pointer transition-all"
                  >
                    <div>
                      <span className="text-xs font-medium text-[#6B6B6B] dark:text-[#A0A09A]">
                        {new Date(comp.createdAt).toLocaleDateString()} • {comp.cart?._count?.items || 0} items
                      </span>
                      {topResult && (
                        <p className="text-sm font-semibold text-[#1A1A1A] dark:text-[#F0EDE6]">
                          Best: {topResult.platform.name} ({formatCurrency(topResult.finalTotal)})
                        </p>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#2D6A4F]" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
