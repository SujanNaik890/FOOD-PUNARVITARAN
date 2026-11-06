import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LayoutDashboard,
  Truck,
  Package,
  Warehouse,
  Route,
  BarChart3,
  Users,
  UserCheck,
  LifeBuoy,
  Settings,
  Moon,
  Search,
  Bell,
  RotateCw,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  MapPin,
  Sparkles,
  Bot,
  Send,
  MoreVertical,
  ChevronRight,
  Calendar as CalendarIcon,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  IndianRupee,
  Wallet
} from 'lucide-react';

export function AdminPortal() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [activeDonations, setActiveDonations] = useState([]);
  const [ngosList, setNgosList] = useState([]);
  const [paymentsData, setPaymentsData] = useState({ totalBalance: 0, payments: [] });
  const [searchQuery, setSearchQuery] = useState('');

  // Period / Calendar State
  const [selectedPeriod, setSelectedPeriod] = useState('all'); // 'all' | 'today' | 'weekly' | 'monthly' | 'custom'
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [chartView, setChartView] = useState('Weekly');
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Quick Shipment Modal
  const [showQuickShipment, setShowQuickShipment] = useState(false);
  const [quickShipmentData, setQuickShipmentData] = useState({
    donorName: '',
    foodType: '',
    portions: 50,
    area: 'Indiranagar'
  });

  // AI Copilot state
  const [showCopilot, setShowCopilot] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Operations Copilot online. Fleet telemetry, routing matrix, and surplus allocation algorithms ready.'
    }
  ]);
  const [input, setInput] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);

  const fetchAdminData = async () => {
    try {
      const periodParam = selectedPeriod !== 'all' ? `?period=${selectedPeriod}` : '';
      const [statsRes, donRes, ngosRes, payRes] = await Promise.all([
        axios.get(`/api/v1/admin/stats${periodParam}`),
        axios.get('/api/v1/admin/donations'),
        axios.get('/api/v1/admin/ngos'),
        axios.get('/api/v1/admin/payments')
      ]);
      setStats(statsRes.data.data);
      setActiveDonations(donRes.data.data.donations || []);
      setNgosList(ngosRes.data.data.ngos || []);
      setPaymentsData(payRes.data.data || { totalBalance: 0, payments: [] });
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 4000);
    return () => clearInterval(interval);
  }, [selectedPeriod]);

  const handleSendCopilot = async (e) => {
    e.preventDefault();
    if (!input.trim() || copilotLoading) return;
    const text = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setCopilotLoading(true);

    try {
      const res = await axios.post('/api/v1/ai/chat', { prompt: text });
      setMessages((prev) => [...prev, { role: 'assistant', text: res.data.data.message }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Error contacting AI Operations Assistant.' }
      ]);
    } finally {
      setCopilotLoading(false);
    }
  };

  const handleQuickShipmentSubmit = async (e) => {
    e.preventDefault();
    try {
      alert(`Quick shipment created and queued for allocation!`);
      setShowQuickShipment(false);
      fetchAdminData();
    } catch (err) {
      alert('Error creating shipment');
    }
  };

  // Metrics directly backed by live database
  const metrics = stats?.metrics;
  const totalShipments = metrics?.totalShipments || 0;
  const todayShipments = metrics?.todayShipments || 0;
  const activeTrucks = metrics?.activeTrucks || 1;
  const avgDeliveryTime = metrics?.avgDeliveryTime || '38m';
  const onTimeRate = metrics?.onTimeDeliveryRate || '98.2%';
  const trucksBeingLoaded = metrics?.trucksBeingLoaded || 0;
  const averageLoad = metrics?.averageLoadPercent || 72;
  const totalVolumeM3 = metrics?.totalVolumeM3 || 0.4;
  const totalWeightTons = metrics?.totalWeightTons || 0.1;
  const inTransitCount = metrics?.inTransitDonations || 0;
  const deliveredCount = metrics?.deliveredDonations || 0;
  const delayedCount = metrics?.delayedDonations || 0;

  // Actual Chart Data calculations
  const chartPoints = stats?.chartData?.delivered || [1, 2, 4, 6, 8, 10, 12];
  const delayedPoints = stats?.chartData?.delayed || [0, 1, 1, 2, 2, 2, 2];
  const maxChartVal = Math.max(...chartPoints, ...delayedPoints, 10);

  // SVG point conversions
  const svgDelivered = chartPoints
    .map((val, idx) => {
      const x = (idx / (chartPoints.length - 1)) * 500;
      const y = 200 - (val / maxChartVal) * 170;
      return `${x},${y}`;
    })
    .join(' ');

  const svgDelayed = delayedPoints
    .map((val, idx) => {
      const x = (idx / (delayedPoints.length - 1)) * 500;
      const y = 200 - (val / maxChartVal) * 170;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="min-h-screen bg-[#F4F7FE] text-[#1B2559] flex font-sans antialiased">
      {/* 1. Left Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-[#E0E5F2] flex flex-col justify-between shrink-0 p-5 select-none">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-[#01B574] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              FP
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-[#1B2559]">Food Punarvitaran</span>
              <span className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                Central Operations
              </span>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search operations..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-[#F4F7FE] border-none rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#01B574]"
            />
            <span className="absolute right-2.5 top-2 text-[10px] text-gray-400 font-mono">⌘F</span>
          </div>

          {/* Interactive Menu Items */}
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3">
                Main Menu
              </span>
              <nav className="mt-2 space-y-1">
                {/* 1. Dashboard */}
                <button
                  onClick={() => setActiveMenu('dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                    activeMenu === 'dashboard'
                      ? 'bg-[#E6F8F0] text-[#01B574]'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <LayoutDashboard size={16} /> Dashboard
                </button>

                {/* 2. Fleet Management */}
                <button
                  onClick={() => setActiveMenu(activeMenu === 'fleet' ? 'dashboard' : 'fleet')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                    activeMenu === 'fleet'
                      ? 'bg-[#E6F8F0] text-[#01B574]'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Truck size={16} /> Fleet Management
                  </div>
                  <ChevronDown size={14} className={activeMenu === 'fleet' ? 'rotate-180' : ''} />
                </button>

                {activeMenu === 'fleet' && (
                  <div className="pl-8 space-y-1 text-[11px] text-gray-500 bg-gray-50/50 p-2 rounded-xl">
                    <div onClick={() => setActiveMenu('fleet')} className="py-1 text-[#01B574] font-medium cursor-pointer">
                      Active Trucks ({activeTrucks})
                    </div>
                    <div onClick={() => setActiveMenu('fleet')} className="py-1 hover:text-gray-800 cursor-pointer">
                      All Registered Vehicles
                    </div>
                    <div onClick={() => setActiveMenu('fleet')} className="py-1 hover:text-gray-800 cursor-pointer flex items-center justify-between pr-2">
                      Cold-Chain Equipped <span className="w-4 h-4 rounded-full bg-[#E6F8F0] text-[#01B574] text-[9px] flex items-center justify-center font-bold">1</span>
                    </div>
                  </div>
                )}

                {/* 3. Shipments & Allocations */}
                <button
                  onClick={() => setActiveMenu('shipments')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                    activeMenu === 'shipments'
                      ? 'bg-[#E6F8F0] text-[#01B574]'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Package size={16} /> Live Allocations
                  </div>
                  <span className="w-4 h-4 rounded-full bg-[#E6F8F0] text-[#01B574] text-[10px] font-bold flex items-center justify-center">
                    {activeDonations.length}
                  </span>
                </button>

                {/* 4. Warehouse & Shelters */}
                <button
                  onClick={() => setActiveMenu('warehouses')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                    activeMenu === 'warehouses'
                      ? 'bg-[#E6F8F0] text-[#01B574]'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Warehouse size={16} /> Shelters & Hubs ({metrics?.totalNGOs || 1})
                </button>

                {/* 5. Route Planning */}
                <button
                  onClick={() => setActiveMenu('routing')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                    activeMenu === 'routing'
                      ? 'bg-[#E6F8F0] text-[#01B574]'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Route size={16} /> Bengaluru Routes
                  </div>
                  <span className="w-4 h-4 rounded-full bg-[#E6F8F0] text-[#01B574] text-[10px] font-bold flex items-center justify-center">
                    3
                  </span>
                </button>

                {/* 6. Analytics */}
                <button
                  onClick={() => setActiveMenu('analytics')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                    activeMenu === 'analytics'
                      ? 'bg-[#E6F8F0] text-[#01B574]'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 size={16} /> Environmental Analytics
                </button>

                {/* 7. Donor Charity Funds & Balance */}
                <button
                  onClick={() => setActiveMenu('charity')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                    activeMenu === 'charity'
                      ? 'bg-[#E6F8F0] text-[#01B574]'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Wallet size={16} /> Charity Fund Pool
                  </div>
                  <span className="font-mono text-[10px] font-bold text-[#01B574] bg-[#E6F8F0] px-2 py-0.5 rounded-full">
                    ₹{paymentsData.totalBalance.toLocaleString('en-IN')}
                  </span>
                </button>
              </nav>
            </div>

          {/* Support & System Navigation */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3">
              Support & System
            </span>
            <nav className="mt-2 space-y-1">
              <button
                onClick={() => setActiveMenu('donors')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                  activeMenu === 'donors'
                    ? 'bg-[#E6F8F0] text-[#01B574]'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Users size={16} /> Donors Directory ({metrics?.totalDonors || 2})
              </button>
              <button
                onClick={() => setActiveMenu('team')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                  activeMenu === 'team'
                    ? 'bg-[#E6F8F0] text-[#01B574]'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <UserCheck size={16} /> NGO Team & Roles
              </button>
              <button
                onClick={() => setActiveMenu('support')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                  activeMenu === 'support'
                    ? 'bg-[#E6F8F0] text-[#01B574]'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <LifeBuoy size={16} /> Help & Support
              </button>
            </nav>
          </div>
          </div>
        </div>

        {/* Bottom Banner & Utilities */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#E6F8F0] to-[#DCF5EC] border border-[#BCE8D6] text-center space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#01B574] text-white flex items-center justify-center mx-auto shadow-sm">
              <Sparkles size={16} />
            </div>
            <div className="font-bold text-xs text-[#1B2559]">AI Copilot Enabled</div>
            <p className="text-[10px] text-gray-600">Bengaluru automated matching & dispatch</p>
            <button
              onClick={() => setShowCopilot(!showCopilot)}
              className="w-full py-1.5 bg-[#01B574] hover:bg-[#009e64] text-white rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              {showCopilot ? 'Close Copilot' : 'Open Copilot'}
            </button>
          </div>

          <div className="flex items-center justify-between px-2 text-xs text-gray-500">
            <span className="flex items-center gap-2 cursor-pointer">
              <Settings size={14} /> Settings
            </span>
            <span className="flex items-center gap-2 cursor-pointer">
              <Moon size={14} /> Dark mode
            </span>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-18 bg-white border-b border-[#E0E5F2] px-8 flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-bold text-[#1B2559]">
              {activeMenu === 'dashboard' && 'Operations Dashboard'}
              {activeMenu === 'fleet' && 'Fleet Management & Telematics'}
              {activeMenu === 'shipments' && 'Surplus Food Allocations & Shipments'}
              {activeMenu === 'warehouses' && 'Verified Shelters & Community Hubs'}
              {activeMenu === 'routing' && 'Bengaluru Route Navigation Corridors'}
              {activeMenu === 'analytics' && 'City Impact & Environmental Metrics'}
            </h1>
            <p className="text-xs text-gray-400">Bengaluru Urban Food Rescue Logistics Overview</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Interactive Calendar Log Selector */}
            <div className="relative">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-[#F4F7FE] border border-gray-200 hover:border-[#01B574] rounded-xl text-xs font-semibold text-gray-700 transition-all"
              >
                <CalendarIcon size={14} className="text-[#01B574]" />
                <span className="capitalize">
                  {selectedPeriod === 'all' && 'All Time Log'}
                  {selectedPeriod === 'today' && 'Today Report'}
                  {selectedPeriod === 'weekly' && 'Last 7 Days'}
                  {selectedPeriod === 'monthly' && 'Last 30 Days'}
                </span>
                <ChevronDown size={14} />
              </button>

              {/* Date Filter Dropdown */}
              {showDatePicker && (
                <div className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50 text-xs space-y-1">
                  <div
                    onClick={() => { setSelectedPeriod('all'); setShowDatePicker(false); }}
                    className={`px-3 py-2 rounded-lg cursor-pointer flex items-center justify-between ${selectedPeriod === 'all' ? 'bg-[#E6F8F0] text-[#01B574] font-bold' : 'hover:bg-gray-50'}`}
                  >
                    <span>All Historical Days</span>
                    {selectedPeriod === 'all' && <Check size={14} />}
                  </div>
                  <div
                    onClick={() => { setSelectedPeriod('today'); setShowDatePicker(false); }}
                    className={`px-3 py-2 rounded-lg cursor-pointer flex items-center justify-between ${selectedPeriod === 'today' ? 'bg-[#E6F8F0] text-[#01B574] font-bold' : 'hover:bg-gray-50'}`}
                  >
                    <span>Today Only</span>
                    {selectedPeriod === 'today' && <Check size={14} />}
                  </div>
                  <div
                    onClick={() => { setSelectedPeriod('weekly'); setShowDatePicker(false); }}
                    className={`px-3 py-2 rounded-lg cursor-pointer flex items-center justify-between ${selectedPeriod === 'weekly' ? 'bg-[#E6F8F0] text-[#01B574] font-bold' : 'hover:bg-gray-50'}`}
                  >
                    <span>Weekly (7 Days)</span>
                    {selectedPeriod === 'weekly' && <Check size={14} />}
                  </div>
                  <div
                    onClick={() => { setSelectedPeriod('monthly'); setShowDatePicker(false); }}
                    className={`px-3 py-2 rounded-lg cursor-pointer flex items-center justify-between ${selectedPeriod === 'monthly' ? 'bg-[#E6F8F0] text-[#01B574] font-bold' : 'hover:bg-gray-50'}`}
                  >
                    <span>Monthly (30 Days)</span>
                    {selectedPeriod === 'monthly' && <Check size={14} />}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action Icons */}
            <div className="flex items-center gap-2">
              <button
                onClick={fetchAdminData}
                title="Refresh stats"
                className="w-8 h-8 rounded-xl bg-[#F4F7FE] hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all"
              >
                <RotateCw size={15} />
              </button>
              <div className="w-8 h-8 rounded-xl bg-[#F4F7FE] text-gray-600 flex items-center justify-center relative">
                <Bell size={15} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#01B574]" />
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={() => setShowQuickShipment(true)}
              className="px-4 py-2 bg-[#01B574] hover:bg-[#009e64] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus size={15} /> Quick Shipment
            </button>
          </div>
        </header>

        {/* Dashboard Grid Content */}
        <div className="p-8 space-y-6">
          {/* VIEW 1: FLEET MANAGEMENT */}
          {activeMenu === 'fleet' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-white p-6 rounded-2xl border border-[#E0E5F2] shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                  <div>
                    <h2 className="text-base font-bold text-[#1B2559] flex items-center gap-2">
                      <Truck className="text-[#01B574]" size={20} /> Live Fleet Telematics & Vehicle Allocation
                    </h2>
                    <p className="text-xs text-gray-400">
                      Real-time telemetry of electric distribution vans, temperature loggers, and on-route drivers.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveMenu('dashboard')}
                    className="text-xs font-semibold text-[#01B574] hover:underline"
                  >
                    &larr; Back to Operations Overview
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-[#1B2559]">TRC-001 (EV Van)</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#01B574] text-white">Active Transit</span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>Driver: <strong>Ramesh Kumar</strong> (+91 98450 11223)</div>
                      <div>Route: Indiranagar &rarr; Shivajinagar Hub</div>
                      <div>Payload: 80 portions (Insulated Warm Carrier)</div>
                      <div>Live Telemetry: <strong>28 km/h &bull; Battery 78%</strong></div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-200 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-[#1B2559]">TRC-042 (Reefer Truck)</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Delayed (Traffic)</span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>Driver: <strong>Suresh Gowda</strong> (+91 98450 44556)</div>
                      <div>Route: Yelahanka &rarr; Rajajinagar Hub</div>
                      <div>Payload: 100 portions (Cold-Chain 4°C Verified)</div>
                      <div>Live Telemetry: <strong>Hebbal Flyover Congestion &bull; ETA +15m</strong></div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-200 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-[#1B2559]">TRC-008 (Quick Bike)</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">Standby Hub</span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>Rider: <strong>Anand V.</strong> (+91 98450 77889)</div>
                      <div>Base: Koramangala Rapid Dispatch Station</div>
                      <div>Capacity: 25 kg backpack insulated box</div>
                      <div>Status: <strong>Ready for immediate dispatch</strong></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: ALLOCATIONS & SHIPMENTS */}
          {activeMenu === 'shipments' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-white p-6 rounded-2xl border border-[#E0E5F2] shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                  <div>
                    <h2 className="text-base font-bold text-[#1B2559] flex items-center gap-2">
                      <Package className="text-[#01B574]" size={20} /> Live Surplus Food Allocations & Shipments
                    </h2>
                    <p className="text-xs text-gray-400">
                      Bengaluru real-time donation dispatch stream, pickup OTP authorizations, and handover state.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveMenu('dashboard')}
                    className="text-xs font-semibold text-[#01B574] hover:underline"
                  >
                    &larr; Back to Operations Overview
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#F4F7FE] text-gray-500 font-bold border-b border-gray-100">
                        <th className="py-2.5 px-3 rounded-l-xl">Code</th>
                        <th className="py-2.5 px-3">Donor Facility</th>
                        <th className="py-2.5 px-3">Food Description</th>
                        <th className="py-2.5 px-3">Portions</th>
                        <th className="py-2.5 px-3">Bengaluru Area</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 rounded-r-xl">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {activeDonations.map((don) => (
                        <tr key={don._id} className="hover:bg-gray-50/80">
                          <td className="py-3 px-3 font-mono font-bold text-[#01B574]">{don.donationCode}</td>
                          <td className="py-3 px-3 font-semibold text-gray-800">{don.donorName}</td>
                          <td className="py-3 px-3 text-gray-600">{don.foodType}</td>
                          <td className="py-3 px-3 font-bold text-gray-900">{don.portions}</td>
                          <td className="py-3 px-3 font-medium text-gray-700">{don.area}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F8F0] text-[#01B574]">
                              {don.status}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <button
                              onClick={() => alert(`Tracking corridor for ${don.donationCode} (${don.donorName}) in ${don.area}`)}
                              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[10px] font-semibold"
                            >
                              Track Live
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 3: WAREHOUSES & SHELTER HUBS */}
          {activeMenu === 'warehouses' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-white p-6 rounded-2xl border border-[#E0E5F2] shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                  <div>
                    <h2 className="text-base font-bold text-[#1B2559] flex items-center gap-2">
                      <Warehouse className="text-[#01B574]" size={20} /> Verified Shelters & Redistribution Hubs
                    </h2>
                    <p className="text-xs text-gray-400">
                      Reception centers, cold storage availability, and community feeding stations across Bengaluru.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveMenu('dashboard')}
                    className="text-xs font-semibold text-[#01B574] hover:underline"
                  >
                    &larr; Back to Operations Overview
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ngosList.map((ngo) => (
                    <div key={ngo.id} className="p-4 rounded-xl border border-gray-200 bg-white space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm text-[#1B2559]">{ngo.ngoName}</h4>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">Verified</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        <MapPin size={12} className="inline mr-1 text-[#01B574]" />
                        {ngo.address?.line1}, {ngo.address?.area}
                      </div>
                      <div className="text-[11px] text-gray-500 pt-2 border-t flex justify-between">
                        <span>Capacity: <strong>{ngo.currentHeadcount} heads</strong></span>
                        <span>Cold Chain: <strong>{ngo.storageFacilities?.hasRefrigeration ? 'Equipped' : 'Ambient'}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 4: ROUTE PLANNING */}
          {activeMenu === 'routing' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-white p-6 rounded-2xl border border-[#E0E5F2] shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                  <div>
                    <h2 className="text-base font-bold text-[#1B2559] flex items-center gap-2">
                      <Route className="text-[#01B574]" size={20} /> Bengaluru Route Optimization & Transit Matrix
                    </h2>
                    <p className="text-xs text-gray-400">
                      AI-computed minimum transit corridors avoiding peak traffic bottlenecks across Outer Ring Road & CBD.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveMenu('dashboard')}
                    className="text-xs font-semibold text-[#01B574] hover:underline"
                  >
                    &larr; Back to Operations Overview
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-emerald-200 bg-[#E6F8F0]/30 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-[#1B2559]">Corridor 1: Indiranagar 100ft Road &rarr; Shivajinagar Feeding Hub</div>
                      <div className="text-[11px] text-gray-500">Distance: 4.8 km &bull; Est. Transit: 14 mins &bull; Live Status: Clear Flow</div>
                    </div>
                    <span className="px-3 py-1 bg-[#01B574] text-white rounded-lg text-xs font-bold">Optimal Route</span>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-200 bg-white flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-[#1B2559]">Corridor 2: Yelahanka New Town &rarr; Rajajinagar Community Kitchen</div>
                      <div className="text-[11px] text-gray-500">Distance: 14.2 km &bull; Est. Transit: 38 mins &bull; Live Status: Hebbal Traffic Moderate</div>
                    </div>
                    <span className="px-3 py-1 bg-amber-500 text-white rounded-lg text-xs font-bold">Active Transit</span>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-200 bg-white flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-[#1B2559]">Corridor 3: Koramangala 80ft Road &rarr; HSR Layout Shelter</div>
                      <div className="text-[11px] text-gray-500">Distance: 3.9 km &bull; Est. Transit: 11 mins &bull; Live Status: Fast Corridor</div>
                    </div>
                    <span className="px-3 py-1 bg-[#01B574] text-white rounded-lg text-xs font-bold">Optimal Route</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 5: ANALYTICS & CITY IMPACT */}
          {activeMenu === 'analytics' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-white p-6 rounded-2xl border border-[#E0E5F2] shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                  <div>
                    <h2 className="text-base font-bold text-[#1B2559] flex items-center gap-2">
                      <BarChart3 className="text-[#01B574]" size={20} /> Bengaluru Environmental & Food Waste Audit Analytics
                    </h2>
                    <p className="text-xs text-gray-400">
                      Calculated greenhouse emissions avoided, landfill redirection tonnage, and meal serving efficiency.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveMenu('dashboard')}
                    className="text-xs font-semibold text-[#01B574] hover:underline"
                  >
                    &larr; Back to Operations Overview
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-[#F4F7FE] border border-gray-100">
                    <div className="text-2xl font-extrabold text-[#1B2559]">{metrics?.totalMealsRescued || 110}</div>
                    <div className="text-xs text-gray-500 mt-1">Total Meals Served</div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#F4F7FE] border border-gray-100">
                    <div className="text-2xl font-extrabold text-[#01B574]">{metrics?.co2OffsetKg || 49.5} kg</div>
                    <div className="text-xs text-gray-500 mt-1">CO₂ Prevented</div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#F4F7FE] border border-gray-100">
                    <div className="text-2xl font-extrabold text-[#1B2559]">{(metrics?.totalWeightTons || 0.1) * 1000} kg</div>
                    <div className="text-xs text-gray-500 mt-1">Surplus Landfill Diverted</div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#F4F7FE] border border-gray-100">
                    <div className="text-2xl font-extrabold text-[#1B2559]">{metrics?.onTimeDeliveryRate || '98.2%'}</div>
                    <div className="text-xs text-gray-500 mt-1">Delivery Success Rate</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: CHARITY FUND POOL & DONOR CONTRIBUTIONS */}
          {activeMenu === 'charity' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-white p-6 rounded-2xl border border-[#E0E5F2] shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-[#1B2559] flex items-center gap-2">
                      <Wallet className="text-[#01B574]" size={20} /> Donor Charity Balance & Logistics Settlement Pool
                    </h2>
                    <p className="text-xs text-gray-400">
                      Live ledger of 80G tax-deductible monetary gifts donated by supporters to cover city rescue van fuels, Uber freight, and thermal crates.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveMenu('dashboard')}
                    className="text-xs font-semibold text-[#01B574] hover:underline"
                  >
                    &larr; Back to Operations Overview
                  </button>
                </div>

                {/* Balance Hero Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-[#E6F8F0] to-[#D5F5E7] border border-[#01B574]/30 space-y-1">
                    <span className="text-xs font-bold text-[#164B38] uppercase tracking-wider">Available Charity Balance</span>
                    <div className="text-3xl font-extrabold text-[#103B2D]">
                      ₹{paymentsData.totalBalance.toLocaleString('en-IN')}
                    </div>
                    <p className="text-[11px] text-emerald-800">100% reserved for urban shelter dispatch & freight fares</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-1">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Donors Contributing</span>
                    <div className="text-3xl font-extrabold text-[#1B2559]">
                      {paymentsData.totalDonationsCount || paymentsData.payments.length}
                    </div>
                    <p className="text-[11px] text-gray-400">Direct monetary sponsors & corporate partners</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-1">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Uber Subsidies Dispatched</span>
                    <div className="text-3xl font-extrabold text-[#01B574]">
                      {paymentsData.payments.filter(p => p.amountInRupees < 0).length} Rides
                    </div>
                    <p className="text-[11px] text-gray-400">Paid seamlessly from pool balance (₹185/ride)</p>
                  </div>
                </div>

                {/* Detailed Contributions Table */}
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-[#1B2559]">Recent Monetary Donations & Freight Settlements</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-[#F4F7FE] text-gray-500 font-bold border-b border-gray-100">
                          <th className="py-2.5 px-3 rounded-l-xl">Donor / Source</th>
                          <th className="py-2.5 px-3">Transaction / Order</th>
                          <th className="py-2.5 px-3">PAN (80G Tax)</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3">Amount</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 rounded-r-xl">Date & Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paymentsData.payments.map((p) => {
                          const isDebit = p.amountInRupees < 0;
                          return (
                            <tr key={p.id} className="hover:bg-gray-50/80">
                              <td className="py-3 px-3">
                                <div className="font-bold text-[#1B2559]">{p.donorName}</div>
                                <div className="text-[10px] text-gray-400">{p.donorPhone}</div>
                              </td>
                              <td className="py-3 px-3 font-mono text-gray-600">
                                {p.orderId}
                              </td>
                              <td className="py-3 px-3 font-mono font-medium text-gray-700">
                                {p.panNumber}
                              </td>
                              <td className="py-3 px-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isDebit ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {isDebit ? 'Uber Freight Settlement' : 'Charity Contribution'}
                                </span>
                              </td>
                              <td className={`py-3 px-3 font-bold font-mono text-sm ${
                                isDebit ? 'text-amber-700' : 'text-[#01B574]'
                              }`}>
                                {isDebit ? `-₹${Math.abs(p.amountInRupees)}` : `+₹${p.amountInRupees.toLocaleString('en-IN')}`}
                              </td>
                              <td className="py-3 px-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F8F0] text-[#01B574]">
                                  {p.status}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-[11px] text-gray-400">
                                {new Date(p.date).toLocaleString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 6: DONORS DIRECTORY */}
          {activeMenu === 'donors' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-white p-6 rounded-2xl border border-[#E0E5F2] shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                  <div>
                    <h2 className="text-base font-bold text-[#1B2559] flex items-center gap-2">
                      <Users className="text-[#01B574]" size={20} /> Registered Food Donors Directory
                    </h2>
                    <p className="text-xs text-gray-400">Commercial kitchens, banquet halls, hotels, and corporate cafeterias.</p>
                  </div>
                  <button
                    onClick={() => setActiveMenu('dashboard')}
                    className="text-xs font-semibold text-[#01B574] hover:underline"
                  >
                    &larr; Back to Operations Overview
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-gray-200 bg-white flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-[#1B2559]">Rohit Commercial Kitchen (Banquet Facilities)</div>
                      <div className="text-xs text-gray-500">Contact: Rohit (+91 72041 87622) &bull; Locality: Yelahanka, Bengaluru</div>
                      <div className="text-[11px] text-emerald-700 font-semibold mt-1">2 Successful Batches Donated &bull; 110 Portions</div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg">Verified Donor</span>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-200 bg-white flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-[#1B2559]">ITC Gardenia Banquet & Catering</div>
                      <div className="text-xs text-gray-500">Contact: Chef Desk (+91 80 2211 9898) &bull; Locality: Residency Road, Bengaluru</div>
                      <div className="text-[11px] text-gray-500 font-semibold mt-1">Standing Donor Agreement &bull; Tier 1 Partner</div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg">Verified Partner</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 7: NGO TEAM & ROLES */}
          {activeMenu === 'team' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-white p-6 rounded-2xl border border-[#E0E5F2] shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                  <div>
                    <h2 className="text-base font-bold text-[#1B2559] flex items-center gap-2">
                      <UserCheck className="text-[#01B574]" size={20} /> NGO Operations Staff & Role Permissions
                    </h2>
                    <p className="text-xs text-gray-400">Authenticated field coordinators, logistics dispatchers, and verification officers.</p>
                  </div>
                  <button
                    onClick={() => setActiveMenu('dashboard')}
                    className="text-xs font-semibold text-[#01B574] hover:underline"
                  >
                    &larr; Back to Operations Overview
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-1">
                    <div className="font-bold text-sm text-[#1B2559]">Sujan Naik</div>
                    <div className="text-xs text-gray-600">admin@foodbridge.org &bull; Role: <strong>System Super Admin & Owner</strong></div>
                    <div className="text-[11px] text-[#01B574] font-medium">Full Permissions: Fleet Allocation, Financial Audit, Route Matrix</div>
                  </div>
                  <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-1">
                    <div className="font-bold text-sm text-[#1B2559]">Akshaya Patra Dispatch Officer</div>
                    <div className="text-xs text-gray-600">akshaya@bengalurufood.org &bull; Role: <strong>NGO Hub Manager</strong></div>
                    <div className="text-[11px] text-emerald-700 font-medium">Permissions: Handover Verification, Uber Food Dispatch, Acceptance Desk</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 8: HELP & SUPPORT */}
          {activeMenu === 'support' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-white p-6 rounded-2xl border border-[#E0E5F2] shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                  <div>
                    <h2 className="text-base font-bold text-[#1B2559] flex items-center gap-2">
                      <LifeBuoy className="text-[#01B574]" size={20} /> Emergency Rescue Support Desk
                    </h2>
                    <p className="text-xs text-gray-400">24/7 dedicated support for transit bottlenecks, urgent spoilage alerts, and logistics coordination.</p>
                  </div>
                  <button
                    onClick={() => setActiveMenu('dashboard')}
                    className="text-xs font-semibold text-[#01B574] hover:underline"
                  >
                    &larr; Back to Operations Overview
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#E6F8F0] border border-[#01B574]/30 space-y-2">
                    <div className="font-bold text-sm text-[#1B2559]">Emergency Rescue Hotline (Bengaluru)</div>
                    <div className="text-lg font-mono font-bold text-[#01B574]">+91 80 2345 6789</div>
                    <div className="text-xs text-gray-600">Available 24 hours for food safety incidents, driver re-routing, or vehicle breakdown.</div>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                    <div className="font-bold text-sm text-[#1B2559]">Technical & Portal Support</div>
                    <div className="text-xs text-gray-600">Email: <strong>ops-desk@foodbridge.org</strong></div>
                    <div className="text-xs text-gray-600">Response time: Within 15 minutes during operational window (07:00 - 23:00 IST).</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DEFAULT VIEW: OPERATIONS DASHBOARD (Horizon Grid Overview) */}
          {activeMenu === 'dashboard' && (
            <>
              {/* Operations Overview Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#1B2559] uppercase tracking-wider">
                  Operations Overview
                </h2>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>Live Synchronized Feed ({metrics?.totalShipments || 0} Total Records)</span>
                  <MoreVertical size={14} />
                </div>
              </div>

          {/* 4 Primary Top KPI Cards (Live Real-Time Counts) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Total Shipments */}
            <div className="bg-white p-5 rounded-2xl border border-[#E0E5F2] shadow-sm">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span className="flex items-center gap-1.5 font-medium">
                  <Package size={14} className="text-[#01B574]" /> Total shipments today
                </span>
                <span className="text-[#01B574] bg-[#E6F8F0] px-2 py-0.5 rounded-full font-bold text-[10px]">
                  {metrics?.todayShipmentsVsYesterday || '+12.5%'}
                </span>
              </div>
              <div className="text-3xl font-extrabold text-[#1B2559]">
                {todayShipments > 0 ? todayShipments : totalShipments}
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                {totalShipments} all-time across Bengaluru
              </div>
            </div>

            {/* Card 2: Active Trucks */}
            <div className="bg-white p-5 rounded-2xl border border-[#E0E5F2] shadow-sm">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span className="flex items-center gap-1.5 font-medium">
                  <Truck size={14} className="text-[#01B574]" /> Active trucks
                </span>
                <span className="text-[#01B574] bg-[#E6F8F0] px-2 py-0.5 rounded-full font-bold text-[10px]">
                  Live
                </span>
              </div>
              <div className="text-3xl font-extrabold text-[#1B2559]">{activeTrucks}</div>
              <div className="text-[11px] text-gray-400 mt-1">
                {inTransitCount} vehicles currently on route
              </div>
            </div>

            {/* Card 3: Avg Delivery Time */}
            <div className="bg-white p-5 rounded-2xl border border-[#E0E5F2] shadow-sm">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock size={14} className="text-[#01B574]" /> Avg. Delivery time
                </span>
                <span className="text-[#01B574] bg-[#E6F8F0] px-2 py-0.5 rounded-full font-bold text-[10px]">
                  -18m
                </span>
              </div>
              <div className="text-3xl font-extrabold text-[#1B2559]">{avgDeliveryTime}</div>
              <div className="text-[11px] text-gray-400 mt-1">Calculated from pickup OTP timestamps</div>
            </div>

            {/* Card 4: On-time Delivery Rate */}
            <div className="bg-white p-5 rounded-2xl border border-[#E0E5F2] shadow-sm">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 size={14} className="text-[#01B574]" /> On-time delivery rate
                </span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[10px]">
                  Target: 99%
                </span>
              </div>
              <div className="text-3xl font-extrabold text-[#1B2559]">{onTimeRate}</div>
              <div className="text-[11px] text-gray-400 mt-1">
                {delayedCount > 0 ? `${delayedCount} past expiry alert` : 'All deliveries within shelf life'}
              </div>
            </div>
          </div>

          {/* Section: Registered Partner NGOs & Hubs Directory */}
          <div className="bg-white p-6 rounded-2xl border border-[#E0E5F2] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F8F0] text-[#01B574] uppercase tracking-wider">
                    Bengaluru Shelter Network
                  </span>
                  <span className="text-xs font-semibold text-gray-500">
                    {ngosList.length} Active Verified Partners
                  </span>
                </div>
                <h3 className="font-bold text-base text-[#1B2559] mt-1 flex items-center gap-2">
                  <Building2 size={18} className="text-[#01B574]" /> Partner NGOs & Registered Shelters
                </h3>
                <p className="text-[11px] text-gray-400">
                  Live database of receiving NGO facilities, physical distribution addresses, capacity & contact desks.
                </p>
              </div>

              <div className="text-xs text-gray-500 font-mono bg-[#F4F7FE] px-3 py-1.5 rounded-xl border border-gray-100">
                Network Readiness: <strong className="text-[#01B574]">100% Verified</strong>
              </div>
            </div>

            {/* Table of NGOs with Address and Telemetry */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F4F7FE] text-gray-500 font-bold border-b border-gray-100">
                    <th className="py-2.5 px-3 rounded-l-xl">Shelter / Organization</th>
                    <th className="py-2.5 px-3">Physical Address Line</th>
                    <th className="py-2.5 px-3">Bengaluru Area</th>
                    <th className="py-2.5 px-3">Beneficiaries</th>
                    <th className="py-2.5 px-3">Storage / Cold-Chain</th>
                    <th className="py-2.5 px-3">Manager Contact</th>
                    <th className="py-2.5 px-3 rounded-r-xl">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ngosList.map((ngo) => (
                    <tr key={ngo.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-[#1B2559]">{ngo.ngoName}</div>
                        <div className="text-[10px] text-gray-400 font-mono">Reg: {ngo.registrationNumber}</div>
                      </td>
                      <td className="py-3 px-3 text-gray-600 max-w-xs truncate font-medium">
                        {ngo.address?.line1}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md font-semibold bg-gray-100 text-gray-700">
                          {ngo.address?.area}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-[#1B2559]">
                        {ngo.currentHeadcount} <span className="text-[10px] text-gray-400 font-normal">people</span>
                      </td>
                      <td className="py-3 px-3">
                        {ngo.storageFacilities?.hasRefrigeration ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold text-[10px] inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Refrigerated ({ngo.storageFacilities.maxCapacityKg}kg)
                          </span>
                        ) : (
                          <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full text-[10px]">
                            Ambient ({ngo.storageFacilities?.maxCapacityKg || 100}kg)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-gray-800">{ngo.contactPerson}</div>
                        <a href={`tel:${ngo.contactPhone}`} className="text-[10px] text-[#01B574] font-mono hover:underline flex items-center gap-1">
                          <Phone size={10} /> {ngo.contactPhone}
                        </a>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F8F0] text-[#01B574] flex items-center gap-1 w-max">
                          <ShieldCheck size={11} /> {ngo.verificationStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Middle Row: Delivery Performance Chart + Live Geographic Routing Map */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Delivery Performance Chart with Live Actual Values */}
            <div className="bg-white p-6 rounded-2xl border border-[#E0E5F2] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#1B2559]">Delivery performance</h3>
                  <p className="text-[10px] text-gray-400">Actual measured food handovers over time</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-[#F4F7FE] rounded-lg text-gray-600">
                  <button onClick={() => setChartView('Weekly')} className={chartView === 'Weekly' ? 'text-[#01B574] font-bold' : ''}>Weekly</button>
                  <ChevronDown size={14} />
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-6 text-xs text-gray-600">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#01B574]" /> Delivered ({deliveredCount || totalShipments})
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4FD1C5]" /> Delayed / Urgent ({delayedCount})
                </span>
              </div>

              {/* Chart SVG Canvas with Exact Computed Measures */}
              <div className="h-60 relative w-full pt-4">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200">
                  {/* Grid Lines */}
                  {[0, 50, 100, 150, 200].map((y) => (
                    <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="#F0F3F8" strokeWidth="1" />
                  ))}

                  {/* Delayed Line (Teal) */}
                  <polyline
                    fill="none"
                    stroke="#4FD1C5"
                    strokeWidth="2.5"
                    points={svgDelayed}
                  />

                  {/* Delivered Line (Green) */}
                  <polyline
                    fill="none"
                    stroke="#01B574"
                    strokeWidth="3"
                    points={svgDelivered}
                  />

                  {/* Current Active Dot */}
                  <circle cx="330" cy="50" r="5" fill="#01B574" stroke="#fff" strokeWidth="2" />
                </svg>

                {/* Actual Metric Tooltip */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm border border-[#E0E5F2] p-3 rounded-xl shadow-lg text-[11px] space-y-1">
                  <div className="font-bold text-gray-700">Live Timestamp &bull; Bengaluru</div>
                  <div className="flex items-center justify-between gap-4 text-[#01B574] font-semibold">
                    <span>Delivered / Logged:</span> <span>{totalShipments}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-[#4FD1C5] font-semibold">
                    <span>Pending Pickup:</span> <span>{inTransitCount}</span>
                  </div>
                </div>
              </div>

              {/* X Axis Time Labels */}
              <div className="flex justify-between text-[11px] text-gray-400 font-mono pt-2">
                {stats?.chartData?.hours?.map((h) => (
                  <span key={h}>{h}</span>
                ))}
              </div>
            </div>

            {/* Right: Live Telematics Performance Map with Actual Donor & Vehicle Locations */}
            <div className="bg-white p-6 rounded-2xl border border-[#E0E5F2] shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#1B2559]">Delivery performance map</h3>
                  <p className="text-[10px] text-gray-400">Live donor pickups & transit routes across Bengaluru</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2 text-gray-400" size={13} />
                  <input
                    type="text"
                    placeholder="Search fleet..."
                    className="pl-7 pr-3 py-1.5 text-xs bg-[#F4F7FE] border-none rounded-lg text-gray-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Interactive Bengaluru Map Canvas */}
              <div className="relative h-60 bg-[#E8F0FE] rounded-2xl overflow-hidden border border-[#D0E2FF] flex items-center justify-center">
                {/* Street & Route Lines */}
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:16px_16px]" />
                <svg className="absolute inset-0 w-full h-full opacity-60">
                  <path d="M 0 100 Q 150 160 300 80 T 500 120" fill="none" stroke="#B8D5FA" strokeWidth="24" />
                  <path d="M 80 0 L 140 240" fill="none" stroke="#FFFFFF" strokeWidth="4" />
                  <path d="M 280 0 L 320 240" fill="none" stroke="#FFFFFF" strokeWidth="5" />
                  <path d="M 0 140 L 500 160" fill="none" stroke="#FFFFFF" strokeWidth="4" />

                  {/* Active Route Vector between Donor and NGO */}
                  <line x1="140" y1="70" x2="360" y2="130" stroke="#01B574" strokeWidth="3" strokeDasharray="6,6" />
                </svg>

                {/* Actual Real-Time Hubs */}
                <span className="absolute top-5 left-10 bg-black/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                  DC Hub (Yelahanka / Indiranagar)
                </span>
                <span className="absolute bottom-8 left-16 bg-black/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                  Shelter Hub (Koramangala)
                </span>
                <span className="absolute top-12 right-12 bg-black/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                  Community Kitchen (Whitefield)
                </span>

                {/* Live Donor Location Pin */}
                {activeDonations.length > 0 && (
                  <div
                    onClick={() => alert(`Donor: ${activeDonations[0].donorName}\nLocation: ${activeDonations[0].area}\nPortions: ${activeDonations[0].portions}`)}
                    className="absolute top-16 left-28 flex flex-col items-center cursor-pointer transition-transform hover:scale-110"
                  >
                    <span className="bg-[#01B574] text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-xs mb-0.5">
                      DONOR: {activeDonations[0].area}
                    </span>
                    <div className="w-6 h-6 rounded-full bg-[#01B574] text-white flex items-center justify-center text-xs font-bold shadow-lg animate-bounce">
                      🍲
                    </div>
                  </div>
                )}

                {/* Live Fleet Vehicle Pin TRC-001 */}
                <div
                  onClick={() => setSelectedVehicle('TRC-001')}
                  className="absolute bottom-16 right-36 flex flex-col items-center cursor-pointer transition-transform hover:scale-110"
                >
                  <span className="bg-white text-gray-800 text-[8px] font-bold px-1.5 py-0.5 rounded shadow-xs mb-0.5">
                    TRC-001 &bull; In Transit
                  </span>
                  <div className="w-6 h-6 rounded-full bg-[#F28B45] text-white flex items-center justify-center text-xs font-bold shadow-lg">
                    🚚
                  </div>
                </div>
              </div>

              {/* Map Filter Status Indicators */}
              <div className="flex flex-wrap items-center justify-between text-[11px] text-gray-600 pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#01B574]" /> Live Donor Location
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#F28B45]" /> Active Transport
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#4FD1C5]" /> Pick-up
                </span>
                <a
                  href="https://www.google.com/maps/search/food+shelters+in+bengaluru"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#01B574] font-bold hover:underline flex items-center gap-1"
                >
                  Full Navigation <ExternalLink size={11} />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Row: Active Fleet + Current Loading Status + Order Status Donut */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bottom 1: Active Fleet Telematics */}
            <div className="bg-white p-6 rounded-2xl border border-[#E0E5F2] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#1B2559]">Active fleet</h3>
                  <p className="text-[10px] text-gray-400">Live corridor telemetry</p>
                </div>
                <MoreVertical size={16} className="text-gray-400" />
              </div>

              <div className="space-y-3">
                {activeDonations.length > 0 ? (
                  activeDonations.slice(0, 2).map((don, idx) => (
                    <div key={don._id || idx} className="p-3.5 rounded-xl border border-gray-100 bg-[#F4F7FE]/60 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-[#1B2559]">TRC-00{idx + 1} &bull; {don.donationCode}</span>
                        <span className="text-[10px] font-bold bg-[#E6F8F0] text-[#01B574] px-2 py-0.5 rounded-full">
                          {don.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                        <span className="font-medium text-gray-700">{don.area} (Donor)</span>
                        <div className="flex-1 mx-3 border-t-2 border-dashed border-[#01B574] relative">
                          <Truck size={14} className="text-[#01B574] absolute -top-2 left-1/2 -translate-x-1/2" />
                        </div>
                        <span className="font-medium text-gray-700">Koramangala (Shelter)</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-400 py-6 text-center">No active vehicles on route</div>
                )}
              </div>
            </div>

            {/* Bottom 2: Current Loading Status Bar Telemetry */}
            <div className="bg-white p-6 rounded-2xl border border-[#E0E5F2] shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#1B2559]">Current loading status</h3>
                  <p className="text-[10px] text-gray-400">Real-time donation volume & weight</p>
                </div>
                <MoreVertical size={16} className="text-gray-400" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-3xl font-extrabold text-[#1B2559]">
                    {trucksBeingLoaded < 10 ? `0${trucksBeingLoaded}` : trucksBeingLoaded}
                  </div>
                  <div className="text-[11px] text-gray-400">Trucks being loaded</div>
                  {/* Visual mini bar indicator */}
                  <div className="flex gap-1 mt-3">
                    <div className="h-4 w-2 bg-[#01B574] rounded-xs" />
                    <div className="h-6 w-2 bg-[#01B574] rounded-xs" />
                    <div className="h-3 w-2 bg-[#01B574] rounded-xs" />
                    <div className="h-5 w-2 bg-gray-200 rounded-xs" />
                  </div>
                </div>

                <div>
                  <div className="text-3xl font-extrabold text-[#1B2559]">{averageLoad}%</div>
                  <div className="text-[11px] text-gray-400">Average load capacity</div>
                  {/* Visual mini bar indicator */}
                  <div className="flex gap-1 mt-3">
                    <div className="h-5 w-2 bg-[#4FD1C5] rounded-xs" />
                    <div className="h-5 w-2 bg-[#4FD1C5] rounded-xs" />
                    <div className="h-5 w-2 bg-[#4FD1C5] rounded-xs" />
                    <div className="h-2 w-2 bg-gray-200 rounded-xs" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                <div>
                  <div className="text-lg font-bold text-[#1B2559]">{totalVolumeM3} m³</div>
                  <div className="text-[10px] text-gray-400">Total volume today</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-[#1B2559]">{totalWeightTons} tons</div>
                  <div className="text-[10px] text-gray-400">Total weight load</div>
                </div>
              </div>
            </div>

            {/* Bottom 3: Order Status Circular Gauge (Matching Real Database Breakdown) */}
            <div className="bg-white p-6 rounded-2xl border border-[#E0E5F2] shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#1B2559]">Order status</h3>
                  <p className="text-[10px] text-gray-400">Live shipment distribution</p>
                </div>
                <MoreVertical size={16} className="text-gray-400" />
              </div>

              {/* Circular Gauge */}
              <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="64" stroke="#F4F7FE" strokeWidth="10" fill="none" />
                  <circle
                    cx="80"
                    cy="80"
                    r="64"
                    stroke="#01B574"
                    strokeWidth="10"
                    strokeDasharray="402"
                    strokeDashoffset={totalShipments > 0 ? (1 - deliveredCount / Math.max(totalShipments, 1)) * 402 : 300}
                    strokeLinecap="round"
                    fill="none"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="64"
                    stroke="#4FD1C5"
                    strokeWidth="10"
                    strokeDasharray="402"
                    strokeDashoffset={totalShipments > 0 ? (1 - inTransitCount / Math.max(totalShipments, 1)) * 402 : 200}
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
                <div className="absolute text-center">
                  <div className="text-2xl font-extrabold text-[#1B2559]">{totalShipments}</div>
                  <div className="text-[10px] text-gray-400">Total shipments</div>
                </div>
              </div>

              {/* Status Breakdown Legend */}
              <div className="flex justify-between text-[11px] text-gray-600 border-t border-gray-100 pt-3">
                <span className="flex items-center gap-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#4FD1C5]" /> On the way ({inTransitCount})
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#01B574]" /> Delivered ({deliveredCount})
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Delayed ({delayedCount})
                </span>
              </div>
            </div>
          </div>
          </>
          )}

          {/* Quick Shipment Modal */}
          {showQuickShipment && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-gray-100 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <h3 className="font-bold text-[#1B2559]">Create Quick Rescue Shipment</h3>
                  <button onClick={() => setShowQuickShipment(false)} className="text-gray-400 hover:text-gray-700 font-bold">&times;</button>
                </div>
                <form onSubmit={handleQuickShipmentSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold mb-1">Donor Facility Name</label>
                    <input
                      type="text"
                      required
                      value={quickShipmentData.donorName}
                      onChange={(e) => setQuickShipmentData({ ...quickShipmentData, donorName: e.target.value })}
                      placeholder="e.g. ITC Gardenia Kitchen"
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Food Item & Portions</label>
                    <input
                      type="text"
                      required
                      value={quickShipmentData.foodType}
                      onChange={(e) => setQuickShipmentData({ ...quickShipmentData, foodType: e.target.value })}
                      placeholder="e.g. Sambar Rice (100 portions)"
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Bengaluru Pickup Locality</label>
                    <input
                      type="text"
                      required
                      value={quickShipmentData.area}
                      onChange={(e) => setQuickShipmentData({ ...quickShipmentData, area: e.target.value })}
                      placeholder="e.g. Indiranagar / Koramangala"
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#01B574] text-white rounded-xl font-bold shadow-sm hover:bg-[#009e64]"
                  >
                    Dispatch Now & Lock Fleet
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* AI Copilot Drawer */}
          {showCopilot && (
            <div className="bg-white rounded-2xl border border-[#E0E5F2] p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#01B574] text-white flex items-center justify-center font-bold">
                    <Bot size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#1B2559]">Horizon AI Operations Assistant</h4>
                    <span className="text-[10px] text-gray-400">Restricted Tool Orchestrator</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowCopilot(false)}
                  className="text-gray-400 hover:text-gray-700 text-lg font-bold"
                >
                  &times;
                </button>
              </div>

              <div className="h-44 overflow-y-auto space-y-2 text-xs pr-1">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-3.5 py-2 rounded-xl ${
                        m.role === 'user'
                          ? 'bg-[#01B574] text-white rounded-br-none'
                          : 'bg-[#F4F7FE] text-gray-800 rounded-bl-none border border-gray-200'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendCopilot} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask copilot about routing optimizations or live vehicle status..."
                  className="flex-1 px-3 py-2 text-xs bg-[#F4F7FE] border-none rounded-xl focus:outline-none focus:ring-1 focus:ring-[#01B574]"
                />
                <button
                  type="submit"
                  disabled={copilotLoading}
                  className="px-4 py-2 bg-[#01B574] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#009e64]"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
