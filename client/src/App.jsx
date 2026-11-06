import React, { useState } from 'react';
import { HomePage } from './components/HomePage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './features/auth/AuthModal';
import { DonorPortal } from './features/donor/DonorPortal';
import { NGOPortal } from './features/ngo/NGOPortal';
import { AdminPortal } from './features/admin/AdminPortal';
import {
  Utensils,
  Building2,
  ArrowRight,
  LogOut,
  ShieldCheck,
  User,
  HeartHandshake
} from 'lucide-react';

function MainApp() {
  const { user, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authDefaultRole, setAuthDefaultRole] = useState('DONOR');

  const openAuth = (role = 'DONOR') => {
    setAuthDefaultRole(role);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7EF] text-[#202820]">
      {/* Navigation Bar */}
      <nav className="w-full border-b border-[#DDE9DC] bg-[#FAF7EF]/90 backdrop-blur-md sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-[#164B38] flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform overflow-hidden p-1">
            <img src="/favicon.svg" alt="Food Punarvitaran Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-serif-heading text-xl sm:text-2xl font-bold tracking-tight text-[#164B38]">
              FOOD PUNARVITARAN
            </span>
            <span className="block text-xs uppercase tracking-widest text-[#F28B45] font-semibold">
              Stop Food Waste • Bengaluru
            </span>
          </div>
        </a>

        {/* Quick Nav Anchor Links for Desktop Public view */}
        {!user && (
          <div className="hidden lg:flex items-center gap-6 text-xs font-semibold text-gray-700">
            <a href="#problem" className="hover:text-[#164B38] transition-colors">The Problem</a>
            <a href="#solution" className="hover:text-[#164B38] transition-colors">Solution</a>
            <a href="#how-it-works" className="hover:text-[#164B38] transition-colors">How It Works</a>
            <a href="#features" className="hover:text-[#164B38] transition-colors">Features</a>
            <a href="#impact" className="hover:text-[#164B38] transition-colors">Impact Calculator</a>
            <a href="#stories" className="hover:text-[#164B38] transition-colors">Stories</a>
            <a href="#faq" className="hover:text-[#164B38] transition-colors">FAQ</a>
          </div>
        )}

        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DDE9DC] text-xs font-semibold text-[#164B38]">
              {user.role === 'ADMIN' && <ShieldCheck size={14} className="text-[#01B574]" />}
              {user.role === 'NGO_MANAGER' && <Building2 size={14} className="text-[#164B38]" />}
              {user.role === 'DONOR' && <Utensils size={14} className="text-[#F28B45]" />}
              <span>{user.name}</span>
              <span className="opacity-70 font-mono text-[11px] px-1.5 py-0.5 rounded bg-white/60">
                {user.role === 'ADMIN' ? 'Owner / Admin' : user.role === 'NGO_MANAGER' ? 'NGO Manager' : 'Verified Donor'}
              </span>
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

      {/* Main Body Routing Strictly Determined by User Role */}
      {user ? (
        <main className="flex-1">
          {user.role === 'ADMIN' && <AdminPortal />}
          {user.role === 'NGO_MANAGER' && <NGOPortal />}
          {user.role === 'DONOR' && <DonorPortal />}
        </main>
      ) : (
        /* Rich One-Page Public Landing Page */
        <main className="flex-1">
          <HomePage onOpenAuth={openAuth} />
        </main>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultRole={authDefaultRole}
      />

      {/* Footer */}
      <footer className="mt-auto bg-[#103B2D] text-white py-14 px-6 border-t border-[#164B38]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-[#FAF7EF] text-[#103B2D] flex items-center justify-center font-bold text-lg overflow-hidden p-1">
                <img src="/favicon.svg" alt="Food Punarvitaran Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-serif-heading text-lg sm:text-xl font-bold tracking-tight">FOOD PUNARVITARAN</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Bridging surplus food from restaurants, hotels, banquets, and homes to verified care shelters across Bengaluru. Zero Waste. Zero Hunger.
            </p>
            <div className="text-xs text-[#F28B45] font-semibold">
              UN SDG 2 (Zero Hunger) & SDG 12 (Responsible Consumption)
            </div>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#F28B45] mb-3">Quick Navigation</h5>
            <ul className="text-xs space-y-2 text-gray-300">
              <li><a href="#problem" className="hover:text-white transition-colors">The Challenge & Paradox</a></li>
              <li><a href="#solution" className="hover:text-white transition-colors">Our Bridge Solution</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Platform Capabilities</a></li>
              <li><a href="#impact" className="hover:text-white transition-colors">Impact Calculator</a></li>
              <li><a href="#stories" className="hover:text-white transition-colors">Community Testimonials</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Safety & FAQs</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#F28B45] mb-3">Participation Portals</h5>
            <ul className="text-xs space-y-2 text-gray-300">
              <li><button onClick={() => openAuth('DONOR')} className="hover:text-white transition-colors cursor-pointer text-left">Food Donor Sign In / Register</button></li>
              <li><button onClick={() => openAuth('NGO_MANAGER')} className="hover:text-white transition-colors cursor-pointer text-left">NGO Shelter Verification Portal</button></li>
              <li><button onClick={() => openAuth('ADMIN')} className="hover:text-white transition-colors cursor-pointer text-left">Dispatch & Admin Control</button></li>
              <li><a href="#impact" className="hover:text-white transition-colors">Calculate ESG Footprint</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#F28B45] mb-3">Bengaluru Headquarters</h5>
            <p className="text-xs text-gray-300">
              FoodBridge Innovation Hub<br />
              Indiranagar 100ft Road, Bengaluru, Karnataka 560038
            </p>
            <p className="text-xs text-gray-400 font-mono">
              Emergency Logistics Helpline: +91 (080) 4920-FOOD<br />
              Email: contact@foodbridge.org
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div>
            © {new Date().getFullYear()} FOOD PUNARVITARAN. Built for Stop Food Waste Social Impact Initiative.
          </div>
          <div className="flex gap-4">
            <span className="hover:text-gray-200 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-gray-200 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-gray-200 cursor-pointer">FSSAI Compliance</span>
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
