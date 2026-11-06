import React, { useState, useEffect } from 'react';
import { HeroAnimatedShowcase } from './HeroAnimatedShowcase';
import {
  Utensils,
  Building2,
  Users,
  Sparkles,
  ArrowRight,
  TrendingDown,
  AlertCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  HeartHandshake,
  MapPin,
  Truck,
  Leaf,
  BarChart3,
  Quote,
  Calculator,
  ChevronRight,
  Send,
  HelpCircle,
  Award,
  Globe2,
  Smile,
  QrCode,
  Zap,
  Phone,
  Flame,
  BadgeCheck,
  Radio,
  Share2
} from 'lucide-react';

export function HomePage({ onOpenAuth }) {
  // Interactive Impact Calculator state
  const [donorType, setDonorType] = useState('restaurant'); // restaurant, hotel, event, household
  const [frequency, setFrequency] = useState('weekly'); // daily, weekly, monthly
  const [portions, setPortions] = useState(65);

  // Dynamic Impact Math
  const multiplier = frequency === 'daily' ? 30 : frequency === 'weekly' ? 4 : 1;
  const monthlyPortions = portions * multiplier;
  const mealsFed = monthlyPortions;
  const co2SavedKg = Math.round(monthlyPortions * 1.85); // ~1.85kg CO2e per rescued meal
  const waterSavedLiters = Math.round(monthlyPortions * 320); // ~320 liters virtual water saved per meal
  const familiesSupported = Math.max(1, Math.round(monthlyPortions / 15));

  // Interactive Live Rescue Ticker simulation
  const [liveDonations, setLiveDonations] = useState([
    {
      id: 1,
      donor: 'The Oberoi Banquet',
      location: 'MG Road',
      portions: 120,
      type: 'North Indian Feast (Veg)',
      time: 'Just now',
      status: 'Driver Dispatched',
      ngo: 'Karunashraya Shelter'
    },
    {
      id: 2,
      donor: 'Spice Terrace Bistro',
      location: 'Indiranagar',
      portions: 45,
      type: 'Rice, Dal & Breads',
      time: '8 mins ago',
      status: 'Verified Delivered',
      ngo: 'Asha Kiran Trust'
    },
    {
      id: 3,
      donor: 'ITC Gardenia Caterers',
      location: 'Residency Road',
      portions: 210,
      type: 'Mixed Continental Meals',
      time: '19 mins ago',
      status: 'Verified Delivered',
      ngo: 'Sneha Care Home'
    }
  ]);

  // Live Counter ticker
  const [tickerPortions, setTickerPortions] = useState(128450);
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerPortions(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Quick Donation Pledge form state
  const [pledgeForm, setPledgeForm] = useState({
    name: '',
    donorType: 'Restaurant / Cafe',
    location: 'Indiranagar, Bengaluru',
    approxPortions: '25-50 meals',
    contact: ''
  });
  const [pledgeSubmitted, setPledgeSubmitted] = useState(false);

  // Active Story Tab State
  const [activeStoryCategory, setActiveStoryCategory] = useState('all');

  const handlePledgeSubmit = (e) => {
    e.preventDefault();
    setPledgeSubmitted(true);
    setTimeout(() => {
      onOpenAuth('DONOR');
    }, 1200);
  };

  const stories = [
    {
      category: 'donor',
      title: 'Rescuing 400 Grand Banquet Portions at Midnight',
      author: 'Rajesh Kulkarni',
      role: 'Executive Banquet Manager, Palace Grounds Bangalore',
      quote:
        'Throwing away pristine wedding biryani and paneer gravies used to make our chefs sick to their stomachs. With FoodBridge, a vehicle with an insulated crate arrives in 22 minutes. By 1:30 AM, 350+ night-shift sanitation workers and children have warm, nutritious food.',
      badge: 'Hospitality Partner'
    },
    {
      category: 'ngo',
      title: 'Guaranteed Warm Meals with Verified Quality for 85 Girls',
      author: "Sister Mary D'Souza",
      role: "Director, Asha Kiran Children's Home, Koramangala",
      quote:
        'Our monthly food budget has been relieved by 40%, but the greatest blessing is the dignity and reliability. We receive clean, high-grade food verified by temperature checks and OTPs. We never worry about feeding our children.',
      badge: 'Verified Shelter'
    },
    {
      category: 'donor',
      title: 'Zero Friction for a Busy Artisan Bakery',
      author: 'Ananya Nayak',
      role: 'Founder, Bloom Artisan Bistro, Indiranagar',
      quote:
        'Before FoodBridge, surplus baked goods after 9 PM were impossible to distribute due to logistics. Now, 3 taps on my phone registers 30 boxes of artisan bread and soup. The delivery agent is polite, professional, and shares live tracking.',
      badge: 'Cafe Partner'
    }
  ];

  const filteredStories =
    activeStoryCategory === 'all'
      ? stories
      : stories.filter((s) => s.category === activeStoryCategory);

  return (
    <div className="w-full space-y-0 text-[#1C241E]">
      {/* 1. HERO SECTION WITH VISUAL STORYTELLING */}
      <section className="relative px-6 pt-10 pb-20 lg:pt-16 lg:pb-28 max-w-7xl mx-auto overflow-hidden">
        {/* Ambient background glow orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#164B38]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-[#F28B45]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="flex-1 space-y-6 text-center lg:text-left z-10">
            {/* Pill Header */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#DCE8DB] text-[#164B38] text-xs font-bold tracking-wide uppercase shadow-xs">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F28B45] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F28B45]"></span>
              </span>
              FoodBridge • AI-Powered Urban Food Rescue
            </div>

            <h1 className="font-serif-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.12] text-[#0D2D22]">
              Turn Everyday Surplus Into <br />
              <span className="text-[#F28B45] underline decoration-[#F28B45]/30 decoration-wavy underline-offset-8">
                Nourishment for All.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-700 leading-relaxed max-w-xl mx-auto lg:mx-0">
              In Bengaluru alone, thousands of banquet meals, restaurant delights, and catering surpluses go to waste every evening. FoodBridge bridges this divide in real-time, connecting verified food donors with shelters and community kitchens within <strong>45 minutes</strong>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2 justify-center lg:justify-start">
              <button
                onClick={() => onOpenAuth('DONOR')}
                className="px-8 py-4 bg-[#164B38] hover:bg-[#0D2D22] text-white rounded-full font-semibold shadow-xl glow-forest hover:scale-[1.02] transition-all flex items-center justify-center gap-2.5 group cursor-pointer"
              >
                <Utensils size={18} className="text-[#F28B45]" />
                <span>Donate Surplus Food</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => onOpenAuth('NGO_MANAGER')}
                className="px-8 py-4 bg-white/90 border border-[#DCE8DB] text-[#164B38] hover:border-[#164B38] hover:bg-white rounded-full font-semibold shadow-xs hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Building2 size={18} />
                <span>Enroll Verified NGO</span>
              </button>
            </div>

            {/* Quick Proof Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#DCE8DB] max-w-lg mx-auto lg:mx-0">
              <div className="space-y-1">
                <div className="text-2xl lg:text-3xl font-bold text-[#164B38] font-serif-heading">&lt; 20 Mins</div>
                <div className="text-xs text-gray-600 font-medium">Urban Dispatch Lock</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl lg:text-3xl font-bold text-[#164B38] font-serif-heading">Dual OTP</div>
                <div className="text-xs text-gray-600 font-medium">Tamper-Proof Handover</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl lg:text-3xl font-bold text-[#F28B45] font-serif-heading">100% Free</div>
                <div className="text-xs text-gray-600 font-medium">Social-Impact Platform</div>
              </div>
            </div>
          </div>

          {/* Animated Real-Life Showcase & Floating Live Interaction Card */}
          <div className="flex-1 w-full max-w-lg lg:max-w-none flex flex-col items-center justify-center relative">
            <HeroAnimatedShowcase />

            {/* Floating Live Dispatch Card overlay */}
            <div className="w-full max-w-md -mt-4 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-[#DCE8DB] shadow-xl space-y-3 z-20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#164B38] uppercase tracking-wider">
                  <Radio size={14} className="text-red-500 animate-pulse" /> Live Bengaluru Food Bridge
                </div>
                <span className="text-[11px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                  Active Dispatch
                </span>
              </div>
              <div className="flex items-start gap-3 bg-[#FAF8F2] p-3 rounded-2xl border border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-[#164B38] text-white flex items-center justify-center shrink-0">
                  <Truck size={18} />
                </div>
                <div className="text-xs space-y-1 flex-1">
                  <div className="font-bold text-gray-900 flex justify-between">
                    <span>120 Portions En Route</span>
                    <span className="text-[#F28B45] font-semibold">OTP: #4928</span>
                  </div>
                  <div className="text-gray-600">
                    From <strong>The Oberoi (MG Road)</strong> to <strong>Karunashraya Care</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE DISPATCH TICKER BANNER */}
      <div className="bg-[#164B38] text-white py-3 px-6 overflow-hidden border-y border-[#0D2D22]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold tracking-wide">
            <Sparkles size={16} className="text-[#F28B45]" />
            <span>REAL-TIME PLATFORM IMPACT:</span>
            <span className="font-mono text-sm text-[#F28B45] bg-black/20 px-2 py-0.5 rounded-md">
              {tickerPortions.toLocaleString()} Meals Rescued to Date
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-gray-300">
            <span>• Average transit time: <strong>32 minutes</strong></span>
            <span>• Verified Shelters: <strong>85 Active</strong></span>
            <span>• Landfill Methane Cut: <strong>237 Tonnes</strong></span>
          </div>
        </div>
      </div>

      {/* 2. THE PROBLEM SECTION: VISUAL STORYTELLING */}
      <section id="problem" className="py-24 bg-white border-b border-[#DCE8DB] px-6">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs uppercase tracking-widest text-[#F28B45] font-bold inline-flex items-center gap-1.5 bg-[#FAF8F2] px-3.5 py-1 rounded-full border border-[#DCE8DB]">
              <AlertCircle size={14} className="text-[#F28B45]" /> The Urban Paradox
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-heading font-bold text-[#0D2D22]">
              Why Does Edible Food End Up in Landfills While People Go Hungry?
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              In vibrant urban centers like Bengaluru, tonnes of delicious, high-quality, hot-cooked food from grand weddings, luxury hotels, and corporate campuses are thrown away daily. Not because people don't care, but because the logistics gap was broken.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Paradox Card 1 */}
            <div className="p-8 rounded-3xl bg-[#FAF8F2] border border-[#DCE8DB] space-y-4 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingDown size={28} />
              </div>
              <div className="text-4xl font-bold text-[#0D2D22] font-serif-heading">68+ Million</div>
              <div className="text-xs uppercase tracking-wider text-red-600 font-bold">Tonnes Wasted in India</div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Enough food to nourish millions of vulnerable citizens is lost every single year in India due to broken distribution pathways and lack of immediate coordination.
              </p>
            </div>

            {/* Paradox Card 2 */}
            <div className="p-8 rounded-3xl bg-[#FAF8F2] border border-[#DCE8DB] space-y-4 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock size={28} />
              </div>
              <div className="text-4xl font-bold text-[#0D2D22] font-serif-heading">4 - 6 Hours</div>
              <div className="text-xs uppercase tracking-wider text-amber-700 font-bold">Perishability Ticking Clock</div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Prepared hot meals cannot wait until tomorrow morning. Without automated geographic matching and rapid dispatch, surplus meals spoil before shelters can arrange pickup.
              </p>
            </div>

            {/* Paradox Card 3 */}
            <div className="p-8 rounded-3xl bg-[#FAF8F2] border border-[#DCE8DB] space-y-4 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-[#164B38] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Leaf size={28} />
              </div>
              <div className="text-4xl font-bold text-[#0D2D22] font-serif-heading">10% of GHGs</div>
              <div className="text-xs uppercase tracking-wider text-[#164B38] font-bold">Landfill Climate Impact</div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Rotting food in open dump sites generates toxic methane, heating the planet at 25 times the rate of carbon dioxide. Rescuing food is direct climate action.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. OUR SOLUTION: THE INTELLIGENT BRIDGE */}
      <section id="solution" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-14">
          <div className="flex-1 space-y-6">
            <span className="text-xs uppercase tracking-widest text-[#F28B45] font-bold inline-flex items-center gap-1.5 bg-[#DCE8DB] px-3.5 py-1 rounded-full text-[#164B38]">
              <Sparkles size={14} /> The FoodBridge Ecosystem
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-heading font-bold text-[#0D2D22] leading-tight">
              An Algorithmic Bridge That Closes the Gap in Minutes
            </h2>
            <p className="text-gray-700 text-base leading-relaxed">
              FoodBridge completely removes phone calls, guessing games, and food safety uncertainties. Using automated dispatch algorithms, proximity matching, and dual cryptographic verification, we connect surplus meal batches with verified shelters in under 45 minutes.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5 bg-white p-4 rounded-2xl border border-[#DCE8DB] shadow-xs">
                <div className="p-2.5 rounded-xl bg-[#DCE8DB] text-[#164B38] mt-0.5">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm sm:text-base">Shelf-Life vs. Transit Optimization</h4>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                    Our routing engine matches food based on cooked timestamps and live traffic, ensuring meals are served fresh and piping hot.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 bg-white p-4 rounded-2xl border border-[#DCE8DB] shadow-xs">
                <div className="p-2.5 rounded-xl bg-[#DCE8DB] text-[#164B38] mt-0.5">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm sm:text-base">Dual OTP Handover Protocol</h4>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                    Pickup OTP verified at the kitchen by driver; Delivery OTP confirmed by the NGO shelter upon recipient inspection.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 bg-white p-4 rounded-2xl border border-[#DCE8DB] shadow-xs">
                <div className="p-2.5 rounded-xl bg-[#DCE8DB] text-[#164B38] mt-0.5">
                  <BadgeCheck size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm sm:text-base">Verifiable CSR & ESG Impact Ledger</h4>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                    Every donation logs kilograms diverted, meals distributed, and carbon offsets for corporate audits and ESG reporting.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Role Selector Cards */}
          <div className="flex-1 w-full bg-gradient-to-br from-[#164B38] to-[#0D2D22] text-white p-8 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-xs uppercase tracking-widest text-[#F28B45] font-bold">
                Three Pillars of Change
              </span>
              <HeartHandshake className="text-[#F28B45]" size={24} />
            </div>

            <div className="space-y-5">
              <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/10 hover:bg-white/15 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-[#F28B45] text-white">
                    <Utensils size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-base">For Food Donors</h4>
                    <span className="text-[11px] text-[#F28B45]">Restaurants • Banquets • Caterers • Households</span>
                  </div>
                </div>
                <p className="text-xs text-gray-200 leading-relaxed">
                  Log surplus food in 60 seconds. Set vegetarian/halal flags, portion count, and packaged time. We handle the pickup and guarantee ethical delivery.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/10 hover:bg-white/15 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-white text-[#164B38]">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-base">For Beneficiary Shelters</h4>
                    <span className="text-[11px] text-[#DCE8DB]">Care Homes • Orphanages • Community Kitchens</span>
                  </div>
                </div>
                <p className="text-xs text-gray-200 leading-relaxed">
                  Receive pre-screened fresh food matched accurately to your headcounts and dietary restrictions, completely free of charge.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/10 hover:bg-white/15 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-emerald-400 text-[#0D2D22]">
                    <Truck size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-base">For Logistics & Volunteers</h4>
                    <span className="text-[11px] text-emerald-300">Clean Fleets • Electric Three-Wheelers • Volunteers</span>
                  </div>
                </div>
                <p className="text-xs text-gray-200 leading-relaxed">
                  Equipped with thermal insulated food carriers, temperature meters, and turn-by-turn routing across Bengaluru corridors.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS: 4-STEP INTUITIVE WORKFLOW */}
      <section id="how-it-works" className="py-24 bg-[#DCE8DB]/40 border-y border-[#DCE8DB] px-6">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="text-xs uppercase tracking-widest text-[#F28B45] font-bold">
              Simple • Fast • Dignified
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif-heading font-bold text-[#0D2D22]">
              How FoodBridge Rescues Every Portion in 4 Steps
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              A transparent, closed-loop workflow engineered for speed and food safety compliance.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="bg-white p-7 rounded-3xl shadow-xs border border-[#DCE8DB] space-y-4 hover:shadow-md transition-all relative flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#164B38] text-white flex items-center justify-center font-bold text-xl shadow-md">
                  1
                </div>
                <h3 className="font-bold text-lg text-[#164B38]">Log Surplus Meal</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Donor enters dietary classification (Veg/Non-Veg), portion count, prepared timestamp, and pickup address in under 60 seconds.
                </p>
              </div>
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[#F28B45]">
                <span>Instant Ingestion</span>
                <ChevronRight size={16} />
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-7 rounded-3xl shadow-xs border border-[#DCE8DB] space-y-4 hover:shadow-md transition-all relative flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F28B45] text-white flex items-center justify-center font-bold text-xl shadow-md">
                  2
                </div>
                <h3 className="font-bold text-lg text-[#164B38]">Smart AI Match</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  The algorithm calculates transit windows against perishability, dietary rules, and NGO headcount requirements to lock the optimal recipient shelter.
                </p>
              </div>
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[#F28B45]">
                <span>Zero Double-Booking</span>
                <ChevronRight size={16} />
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-7 rounded-3xl shadow-xs border border-[#DCE8DB] space-y-4 hover:shadow-md transition-all relative flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#164B38] text-white flex items-center justify-center font-bold text-xl shadow-md">
                  3
                </div>
                <h3 className="font-bold text-lg text-[#164B38]">Pickup OTP Dispatch</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Assigned driver arrives at the kitchen with thermal crates. The donor confirms driver's identity and releases food with a secure 4-digit OTP.
                </p>
              </div>
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[#F28B45]">
                <span>Tamper-Resistant</span>
                <ChevronRight size={16} />
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-7 rounded-3xl shadow-xs border border-[#DCE8DB] space-y-4 hover:shadow-md transition-all relative flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#0D2D22] text-white flex items-center justify-center font-bold text-xl shadow-md">
                  4
                </div>
                <h3 className="font-bold text-lg text-[#164B38]">Delivered & Audited</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  NGO inspects quality, inputs the final Delivery OTP, and serves hot food. The donor instantly gets proof photos and impact badges.
                </p>
              </div>
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[#F28B45]">
                <span>Complete Trust</span>
                <ChevronRight size={16} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. KEY FEATURES GRID */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-widest text-[#F28B45] font-bold">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif-heading font-bold text-[#0D2D22]">
            Engineered for Precision, Safety & Urban Scale
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Every feature is purpose-built to address the physical reality of rapid hot-food transport.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-white border border-[#DCE8DB] hover:border-[#164B38] transition-all space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#DCE8DB] text-[#164B38] flex items-center justify-center">
              <Clock size={22} />
            </div>
            <h3 className="font-bold text-lg text-[#164B38]">Dynamic Perishability Guard</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Considers ambient humidity and cooking temperature so prepared meals are distributed strictly within their prime safe consumption window.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-[#DCE8DB] hover:border-[#164B38] transition-all space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#DCE8DB] text-[#164B38] flex items-center justify-center">
              <MapPin size={22} />
            </div>
            <h3 className="font-bold text-lg text-[#164B38]">Hyper-Local Urban Corridors</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Clustered zone management across Koramangala, Indiranagar, Whitefield, and Electronic City eliminates cross-city transit delays.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-[#DCE8DB] hover:border-[#164B38] transition-all space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#DCE8DB] text-[#164B38] flex items-center justify-center">
              <Building2 size={22} />
            </div>
            <h3 className="font-bold text-lg text-[#164B38]">100% Verified NGO Shelters</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Every beneficiary shelter is audited for NGO Darpan registrations, food handling cleanliness, and facility headcounts.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-[#DCE8DB] hover:border-[#164B38] transition-all space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#DCE8DB] text-[#164B38] flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
            <h3 className="font-bold text-lg text-[#164B38]">OWASP Level Security</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Argon2id password hashing, HttpOnly secure cookies, role-based isolation, and tamper-resistant dispatch audit trails.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-[#DCE8DB] hover:border-[#164B38] transition-all space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#DCE8DB] text-[#164B38] flex items-center justify-center">
              <BarChart3 size={22} />
            </div>
            <h3 className="font-bold text-lg text-[#164B38]">Real-Time Carbon & Waste Analytics</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Live dashboards calculate total kilograms of food conserved and kilograms of CO2 avoided for your organization's sustainability goals.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-[#DCE8DB] hover:border-[#164B38] transition-all space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#DCE8DB] text-[#164B38] flex items-center justify-center">
              <Sparkles size={22} />
            </div>
            <h3 className="font-bold text-lg text-[#164B38]">AI Logistics Co-Pilot</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Integrated with Google Gemini AI to analyze historical dispatch trends, anticipate surplus spikes, and automate reporting.
            </p>
          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE IMPACT CALCULATOR */}
      <section id="impact" className="py-24 bg-[#FAF8F2] border-y border-[#DCE8DB] px-6">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="text-xs uppercase tracking-widest text-[#F28B45] font-bold inline-flex items-center gap-1.5 bg-white px-3.5 py-1 rounded-full border border-[#DCE8DB]">
              <Calculator size={14} /> Interactive Impact Simulator
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif-heading font-bold text-[#0D2D22]">
              See The True Value of Your Food Surplus
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Slide to your estimated surplus and discover how many nutritious meals and carbon savings you create every month.
            </p>
          </div>

          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#DCE8DB] shadow-lg grid lg:grid-cols-2 gap-12 items-center">
            {/* Interactive Inputs */}
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2.5">
                  1. Organization or Donor Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['restaurant', 'hotel', 'event', 'household'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setDonorType(type)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold capitalize border transition-all cursor-pointer ${
                        donorType === type
                          ? 'bg-[#164B38] text-white border-[#164B38] shadow-sm'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2.5">
                  2. Donation Frequency
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['daily', 'weekly', 'monthly'].map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setFrequency(freq)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold capitalize border transition-all cursor-pointer ${
                        frequency === freq
                          ? 'bg-[#F28B45] text-white border-[#F28B45] shadow-sm'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
                  <span>3. Average Servings per donation</span>
                  <span className="text-[#164B38] text-base font-serif-heading font-bold bg-[#DCE8DB] px-3 py-0.5 rounded-lg">
                    {portions} meals
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="5"
                  value={portions}
                  onChange={(e) => setPortions(Number(e.target.value))}
                  className="w-full accent-[#164B38] cursor-pointer h-2 bg-gray-200 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-gray-400 mt-1.5 font-mono">
                  <span>10 meals (Bistro)</span>
                  <span>250 meals (Banquet)</span>
                  <span>500 meals (Conclave)</span>
                </div>
              </div>
            </div>

            {/* Calculated Results Display Card */}
            <div className="bg-gradient-to-br from-[#0D2D22] to-[#164B38] text-white p-8 sm:p-10 rounded-3xl shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-xs uppercase tracking-widest text-[#F28B45] font-bold">
                  Your Monthly Impact Potential
                </span>
                <Sparkles size={18} className="text-[#F28B45]" />
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-sm text-gray-300">Rescued Meals / Month</span>
                  <span className="text-2xl sm:text-3xl font-bold font-serif-heading text-[#F28B45]">
                    {mealsFed.toLocaleString()} meals
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-sm text-gray-300">Landfill CO2 Averted</span>
                  <span className="text-2xl font-bold font-serif-heading text-emerald-400">
                    {co2SavedKg.toLocaleString()} kg CO2e
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-sm text-gray-300">Virtual Water Conserved</span>
                  <span className="text-2xl font-bold font-serif-heading text-blue-300">
                    {waterSavedLiters.toLocaleString()} Liters
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Families Nourished</span>
                  <span className="text-xl font-bold font-serif-heading text-white">
                    ~{familiesSupported.toLocaleString()} families
                  </span>
                </div>
              </div>

              <button
                onClick={() => onOpenAuth('DONOR')}
                className="w-full py-4 bg-[#F28B45] hover:bg-[#D9732F] text-white rounded-2xl font-bold shadow-lg glow-orange transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                Pledge This Impact Today <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. COMMUNITY STORIES & REAL VOICES */}
      <section id="stories" className="py-24 px-6 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-widest text-[#F28B45] font-bold">
            Voices of Bengaluru
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif-heading font-bold text-[#0D2D22]">
            Stories of Dignity, Care and Zero Waste
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Discover how FoodBridge connects everyday kitchen surplus to community dining halls.
          </p>

          {/* Filter Pills */}
          <div className="flex justify-center gap-2 pt-2">
            {[
              { id: 'all', label: 'All Stories' },
              { id: 'donor', label: 'From Donors' },
              { id: 'ngo', label: 'From NGO Shelters' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveStoryCategory(tab.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeStoryCategory === tab.id
                    ? 'bg-[#164B38] text-white shadow-xs'
                    : 'bg-white border border-[#DCE8DB] text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {filteredStories.map((story, idx) => (
            <div
              key={idx}
              className="bg-white p-8 rounded-3xl border border-[#DCE8DB] shadow-xs flex flex-col justify-between space-y-6 hover:shadow-md transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Quote className="text-[#F28B45]" size={32} />
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#FAF8F2] text-[#164B38] border border-[#DCE8DB]">
                    {story.badge}
                  </span>
                </div>
                <h4 className="font-bold text-base text-gray-900">{story.title}</h4>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed italic">
                  "{story.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#164B38] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {story.author[0]}
                </div>
                <div>
                  <div className="font-bold text-sm text-gray-900">{story.author}</div>
                  <div className="text-xs text-gray-500">{story.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. INSTANT DISPATCH ACTION: REPORT SURPLUS TODAY */}
      <section className="py-24 bg-[#DCE8DB]/30 border-y border-[#DCE8DB] px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-[#DCE8DB] shadow-xl space-y-8">
          <div className="text-center space-y-3">
            <span className="text-xs uppercase tracking-widest text-[#F28B45] font-bold">
              Immediate Urban Action
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif-heading font-bold text-[#0D2D22]">
              Have Surplus Food Right Now? Send an Instant Dispatch Ping
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto">
              Fill in your donor details below to notify verified Bangalore NGO shelters immediately.
            </p>
          </div>

          {pledgeSubmitted ? (
            <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
              <CheckCircle2 size={44} className="text-emerald-600 mx-auto animate-bounce" />
              <h3 className="text-lg font-bold text-emerald-900">Surplus Ping Registered! Opening Secure Portal...</h3>
              <p className="text-xs text-emerald-700">Connecting with our automated dispatch network.</p>
            </div>
          ) : (
            <form onSubmit={handlePledgeSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Your Name / Establishment
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Spice Symphony Kitchen"
                    value={pledgeForm.name}
                    onChange={(e) => setPledgeForm({ ...pledgeForm, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#164B38] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Donor Classification
                  </label>
                  <select
                    value={pledgeForm.donorType}
                    onChange={(e) => setPledgeForm({ ...pledgeForm, donorType: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#164B38] text-sm bg-white"
                  >
                    <option>Restaurant / Cafe</option>
                    <option>Hotel & Banquet</option>
                    <option>Corporate Cafeteria</option>
                    <option>Wedding / Event Caterer</option>
                    <option>Individual / Household</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Neighborhood (Bengaluru)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Indiranagar, Koramangala, Whitefield"
                    value={pledgeForm.location}
                    onChange={(e) => setPledgeForm({ ...pledgeForm, location: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#164B38] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Approximate Servings Available
                  </label>
                  <select
                    value={pledgeForm.approxPortions}
                    onChange={(e) => setPledgeForm({ ...pledgeForm, approxPortions: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#164B38] text-sm bg-white"
                  >
                    <option>10 - 25 meals</option>
                    <option>25 - 50 meals</option>
                    <option>50 - 150 meals</option>
                    <option>150+ large event scale</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#164B38] hover:bg-[#0D2D22] text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm cursor-pointer mt-4"
              >
                <Send size={16} /> Proceed to Instant Allocation
              </button>
            </form>
          )}
        </div>
      </section>

      {/* 9. FAQ SECTION */}
      <section id="faq" className="py-24 px-6 max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase tracking-widest text-[#F28B45] font-bold inline-flex items-center gap-1.5">
            <HelpCircle size={14} /> Clear Answers
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif-heading font-bold text-[#0D2D22]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          <div className="p-7 rounded-3xl bg-white border border-[#DCE8DB] space-y-2">
            <h4 className="font-bold text-gray-900 text-base">What kinds of food can be donated?</h4>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              We accept freshly cooked edible meals (rice dishes, curries, chapati, breads, vegetables), bakery goods, packaged food with intact seals, and fresh produce. All hot meals must be prepared within the last 4 hours and packed hygienically.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white border border-[#DCE8DB] space-y-2">
            <h4 className="font-bold text-gray-900 text-base">Is there any fee to donate or receive food?</h4>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Never. FoodBridge is a 100% free social-impact digital platform funded by CSR partnerships and philanthropy. We do not charge donors or beneficiary shelters any platform fees.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white border border-[#DCE8DB] space-y-2">
            <h4 className="font-bold text-gray-900 text-base">How do we guarantee food safety and hygiene?</h4>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Donors confirm food condition and cooking timestamps during submission. Our matching engine prioritizes transit windows under 45 minutes, and receiving NGOs perform a visual and temperature check prior to issuing the final delivery OTP.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white border border-[#DCE8DB] space-y-2">
            <h4 className="font-bold text-gray-900 text-base">How do NGOs qualify to become verified recipients?</h4>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              All recipient NGOs must possess valid NGO Darpan registration or 80G/12A documentation, maintain verifiable residential or day-shelter facilities, and pass our site audit checklist before being unlocked on the dispatch grid.
            </p>
          </div>
        </div>
      </section>

      {/* 10. CALL TO ACTION BANNER */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto bg-gradient-to-r from-[#0D2D22] via-[#164B38] to-[#0D2D22] text-white rounded-3xl p-10 sm:p-16 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-[#F28B45] text-xs font-bold uppercase tracking-wider">
            Join The Movement for Zero Food Waste
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif-heading font-bold max-w-2xl mx-auto leading-tight">
            Ready to Make Sure No Meal Goes to Waste?
          </h2>
          <p className="text-gray-300 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Whether you run a restaurant, represent an NGO shelter, or manage events—together we can feed thousands of people across Bengaluru while protecting our environment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button
              onClick={() => onOpenAuth('DONOR')}
              className="px-8 py-4 bg-[#F28B45] hover:bg-[#D9732F] text-white rounded-full font-bold shadow-lg glow-orange transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <Utensils size={18} /> Start Donating Meals
            </button>
            <button
              onClick={() => onOpenAuth('NGO_MANAGER')}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full font-bold transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <Building2 size={18} /> Register as an NGO
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
