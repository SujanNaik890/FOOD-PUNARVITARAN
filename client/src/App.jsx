import React, { useState } from 'react';
import { Hero3DCanvas } from './components/Hero3DCanvas';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './features/auth/AuthModal';
import { DonorPortal } from './features/donor/DonorPortal';
import { NGOPortal } from './features/ngo/NGOPortal';
import { AdminPortal } from './features/admin/AdminPortal';
import {
  Utensils,
  Building2,
  ArrowRight,
  Sparkles,
  LogOut,
  ShieldCheck,
  User
} from 'lucide-react';

function MainApp() {
  const { user, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authDefaultRole, setAuthDefaultRole] = useState('DONOR');
  const [activePortal, setActivePortal] = useState('DONOR');

  React.useEffect(() => {
    if (user?.role) {
      setActivePortal(user.role);
    }
  }, [user?.role]);

  const openAuth = (role = 'DONOR') => {
    setAuthDefaultRole(role);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7EF] text-[#202820]">
      {/* Navigation Bar */}
      <nav className="w-full border-b border-[#DDE9DC] bg-[#FAF7EF]/90 backdrop-blur-md sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#164B38] flex items-center justify-center text-white font-bold text-xl shadow-md">
            FP
          </div>
          <div>
            <span className="font-serif-heading text-2xl font-bold tracking-tight text-[#164B38]">
              FOOD PUNARVITARAN
            </span>
            <span className="block text-xs uppercase tracking-widest text-[#F28B45] font-semibold">
              Bengaluru Chapter
            </span>
          </div>
        </div>

        {user ? (
          <div className="flex items-center gap-3">
            {/* Multi-Portal Page Switcher */}
            <div className="flex items-center bg-white/80 p-1 rounded-full border border-[#DDE9DC] shadow-xs">
              <button
                onClick={() => setActivePortal('DONOR')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activePortal === 'DONOR'
                    ? 'bg-[#164B38] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Utensils size={13} /> Donor Portal
              </button>
              <button
                onClick={() => setActivePortal('NGO_MANAGER')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activePortal === 'NGO_MANAGER'
                    ? 'bg-[#164B38] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Building2 size={13} /> NGO Shelter
              </button>
              <button
                onClick={() => setActivePortal('ADMIN')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activePortal === 'ADMIN'
                    ? 'bg-[#164B38] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ShieldCheck size={13} /> Admin Operations
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DDE9DC] text-xs font-semibold text-[#164B38]">
              <User size={14} />
              <span>{user.name}</span>
              <span className="opacity-60 font-mono">({user.role})</span>
            </div>
            <button
              onClick={logout}
              className="px-3.5 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-full transition-all flex items-center gap-1.5"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => openAuth('ADMIN')}
              className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-all"
            >
              Admin Portal
            </button>
            <button
              onClick={() => openAuth('DONOR')}
              className="px-4 py-2 text-sm font-semibold text-[#164B38] border border-[#164B38] rounded-full hover:bg-[#164B38] hover:text-white transition-all shadow-sm"
            >
              Log In
            </button>
            <button
              onClick={() => openAuth('DONOR')}
              className="px-5 py-2 text-sm font-semibold text-white bg-[#F28B45] hover:bg-[#e07a34] rounded-full transition-all shadow-md flex items-center gap-1.5"
            >
              Get Started <ArrowRight size={16} />
            </button>
          </div>
        )}
      </nav>

      {/* Main Body Routing based on Authenticated Selection */}
      {user ? (
        <main className="flex-1">
          {activePortal === 'DONOR' && <DonorPortal />}
          {activePortal === 'NGO_MANAGER' && <NGOPortal />}
          {activePortal === 'ADMIN' && <AdminPortal />}
        </main>
      ) : (
        /* Public Landing Page */
        <main className="flex-1">
          {/* Hero Section */}
          <header className="relative px-6 pt-12 pb-20 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DDE9DC] text-[#164B38] text-xs font-semibold uppercase tracking-wider">
                <Sparkles size={14} className="text-[#F28B45]" />
                AI-Assisted Surplus Food Logistics
              </div>
              <h1 className="font-serif-heading text-5xl lg:text-6xl font-bold leading-tight text-[#103B2D]">
                Rescue Food. <br />
                <span className="text-[#F28B45]">Restore Hope.</span>
              </h1>
              <p className="text-lg text-gray-700 leading-relaxed max-w-xl">
                Connecting Bengaluru’s hotels, restaurants, banquets and households directly to verified shelters and community kitchens with algorithmic routing and dual OTP verification.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
                <button
                  onClick={() => openAuth('DONOR')}
                  className="px-8 py-3.5 bg-[#164B38] hover:bg-[#103B2D] text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Utensils size={18} /> Donate Surplus Meals
                </button>
                <button
                  onClick={() => openAuth('NGO_MANAGER')}
                  className="px-8 py-3.5 bg-white border border-[#DDE9DC] text-[#164B38] hover:border-[#164B38] rounded-full font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Building2 size={18} /> Register as an NGO
                </button>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-[#DDE9DC]">
                <div>
                  <div className="text-2xl font-bold text-[#164B38] font-serif-heading">15 Mins</div>
                  <div className="text-xs text-gray-600">NGO Dispatch Lock</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#164B38] font-serif-heading">100%</div>
                  <div className="text-xs text-gray-600">Verified Shelter Receipt</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#F28B45] font-serif-heading">25 km</div>
                  <div className="text-xs text-gray-600">Bengaluru Fresh Corridor</div>
                </div>
              </div>
            </div>

            {/* 3D Visualizer */}
            <div className="flex-1 w-full max-w-lg lg:max-w-none flex justify-center">
              <Hero3DCanvas />
            </div>
          </header>

          {/* 4-Step Narrative Section */}
          <section className="py-20 bg-[#DDE9DC]/40 border-y border-[#DDE9DC] px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center space-y-3 mb-16">
                <span className="text-xs uppercase tracking-widest text-[#F28B45] font-bold">
                  The Journey of Hope
                </span>
                <h2 className="text-3xl md:text-4xl font-serif-heading font-bold text-[#103B2D]">
                  How FoodBridge Rescues Every Portion
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  From banquet kitchens to community dining halls, each handover is governed by deterministic matching and dual OTP verification.
                </p>
              </div>

              <div className="grid md:grid-cols-4 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#DDE9DC] space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#164B38] text-white flex items-center justify-center font-bold">
                    1
                  </div>
                  <h3 className="font-semibold text-lg text-[#164B38]">1. Surplus Notification</h3>
                  <p className="text-sm text-gray-600">
                    Donors log dietary type, cooked time, portions, and pickup coordinates. Shelf life is validated immediately.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#DDE9DC] space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#F28B45] text-white flex items-center justify-center font-bold">
                    2
                  </div>
                  <h3 className="font-semibold text-lg text-[#164B38]">2. Algorithmic Match</h3>
                  <p className="text-sm text-gray-600">
                    Our engine computes distance decay, dietary rules, and NGO headcounts to select the highest-impact recipient.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#DDE9DC] space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#164B38] text-white flex items-center justify-center font-bold">
                    3
                  </div>
                  <h3 className="font-semibold text-lg text-[#164B38]">3. Secure Dispatch</h3>
                  <p className="text-sm text-gray-600">
                    Authorized fleet vehicles collect food using cryptographically secure pickup OTPs confirmed on-site.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#DDE9DC] space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#103B2D] text-white flex items-center justify-center font-bold">
                    4
                  </div>
                  <h3 className="font-semibold text-lg text-[#164B38]">4. Verified Receipt</h3>
                  <p className="text-sm text-gray-600">
                    NGO managers upload proof photos, confirm received quantity, and donors earn verified leaderboard credits.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultRole={authDefaultRole}
      />

      {/* Footer */}
      <footer className="mt-auto bg-[#103B2D] text-white py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="font-serif-heading text-2xl font-bold tracking-tight">FOOD PUNARVITARAN</span>
            <p className="text-xs text-gray-300 mt-1">Rescue Food. Restore Hope. | Bengaluru, India</p>
          </div>
          <div className="text-xs text-gray-400">
            Powered by Node.js, Express, React, Three.js, and Google Gemini AI Assistant.
          </div>
        </div>
      </footer>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('UI Render Error caught by boundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-lg mx-auto my-12 bg-white rounded-3xl border border-red-200 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-gray-900">Portal Display Notice</h2>
          <p className="text-xs text-gray-600">
            {this.state.error?.message || 'Rendering issue detected.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#164B38] text-white rounded-xl text-xs font-bold"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ErrorBoundary>
  );
}
