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
  ChevronRight
} from 'lucide-react';

export function AdminPortal() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [activeDonations, setActiveDonations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // AI Copilot state within admin panel
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
      const [statsRes, donRes] = await Promise.all([
        axios.get('/api/v1/admin/stats'),
        axios.get('/api/v1/admin/donations')
      ]);
      setStats(statsRes.data.data);
      setActiveDonations(donRes.data.data.donations || []);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 5000);
    return () => clearInterval(interval);
  }, []);

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

  const totalShipments = stats?.metrics?.totalDonations || 1284;
  const activeTrucks = stats?.metrics?.activeVehicles || 482;
  const totalMeals = stats?.metrics?.totalMealsRescued || 3420;
  const co2Offset = stats?.metrics?.co2OffsetKg || 1539;

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

          {/* Menu Items */}
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3">
                Main Menu
              </span>
              <nav className="mt-2 space-y-1">
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

                <button
                  onClick={() => setActiveMenu('fleet')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                    activeMenu === 'fleet'
                      ? 'bg-[#E6F8F0] text-[#01B574]'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Truck size={16} /> Fleet Management
                  </div>
                  <ChevronDown size={14} />
                </button>

                <div className="pl-8 space-y-1 text-[11px] text-gray-400">
                  <div className="py-1 hover:text-gray-700 cursor-pointer">All Vehicles</div>
                  <div className="py-1 text-[#01B574] font-medium cursor-pointer">Active Trucks</div>
                  <div className="py-1 hover:text-gray-700 cursor-pointer flex items-center justify-between pr-2">
                    Maintenance <span className="w-4 h-4 rounded-full bg-gray-100 text-gray-600 text-[9px] flex items-center justify-center font-bold">2</span>
                  </div>
                  <div className="py-1 hover:text-gray-700 cursor-pointer">Fuel & Telematics</div>
                  <div className="py-1 hover:text-gray-700 cursor-pointer">Drivers Directory</div>
                </div>

                <button
                  onClick={() => setActiveMenu('shipments')}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Package size={16} /> Shipments & Deliveries
                  </div>
                  <ChevronDown size={14} />
                </button>

                <button
                  onClick={() => setActiveMenu('warehouses')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
                >
                  <Warehouse size={16} /> Warehouse & Shelters
                </button>

                <button
                  onClick={() => setActiveMenu('routing')}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Route size={16} /> Route Planning
                  </div>
                  <span className="w-4 h-4 rounded-full bg-[#E6F8F0] text-[#01B574] text-[10px] font-bold flex items-center justify-center">
                    3
                  </span>
                </button>

                <button
                  onClick={() => setActiveMenu('analytics')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
                >
                  <BarChart3 size={16} /> Analytics & Reports
                </button>
              </nav>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3">
                Support & System
              </span>
              <nav className="mt-2 space-y-1">
                <div className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-900 cursor-pointer">
                  <Users size={16} /> Donors Directory
                </div>
                <div className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-900 cursor-pointer">
                  <UserCheck size={16} /> NGO Team & Roles
                </div>
                <div className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-900 cursor-pointer">
                  <LifeBuoy size={16} /> Help & Support
                </div>
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
            <span className="flex items-center gap-2">
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
        <header className="h-18 bg-white border-b border-[#E0E5F2] px-8 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold text-[#1B2559]">Operations Dashboard</h1>
            <p className="text-xs text-gray-400">Bengaluru Urban Food Rescue Logistics Overview</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Date Range Selector */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F4F7FE] rounded-xl text-xs font-semibold text-gray-700">
              <span>Nov 2026 - Live</span>
              <ChevronDown size={14} />
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
              onClick={() => alert('Quick Rescue Dispatch dialog')}
              className="px-4 py-2 bg-[#01B574] hover:bg-[#009e64] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus size={15} /> Quick Shipment
            </button>
          </div>
        </header>

        {/* Dashboard Grid Content */}
        <div className="p-8 space-y-6">
          {/* Operations Overview Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1B2559] uppercase tracking-wider">
              Operations Overview
            </h2>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>Last updated: Live Feed</span>
              <MoreVertical size={14} />
            </div>
          </div>

          {/* 4 Primary Top KPI Cards (Identical to reference mockup) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1 */}
            <div className="bg-white p-5 rounded-2xl border border-[#E0E5F2] shadow-sm">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span className="flex items-center gap-1.5 font-medium">
                  <Package size={14} className="text-[#01B574]" /> Total shipments today
                </span>
                <span className="text-[#01B574] bg-[#E6F8F0] px-2 py-0.5 rounded-full font-bold text-[10px]">
                  +12.5%
                </span>
              </div>
              <div className="text-3xl font-extrabold text-[#1B2559]">{totalShipments}</div>
              <div className="text-[11px] text-gray-400 mt-1">From all Bengaluru kitchens</div>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-5 rounded-2xl border border-[#E0E5F2] shadow-sm">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span className="flex items-center gap-1.5 font-medium">
                  <Truck size={14} className="text-[#01B574]" /> Active trucks
                </span>
                <span className="text-[#01B574] bg-[#E6F8F0] px-2 py-0.5 rounded-full font-bold text-[10px]">
                  +12.5%
                </span>
              </div>
              <div className="text-3xl font-extrabold text-[#1B2559]">{activeTrucks}</div>
              <div className="text-[11px] text-gray-400 mt-1">Currently on route</div>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-5 rounded-2xl border border-[#E0E5F2] shadow-sm">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock size={14} className="text-[#01B574]" /> Avg. Delivery time
                </span>
                <span className="text-[#01B574] bg-[#E6F8F0] px-2 py-0.5 rounded-full font-bold text-[10px]">
                  -18m
                </span>
              </div>
              <div className="text-3xl font-extrabold text-[#1B2559]">4h 12m</div>
              <div className="text-[11px] text-gray-400 mt-1">Faster than Bengaluru avg</div>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-5 rounded-2xl border border-[#E0E5F2] shadow-sm">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 size={14} className="text-[#01B574]" /> On-time delivery rate
                </span>
                <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded-full font-bold text-[10px]">
                  -0.4%
                </span>
              </div>
              <div className="text-3xl font-extrabold text-[#1B2559]">98.2%</div>
              <div className="text-[11px] text-gray-400 mt-1">Target: 99.0%</div>
            </div>
          </div>

          {/* Middle Row: Left Delivery Performance Chart + Right Geographic Map */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Delivery Performance Chart */}
            <div className="bg-white p-6 rounded-2xl border border-[#E0E5F2] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#1B2559]">Delivery performance</h3>
                <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-[#F4F7FE] rounded-lg text-gray-600">
                  Weekly <ChevronDown size={14} />
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-6 text-xs text-gray-600">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#01B574]" /> Delivered
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4FD1C5]" /> Delayed
                </span>
              </div>

              {/* Chart SVG Canvas (Matching Horizon UI style) */}
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
                    points="0,180 80,175 160,165 240,150 320,135 400,120 500,115"
                  />

                  {/* Delivered Line (Green) */}
                  <polyline
                    fill="none"
                    stroke="#01B574"
                    strokeWidth="3"
                    points="0,170 80,155 160,110 240,70 320,35 400,15 500,5"
                  />

                  {/* Data Points on Delivered Line */}
                  <circle cx="240" cy="70" r="4" fill="#01B574" />
                  <circle cx="320" cy="35" r="5" fill="#01B574" stroke="#fff" strokeWidth="2" />
                </svg>

                {/* Simulated Tooltip */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm border border-[#E0E5F2] p-3 rounded-xl shadow-lg text-[11px] space-y-1">
                  <div className="font-bold text-gray-700">Today &bull; 14:00 PM</div>
                  <div className="flex items-center justify-between gap-4 text-[#01B574] font-semibold">
                    <span>Delivered:</span> <span>340</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-[#4FD1C5] font-semibold">
                    <span>Delayed:</span> <span>55</span>
                  </div>
                </div>
              </div>

              {/* X Axis Time Labels */}
              <div className="flex justify-between text-[11px] text-gray-400 font-mono pt-2">
                <span>06:00</span>
                <span>08:00</span>
                <span>10:00</span>
                <span>12:00</span>
                <span>14:00</span>
                <span>16:00</span>
                <span>18:00</span>
              </div>
            </div>

            {/* Right: Live Transit Geographic Map (Matching Horizon UI style) */}
            <div className="bg-white p-6 rounded-2xl border border-[#E0E5F2] shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#1B2559]">Delivery performance map</h3>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2 text-gray-400" size={13} />
                  <input
                    type="text"
                    placeholder="Search fleet..."
                    className="pl-7 pr-3 py-1.5 text-xs bg-[#F4F7FE] border-none rounded-lg text-gray-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Simulated Map Container with Pins */}
              <div className="relative h-60 bg-[#E8F0FE] rounded-2xl overflow-hidden border border-[#D0E2FF] flex items-center justify-center">
                {/* Simulated River & Street Geometries */}
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:16px_16px]" />
                <svg className="absolute inset-0 w-full h-full opacity-60">
                  <path d="M 0 100 Q 150 160 300 80 T 500 120" fill="none" stroke="#B8D5FA" strokeWidth="24" />
                  <path d="M 80 0 L 140 240" fill="none" stroke="#FFFFFF" strokeWidth="4" />
                  <path d="M 280 0 L 320 240" fill="none" stroke="#FFFFFF" strokeWidth="5" />
                  <path d="M 0 140 L 500 160" fill="none" stroke="#FFFFFF" strokeWidth="4" />
                </svg>

                {/* Hub Badges */}
                <span className="absolute top-6 left-12 bg-black/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                  DC Hub (Indiranagar)
                </span>
                <span className="absolute bottom-10 left-24 bg-black/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                  NY Hub (Whitefield)
                </span>
                <span className="absolute top-16 right-16 bg-black/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                  MIA Hub (Koramangala)
                </span>

                {/* Vehicle Pins (TRC-042 style from image) */}
                <div className="absolute top-12 left-28 flex flex-col items-center">
                  <span className="bg-white text-gray-800 text-[8px] font-bold px-1.5 py-0.5 rounded shadow-xs mb-0.5">TRC-042</span>
                  <div className="w-5 h-5 rounded-full bg-[#01B574] text-white flex items-center justify-center text-[10px] font-bold shadow-md">✓</div>
                </div>

                <div className="absolute top-20 left-48 flex flex-col items-center">
                  <span className="bg-white text-gray-800 text-[8px] font-bold px-1.5 py-0.5 rounded shadow-xs mb-0.5">TRC-018</span>
                  <div className="w-5 h-5 rounded-full bg-[#F28B45] text-white flex items-center justify-center text-[10px] font-bold shadow-md">▲</div>
                </div>

                <div className="absolute top-8 right-28 flex flex-col items-center">
                  <span className="bg-white text-gray-800 text-[8px] font-bold px-1.5 py-0.5 rounded shadow-xs mb-0.5">TRC-091</span>
                  <div className="w-5 h-5 rounded-full bg-[#01B574] text-white flex items-center justify-center text-[10px] font-bold shadow-md">✓</div>
                </div>

                <div className="absolute bottom-8 right-16 flex flex-col items-center">
                  <span className="bg-white text-gray-800 text-[8px] font-bold px-1.5 py-0.5 rounded shadow-xs mb-0.5">TRC-005</span>
                  <div className="w-5 h-5 rounded-full bg-[#01B574] text-white flex items-center justify-center text-[10px] font-bold shadow-md">▼</div>
                </div>
              </div>

              {/* Map Filter Status Indicators */}
              <div className="flex flex-wrap items-center justify-between text-[11px] text-gray-600 pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#01B574]" /> In transit
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#4FD1C5]" /> Pick-up
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#F28B45]" /> Stationary
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Delayed
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Row: Active Fleet + Current Loading Status + Order Status Donut */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bottom 1: Active Fleet Telematics */}
            <div className="bg-white p-6 rounded-2xl border border-[#E0E5F2] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#1B2559]">Active fleet</h3>
                <MoreVertical size={16} className="text-gray-400" />
              </div>

              <div className="space-y-4">
                {/* Truck 1 */}
                <div className="p-3.5 rounded-xl border border-gray-100 bg-[#F4F7FE]/60 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#1B2559]">TRC-001 &bull; ETA 14:30</span>
                    <span className="text-[10px] font-bold bg-[#E6F8F0] text-[#01B574] px-2 py-0.5 rounded-full">
                      In transit
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                    <span>Indiranagar Kitchen</span>
                    <div className="flex-1 mx-3 border-t-2 border-dashed border-[#01B574] relative">
                      <Truck size={14} className="text-[#01B574] absolute -top-2 left-1/2 -translate-x-1/2" />
                    </div>
                    <span>Whitefield Shelter</span>
                  </div>
                </div>

                {/* Truck 2 */}
                <div className="p-3.5 rounded-xl border border-gray-100 bg-[#F4F7FE]/60 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#1B2559]">TRC-042 &bull; ETA 18:15</span>
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                      Delayed
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                    <span>Koramangala</span>
                    <div className="flex-1 mx-3 border-t-2 border-dashed border-amber-400 relative">
                      <Truck size={14} className="text-amber-500 absolute -top-2 left-1/2 -translate-x-1/2" />
                    </div>
                    <span>Rajajinagar</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom 2: Current Loading Status Bar Telemetry */}
            <div className="bg-white p-6 rounded-2xl border border-[#E0E5F2] shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#1B2559]">Current loading status</h3>
                <MoreVertical size={16} className="text-gray-400" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-3xl font-extrabold text-[#1B2559]">08</div>
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
                  <div className="text-3xl font-extrabold text-[#1B2559]">72%</div>
                  <div className="text-[11px] text-gray-400">Average cargo load</div>
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
                  <div className="text-lg font-bold text-[#1B2559]">18.2 m³</div>
                  <div className="text-[10px] text-gray-400">Total volume today</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-[#1B2559]">4.1 tons</div>
                  <div className="text-[10px] text-gray-400">Total weight load</div>
                </div>
              </div>
            </div>

            {/* Bottom 3: Order Status Circular Gauge */}
            <div className="bg-white p-6 rounded-2xl border border-[#E0E5F2] shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#1B2559]">Order status</h3>
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
                    strokeDashoffset="100"
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
                    strokeDashoffset="310"
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
                  <span className="w-2 h-2 rounded-full bg-gray-800" /> On the way (50%)
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#01B574]" /> Delivered (35%)
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Delayed (15%)
                </span>
              </div>
            </div>
          </div>

          {/* AI Copilot Drawer (Toggleable from bottom left) */}
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
