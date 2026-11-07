import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { ShoppingBasket, ArrowRight, Lock, Mail } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      navigate('/cart');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white dark:bg-[#1E1E1A] border border-[#E8E6DF] dark:border-[#2E2E28] rounded-3xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#2D6A4F] text-white flex items-center justify-center mx-auto mb-4">
            <ShoppingBasket className="w-6 h-6" />
          </div>
          <h1 className="font-serif font-bold text-2xl text-[#1A1A1A] dark:text-[#F0EDE6]">
            Welcome Back
          </h1>
          <p className="text-xs text-[#6B6B6B] dark:text-[#A0A09A] mt-1">
            Log in to access your saved carts & price analytics
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-[#F0EDE6] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#9B9B9B] absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-[#F8F6F0] dark:bg-[#242420] border border-[#E8E6DF] dark:border-[#3E3E38] rounded-xl text-sm text-[#1A1A1A] dark:text-[#F0EDE6] focus:outline-none focus:border-[#2D6A4F]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-[#F0EDE6] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9B9B9B] absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-[#F8F6F0] dark:bg-[#242420] border border-[#E8E6DF] dark:border-[#3E3E38] rounded-xl text-sm text-[#1A1A1A] dark:text-[#F0EDE6] focus:outline-none focus:border-[#2D6A4F]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-[#2D6A4F] hover:bg-[#245A42] text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center space-x-2 shadow-xs"
          >
            <span>{loading ? 'Logging in...' : 'Log in'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#6B6B6B] dark:text-[#A0A09A]">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#2D6A4F] dark:text-[#40916C] font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};
