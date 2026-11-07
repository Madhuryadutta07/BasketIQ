import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartSidebar } from './components/CartSidebar';
import { CommandPalette } from './components/CommandPalette';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CartPage } from './pages/CartPage';
import { ComparePage } from './pages/ComparePage';
import { StoreBreakdownPage } from './pages/StoreBreakdownPage';
import { HandoffPage } from './pages/HandoffPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col bg-[#FAFAF8] dark:bg-[#0F0F0D] text-[#1A1A1A] dark:text-[#F0EDE6] selection:bg-[#2D6A4F] selection:text-white">
          <Navbar onOpenCommandPalette={() => setCommandPaletteOpen(true)} />
          
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/compare/:id" element={<ComparePage />} />
              <Route path="/compare/:comparisonId/store/:platformId" element={<StoreBreakdownPage />} />
              <Route path="/handoff/:platformSlug" element={<HandoffPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          <Footer />
          <CartSidebar />
          <CommandPalette
            isOpen={commandPaletteOpen}
            onClose={() => setCommandPaletteOpen(false)}
          />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
