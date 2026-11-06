import React, { useState, useEffect } from 'react';
import impactGridImg from '../assets/foodbridge-impact-grid.jpg';
import {
  Utensils,
  PackageCheck,
  Truck,
  HeartHandshake,
  Smile,
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const STORY_SLIDES = [
  {
    step: '1. Cooking & Harvest',
    title: 'Nutritious & Fresh Surplus Prepared',
    desc: 'Hotels, banquets, and commercial kitchens prepare generous surplus meals safely packed in food-grade carriers.',
    badge: 'Cooking',
    icon: Utensils,
    color: '#F28B45',
    zoomOrigin: '12% 15%' // Top left (Preparing Nutritious Meals)
  },
  {
    step: '2. Packing Fresh Meals',
    title: 'Volunteers Packing & Portions',
    desc: 'Dedicated teams portion and package fresh cooked dishes into insulated food boxes.',
    badge: 'Packing',
    icon: PackageCheck,
    color: '#01B574',
    zoomOrigin: '38% 15%' // Top 2nd (Packing Fresh Meals)
  },
  {
    step: '3. Hygienic & Safe Sealing',
    title: 'Quality Verification & Sealed Boxes',
    desc: 'Food is inspected for shelf life, temperature checked, and labeled with safety seals.',
    badge: 'Hygiene',
    icon: ShieldCheck,
    color: '#164B38',
    zoomOrigin: '63% 15%' // Top 3rd (Hygienic & Safe Packing)
  },
  {
    step: '4. Pickup & Transport',
    title: 'Electric Vans & Fleet Pickup',
    desc: 'Rapid collection using thermal crates and monitored transport corridors across Bengaluru.',
    badge: 'Transport',
    icon: Truck,
    color: '#F28B45',
    zoomOrigin: '88% 15%' // Top right (Pickup & Transport)
  },
  {
    step: '5. Distributing Meals',
    title: 'Direct Handover at Shelters',
    desc: 'Meals reach child care centers, elder homes, and night shelters on time.',
    badge: 'Distribution',
    icon: HeartHandshake,
    color: '#164B38',
    zoomOrigin: '12% 45%' // Middle left (Distributing Meals)
  },
  {
    step: '6. Bringing Smiles',
    title: 'Nourishment & Joy for Children',
    desc: 'Warm, balanced food restores hope, health, and smiling faces in every neighborhood.',
    badge: 'Smiles',
    icon: Smile,
    color: '#01B574',
    zoomOrigin: '38% 45%' // Middle 2nd (Bringing Smiles)
  },
  {
    step: '7. Healthier Community',
    title: 'Happy & Fed Community',
    desc: 'Children and families thrive together with nutritious daily food support.',
    badge: 'Community',
    icon: Smile,
    color: '#01B574',
    zoomOrigin: '63% 45%' // Middle 3rd (Healthier Happier Community)
  },
  {
    step: '8. Gratitude & Social Impact',
    title: 'Restoring Hope & Dignity',
    desc: 'Elders and families blessed with care, dignity, and zero food waste.',
    badge: 'Impact',
    icon: HeartHandshake,
    color: '#F28B45',
    zoomOrigin: '88% 45%' // Middle right (Gratitude & Impact)
  }
];

export function HeroAnimatedShowcase() {
  const [currentIdx, setCurrentIdx] = useState(0);

  // Automatically advance slideshow every 2 seconds (2000ms)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % STORY_SLIDES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const slide = STORY_SLIDES[currentIdx];
  const IconComponent = slide.icon;

  return (
    <div className="w-full max-w-xl lg:max-w-2xl relative rounded-3xl p-4 sm:p-5 bg-white/80 backdrop-blur-md border border-[#DCE8DB] shadow-2xl space-y-4 overflow-hidden group">
      {/* Dynamic Background Glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#01B574]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#F28B45]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Large Image Viewport with Animated Transitions */}
      <div className="relative w-full h-[360px] sm:h-[440px] lg:h-[480px] rounded-2xl overflow-hidden border border-[#DCE8DB] shadow-inner bg-gray-900">
        <img
          key={currentIdx}
          src={impactGridImg}
          alt={slide.title}
          className="w-full h-full object-cover transition-all duration-700 ease-in-out transform"
          style={{
            transformOrigin: slide.zoomOrigin,
            transform: 'scale(2.1)'
          }}
        />

        {/* Ambient Dark Gradient Vignette for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

        {/* Floating Top Tag */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#164B38]/90 text-white shadow-md backdrop-blur-md flex items-center gap-1.5">
            <Sparkles size={12} className="text-[#F28B45]" />
            <span>{slide.step}</span>
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 text-gray-800 shadow-md backdrop-blur-md flex items-center gap-1">
            <ShieldCheck size={11} className="text-[#01B574]" />
            <span>{slide.badge}</span>
          </span>
        </div>

        {/* Active Stage Caption overlay */}
        <div className="absolute bottom-3 left-3 right-3 text-white space-y-1">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs shadow-md"
              style={{ backgroundColor: slide.color }}
            >
              <IconComponent size={14} />
            </div>
            <h4 className="font-serif-heading font-bold text-base sm:text-lg tracking-tight leading-snug drop-shadow-md">
              {slide.title}
            </h4>
          </div>
          <p className="text-xs text-gray-200 line-clamp-2 leading-relaxed drop-shadow-sm font-light">
            {slide.desc}
          </p>
        </div>
      </div>

      {/* Interactive Phase Navigation Indicators (8 Steps) */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 pt-1">
        {STORY_SLIDES.map((st, idx) => {
          const isActive = idx === currentIdx;
          return (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              className={`py-1.5 px-0.5 rounded-lg text-center transition-all duration-200 flex flex-col items-center gap-0.5 ${
                isActive
                  ? 'bg-[#164B38] text-white shadow-sm ring-2 ring-[#01B574]'
                  : 'bg-[#FAF7EF] hover:bg-gray-100 text-gray-600'
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  isActive ? 'bg-[#F28B45] scale-125' : 'bg-gray-300'
                }`}
              />
              <span className="text-[9px] font-bold leading-none truncate w-full px-0.5">
                {st.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Live Process Ticker */}
      <div className="flex items-center justify-between text-[11px] text-gray-600 px-2 pt-1 border-t border-[#DCE8DB]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#01B574] animate-ping" />
          <span className="font-semibold text-gray-800">Automatic 0.5s Impact Cycle</span>
        </div>
        <div className="flex items-center gap-1 text-[#164B38] font-bold">
          <span>Step {currentIdx + 1} of 8</span>
          <ChevronRight size={13} />
        </div>
      </div>
    </div>
  );
}
