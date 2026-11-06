import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Building2,
  Bell,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  UploadCloud,
  Camera,
  Image as ImageIcon,
  Users,
  Settings,
  ShieldCheck,
  AlertTriangle,
  Phone,
  MessageSquare,
  Navigation,
  Send,
  MapPin
} from 'lucide-react';

export function NGOPortal() {
  const [headcount, setHeadcount] = useState(180);
  const [dietaryPref, setDietaryPref] = useState(['VEG', 'COOKED', 'PACKAGED']);
  const [hasRefrigeration, setHasRefrigeration] = useState(true);
  const [maxStorageKg, setMaxStorageKg] = useState(250);
  const [savingCapacity, setSavingCapacity] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [activeRequests, setActiveRequests] = useState([]);

  // Fetch real-time live allocation requests dispatched by Admin & Persistent Capacity Settings
  const fetchNGORequests = async () => {
    try {
      const res = await axios.get('/api/v1/ngo/requests');
      setActiveRequests(res.data.data.requests || []);
      if (res.data.data.ngoProfile) {
        const prof = res.data.data.ngoProfile;
        if (prof.currentHeadcount !== undefined) setHeadcount(prof.currentHeadcount);
        if (prof.storageFacilities?.maxCapacityKg !== undefined) setMaxStorageKg(prof.storageFacilities.maxCapacityKg);
        if (prof.storageFacilities?.hasRefrigeration !== undefined) setHasRefrigeration(prof.storageFacilities.hasRefrigeration);
        if (prof.foodPreferences?.length) setDietaryPref(prof.foodPreferences);
      }
    } catch (err) {
      console.error('Failed to load NGO requests:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchNGORequests();
    fetchNearbyDonors();
    // Auto-poll every 5 seconds for immediate incoming dispatches from Admin
    const interval = setInterval(() => {
      fetchNGORequests();
      fetchNearbyDonors();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Reject modal state
  const [rejectingRequestId, setRejectingRequestId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('Capacity full for current dinner meal');

  // Delivery receipt confirmation modal
  const [deliveryOtp, setDeliveryOtp] = useState('');
  const [receivedQty, setReceivedQty] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [proofPreview, setProofPreview] = useState(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [submittingDelivery, setSubmittingDelivery] = useState(false);

  // Nearest Donors & Direct Contact / Chat / Charity Fleet Booking State
  const [nearbyDonors, setNearbyDonors] = useState([]);
  const [loadingDonors, setLoadingDonors] = useState(false);
  const [activeChatDonor, setActiveChatDonor] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [activeTruckDonor, setActiveTruckDonor] = useState(null);
  const [availableTrucks, setAvailableTrucks] = useState([]);
  const [loadingTrucks, setLoadingTrucks] = useState(false);
  const [bookingTruck, setBookingTruck] = useState(false);
  const [truckConfirmed, setTruckConfirmed] = useState(null);
  const [navigationDonor, setNavigationDonor] = useState(null);

  const fetchNearbyDonors = async () => {
    setLoadingDonors(true);
    try {
      const res = await axios.get('/api/v1/comm/nearby-donors');
      setNearbyDonors(res.data.data.donors || []);
    } catch (err) {
      console.error('Failed to load nearby donors:', err);
    } finally {
      setLoadingDonors(false);
    }
  };

  const openChatWithDonor = async (donor) => {
    setActiveChatDonor(donor);
    try {
      const res = await axios.get(`/api/v1/comm/chat/${donor.donationId}`);
      setChatMessages(res.data.data.messages || []);
    } catch (err) {
      setChatMessages([]);
    }
  };

  const sendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeChatDonor) return;

    const text = chatInput.trim();
    setChatInput('');

    try {
      const res = await axios.post('/api/v1/comm/chat/send', {
        donationId: activeChatDonor.donationId,
        recipientId: activeChatDonor.donorUserId,
        message: text
      });
      setChatMessages((prev) => [...prev, res.data.data.message]);
    } catch (err) {
      alert('Failed to send message.');
    }
  };

  const openTruckSelector = async (donor) => {
    setActiveTruckDonor(donor);
    setLoadingTrucks(true);
    try {
      const lat = donor.coordinates?.[1] || 12.9784;
      const lng = donor.coordinates?.[0] || 77.6412;
      const res = await axios.get(`/api/v1/comm/nearby-charity-trucks?lat=${lat}&lng=${lng}`);
      setAvailableTrucks(res.data.data.trucks || []);
    } catch (err) {
      console.error('Failed to load charity trucks:', err);
      setAvailableTrucks([]);
    } finally {
      setLoadingTrucks(false);
    }
  };

  const handleDispatchTruck = async (donor, vehicleId) => {
    setBookingTruck(true);
    try {
      const res = await axios.post('/api/v1/comm/dispatch-charity-truck', {
        donationId: donor.donationId,
        vehicleId
      });
      setTruckConfirmed(res.data.data);
      setActiveTruckDonor(null);
      fetchNearbyDonors();
    } catch (err) {
      alert(err.response?.data?.message || 'Charity truck dispatch failed.');
    } finally {
      setBookingTruck(false);
    }
  };

  const handleProofFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPreview(reader.result);
        setProofUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapacitySave = async (e) => {
    e.preventDefault();
    setSavingCapacity(true);
    try {
      await axios.put('/api/v1/ngo/capacity', {
        headcount: Number(headcount),
        maxStorageKg: Number(maxStorageKg),
        hasRefrigeration: Boolean(hasRefrigeration),
        dietaryPref
      });
      alert('NGO Beneficiary Headcount & Capacity Settings successfully saved to MongoDB database! These settings will persist whenever you log in or host on Render.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update capacity settings.');
    } finally {
      setSavingCapacity(false);
    }
  };

  const handleRespond = async (id, action, reason = '') => {
    try {
      await axios.post('/api/v1/donations/respond-request', {
        allocationId: id,
        action,
        reason
      });
      alert(`Donation allocation ${action === 'ACCEPT' ? 'ACCEPTED' : 'DECLINED'}! Status updated in Admin and Donor portals.`);
      fetchNGORequests();
    } catch (err) {
      // Local fallback optimistic update
      setActiveRequests((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: action === 'ACCEPT' ? 'ACCEPTED' : 'DECLINED' } : r
        )
      );
    }
    if (action === 'DECLINE') {
      setRejectingRequestId(null);
    }
  };

  const handleConfirmReceipt = async (e) => {
    e.preventDefault();
    setSubmittingDelivery(true);
    try {
      const res = await axios.post('/api/v1/ngo/confirm-handover', {
        otp: deliveryOtp.trim(),
        receivedQuantity: Number(receivedQty),
        proofImageUrl: proofUrl
      });
      alert(res.data.message || `Receipt verified! ${receivedQty} portions marked delivered.`);
      setShowDeliveryModal(false);
      setDeliveryOtp('');
      setReceivedQty('');
      setProofPreview(null);
      setProofUrl('');
      fetchNGORequests();
      fetchNearbyDonors();
    } catch (err) {
      alert(err.response?.data?.message || 'Handover verification failed. Please check the Delivery OTP.');
    } finally {
      setSubmittingDelivery(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#DDE9DC] shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#164B38]">
            NGO Community Operations
          </span>
          <h1 className="text-3xl font-serif-heading font-bold text-[#103B2D]">
            Robin Hood Army &bull; Bengaluru Shelter
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Receiving surplus meals, managing beneficiary capacities, and confirming handovers.
          </p>
        </div>

        <button
          onClick={() => setShowDeliveryModal(true)}
          className="px-6 py-3 bg-[#F28B45] hover:bg-[#e07a34] text-white rounded-full font-semibold text-xs shadow-md transition-all flex items-center gap-2"
        >
          <Truck size={16} /> Confirm Arrived Delivery
        </button>
      </div>

      {/* Capacity & Headcount Manager */}
      <div className="bg-white rounded-3xl border border-[#DDE9DC] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#DDE9DC]">
          <h2 className="text-lg font-bold font-serif-heading text-[#103B2D] flex items-center gap-2">
            <Settings size={18} className="text-[#164B38]" /> Beneficiary Headcount & Capacity Settings
          </h2>
          <span className="text-xs text-gray-500">Auto-tuned in matching engine</span>
        </div>

        <form onSubmit={handleCapacitySave} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Active Beneficiary Headcount
            </label>
            <input
              type="number"
              min="10"
              value={headcount}
              onChange={(e) => setHeadcount(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-[#DDE9DC] rounded-xl font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Max Storage Capacity (KG)
            </label>
            <input
              type="number"
              min="20"
              value={maxStorageKg}
              onChange={(e) => setMaxStorageKg(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-[#DDE9DC] rounded-xl font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Refrigeration Facility
            </label>
            <select
              value={hasRefrigeration ? 'YES' : 'NO'}
              onChange={(e) => setHasRefrigeration(e.target.value === 'YES')}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-[#DDE9DC] rounded-xl font-semibold"
            >
              <option value="YES">Cold-Chain Available</option>
              <option value="NO">Ambient Only</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={savingCapacity}
            className="py-2.5 px-4 bg-[#164B38] hover:bg-[#103B2D] text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            {savingCapacity ? 'Updating...' : 'Update Matching Quota'}
          </button>
        </form>
      </div>

      {/* Incoming Requests Section with 15-Minute Countdown */}
      <div className="bg-white rounded-3xl border border-[#DDE9DC] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold font-serif-heading text-[#103B2D] flex items-center gap-2">
            <Bell size={20} className="text-[#F28B45]" /> Incoming Donation Allocations
          </h2>
          <span className="text-xs bg-[#DDE9DC] text-[#164B38] font-bold px-3 py-1 rounded-full">
            {activeRequests.length} Active Requests
          </span>
        </div>

        <div className="space-y-4">
          {activeRequests.map((req) => (
            <div
              key={req.id}
              className="p-5 rounded-2xl border border-[#DDE9DC] bg-[#FAF7EF]/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-[#164B38]">
                    {req.donationCode}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    {req.dietaryType}
                  </span>
                </div>
                <h4 className="font-semibold text-lg text-gray-900">{req.donorName}</h4>
                <p className="text-xs text-gray-600">
                  {req.portions} Fresh Cooked Portions &bull; Pickup in {req.area}
                </p>
                <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600 mt-1">
                  <Clock size={14} /> Response window lock: {req.timeRemainingMins} minutes remaining
                </div>
              </div>

              {req.status === 'PENDING' ? (
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={() => setRejectingRequestId(req.id)}
                    className="flex-1 md:flex-none px-5 py-2.5 text-xs font-semibold text-red-600 border border-red-300 rounded-full hover:bg-red-50"
                  >
                    Decline...
                  </button>
                  <button
                    onClick={() => handleRespond(req.id, 'ACCEPT')}
                    className="flex-1 md:flex-none px-6 py-2.5 text-xs font-semibold bg-[#164B38] hover:bg-[#103B2D] text-white rounded-full shadow-md"
                  >
                    1-Click Accept
                  </button>
                </div>
              ) : (
                <div
                  className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                    req.status === 'ACCEPTED'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  <CheckCircle size={14} /> Allocation {req.status}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Nearest Donors & Direct Contact / Chat / Uber Booking Section */}
      <div className="bg-white rounded-3xl border border-[#DDE9DC] p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-[#DDE9DC]">
          <div>
            <h2 className="text-xl font-bold font-serif-heading text-[#103B2D] flex items-center gap-2">
              <MapPin size={22} className="text-[#F28B45]" /> Nearby Food Donors in Bengaluru
            </h2>
            <p className="text-xs text-gray-600 mt-1">
              Directly contact local restaurants & banquet donors, coordinate via live chat, or book instant Uber food transit.
            </p>
          </div>
          <span className="text-xs bg-[#DDE9DC] text-[#164B38] font-bold px-3 py-1 rounded-full">
            {nearbyDonors.length} Donors Nearby
          </span>
        </div>

        {loadingDonors && nearbyDonors.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-500">Scanning for nearby donors in your area...</div>
        ) : nearbyDonors.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-500">No active surplus donors logged within 25km right now.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nearbyDonors.map((donor) => (
              <div
                key={donor.donationId}
                className="p-5 border border-[#DDE9DC] rounded-2xl bg-[#FAF7EF]/60 flex flex-col justify-between space-y-4 shadow-xs"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="font-mono text-xs font-semibold text-[#164B38]">
                        {donor.donationCode}
                      </span>
                      <h4 className="font-bold text-base text-gray-900 mt-0.5">{donor.donorName}</h4>
                      <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                        <MapPin size={12} className="text-[#F28B45]" /> {donor.area} &bull;{' '}
                        <strong>{donor.distanceKm} km away</strong>
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      {donor.status}
                    </span>
                  </div>

                  <div className="mt-3 p-3 bg-white rounded-xl border border-gray-200 text-xs space-y-1">
                    <div className="font-medium text-gray-800">{donor.foodType}</div>
                    <div className="text-gray-500 text-[11px]">
                      {donor.portions} Portions &bull; Dietary: <strong>{donor.dietaryType}</strong>
                    </div>
                  </div>
                </div>

                {/* Direct Contact, Chat, Navigation Map, and Uber Booking Action Buttons */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#DDE9DC]">
                  {/* 1. Phone Call */}
                  <a
                    href={`tel:${donor.phone}`}
                    className="py-2 px-2 bg-white border border-[#DDE9DC] hover:border-[#164B38] text-gray-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all text-center"
                  >
                    <Phone size={12} className="text-emerald-700" /> Call
                  </a>

                  {/* 2. Direct Chat */}
                  <button
                    onClick={() => openChatWithDonor(donor)}
                    className="py-2 px-2 bg-white border border-[#DDE9DC] hover:border-[#164B38] text-gray-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all text-center"
                  >
                    <MessageSquare size={12} className="text-[#164B38]" /> Chat
                  </button>

                  {/* 3. Live Navigation Map */}
                  <button
                    onClick={() => setNavigationDonor(donor)}
                    className="py-2 px-2 bg-white border border-[#DDE9DC] hover:border-[#164B38] text-[#164B38] rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all text-center"
                  >
                    <Navigation size={12} className="text-[#164B38]" /> Map
                  </button>

                  {/* 4. Book Nearest Charity Truck */}
                  <button
                    onClick={() => openTruckSelector(donor)}
                    className="py-2 px-2 bg-[#164B38] hover:bg-[#103B2D] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 shadow-xs transition-all text-center"
                  >
                    <Truck size={12} className="text-[#F28B45]" /> Trucks
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Navigation & Pickup Route Map Modal */}
      {navigationDonor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#FAF7EF] w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-[#DDE9DC] relative animate-in fade-in zoom-in-95 space-y-4">
            <button
              onClick={() => setNavigationDonor(null)}
              className="absolute top-5 right-5 text-gray-500 hover:text-gray-800 text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center"
            >
              &times;
            </button>

            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#F28B45] uppercase tracking-wider">
                <Navigation size={14} /> Turn-by-Turn Pickup Route
              </div>
              <h3 className="text-xl font-bold font-serif-heading text-[#103B2D] mt-0.5">
                Food Pickup: {navigationDonor.donorName}
              </h3>
              <p className="text-xs text-gray-600">
                {navigationDonor.streetAddress || navigationDonor.area} &bull; Ph: {navigationDonor.phone}
              </p>
            </div>

            {/* Interactive Geographic Route Visualizer */}
            <div className="relative w-full h-[260px] bg-[#103B2D] rounded-2xl overflow-hidden p-5 text-white flex flex-col justify-between border border-[#164B38]">
              <div className="flex justify-between items-start text-xs z-10">
                <span className="font-semibold text-emerald-300">
                  Est. Travel Time: ~{Math.round(navigationDonor.distanceKm * 3.5 + 8)} mins
                </span>
                <span className="bg-emerald-800/80 px-2 py-0.5 rounded text-[11px] font-bold">
                  {navigationDonor.distanceKm} km away
                </span>
              </div>

              {/* Waypoints line */}
              <div className="my-auto space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
                      NGO
                    </div>
                    <div>
                      <div className="font-bold text-xs">Your Shelter</div>
                      <div className="text-[10px] text-gray-400">Departure Base</div>
                    </div>
                  </div>

                  <div className="flex-1 mx-3 border-t-2 border-dashed border-[#F28B45] relative">
                    <Truck size={16} className="text-[#F28B45] absolute -top-2 left-1/2 -translate-x-1/2 animate-pulse" />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#F28B45] text-white flex items-center justify-center font-bold text-xs shadow-md">
                      DONOR
                    </div>
                    <div>
                      <div className="font-bold text-xs">{navigationDonor.area}</div>
                      <div className="text-[10px] text-gray-400">{navigationDonor.portions} Portions</div>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-black/40 rounded-xl text-[11px] text-gray-300 border border-white/10 flex items-center justify-between">
                  <span>Bengaluru Corridor: Optimal via Outer Ring Rd / Old Airport Rd</span>
                  <span className="text-emerald-400 font-bold">Clear Traffic</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px] text-gray-400 border-t border-white/10 pt-2">
                <span>Coordinates: {navigationDonor.coordinates ? `${navigationDonor.coordinates[1].toFixed(4)}, ${navigationDonor.coordinates[0].toFixed(4)}` : 'Bengaluru Urban'}</span>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${navigationDonor.coordinates ? `${navigationDonor.coordinates[1]},${navigationDonor.coordinates[0]}` : encodeURIComponent(navigationDonor.area + ', Bengaluru')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#F28B45] font-bold hover:underline flex items-center gap-1"
                >
                  Launch in Google Maps &rarr;
                </a>
              </div>
            </div>

            {/* Quick Action Buttons inside Navigation */}
            <div className="flex gap-3 pt-1">
              <a
                href={`tel:${navigationDonor.phone}`}
                className="flex-1 py-2.5 bg-white border border-[#DDE9DC] text-[#164B38] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs text-center"
              >
                <Phone size={14} className="text-emerald-700" /> Call Kitchen
              </a>
              <button
                onClick={() => {
                  const donorToDispatch = navigationDonor;
                  setNavigationDonor(null);
                  openTruckSelector(donorToDispatch);
                }}
                className="flex-2 py-2.5 bg-[#164B38] hover:bg-[#103B2D] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md text-center"
              >
                <Truck size={14} className="text-[#F28B45]" /> Dispatch Nearest Charity Truck
              </button>
            </div>
          </div>
        </div>
      )}
      {activeChatDonor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#FAF7EF] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-[#DDE9DC] relative flex flex-col h-[520px] animate-in fade-in zoom-in-95">
            <button
              onClick={() => setActiveChatDonor(null)}
              className="absolute top-5 right-5 text-gray-500 hover:text-gray-800 text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center"
            >
              &times;
            </button>

            <div className="pb-3 border-b border-[#DDE9DC]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#164B38] text-white flex items-center justify-center font-bold text-xs">
                  {activeChatDonor.donorName[0]}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#103B2D]">{activeChatDonor.donorName}</h3>
                  <p className="text-[10px] text-gray-500">
                    Direct Kitchen Coordination &bull; Ph: {activeChatDonor.phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Thread */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 text-xs">
              <div className="text-center text-[10px] text-gray-400 my-1">
                Chat conversation regarding donation #{activeChatDonor.donationCode}
              </div>

              {chatMessages.length === 0 ? (
                <div className="text-center py-12 text-gray-400 italic">
                  No messages yet. Send a message to coordinate pickup timing or packaging!
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      msg.senderRole === 'NGO_MANAGER' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] px-3.5 py-2 rounded-2xl ${
                        msg.senderRole === 'NGO_MANAGER'
                          ? 'bg-[#164B38] text-white rounded-br-none'
                          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-2xs'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={sendChatMessage} className="pt-3 border-t border-[#DDE9DC] flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type coordination message to donor..."
                className="flex-1 px-3 py-2 text-xs bg-white border border-[#DDE9DC] rounded-xl focus:outline-none focus:border-[#164B38]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#164B38] text-white rounded-xl text-xs font-bold hover:bg-[#103B2D] transition-all flex items-center gap-1"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Nearest Charity Trucks Discovery & Selection Modal */}
      {activeTruckDonor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#FAF7EF] w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-[#DDE9DC] relative animate-in fade-in zoom-in-95 space-y-4">
            <button
              onClick={() => setActiveTruckDonor(null)}
              className="absolute top-5 right-5 text-gray-500 hover:text-gray-800 text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center"
            >
              &times;
            </button>

            <div>
              <span className="text-xs font-bold text-[#164B38] uppercase tracking-wider flex items-center gap-1.5">
                <Truck size={14} className="text-[#F28B45]" /> Dedicated Food Rescue Fleet
              </span>
              <h3 className="text-xl font-bold font-serif-heading text-[#103B2D] mt-0.5">
                Nearest Charity Trucks & Vans
              </h3>
              <p className="text-xs text-gray-600">
                Dispatch an active charity cargo vehicle to collect <strong>{activeTruckDonor.portions} portions</strong> from {activeTruckDonor.donorName} ({activeTruckDonor.area}).
              </p>
            </div>

            {loadingTrucks ? (
              <div className="py-12 text-center text-xs text-gray-500">
                Scanning Bengaluru charity fleet GPS positions...
              </div>
            ) : availableTrucks.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500 bg-white rounded-2xl border border-gray-200">
                No active charity trucks located within range right now.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                {availableTrucks.map((truck) => (
                  <div
                    key={truck.id}
                    className="p-3.5 bg-white rounded-2xl border border-[#DDE9DC] hover:border-[#164B38] transition-all flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#103B2D]">{truck.driverName}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 font-mono">
                          {truck.registrationNumber}
                        </span>
                        {truck.hasCooling && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 text-blue-800">
                            Refrigerated
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-3">
                        <span>Type: <strong>{truck.vehicleType.replace('_', ' ')}</strong></span>
                        <span>Capacity: <strong>{truck.capacityKg} kg</strong></span>
                        <span>Driver Ph: <strong>{truck.driverPhone}</strong></span>
                      </div>
                      <div className="text-[11px] text-[#164B38] font-semibold flex items-center gap-2">
                        <span>Distance: <strong>{truck.distanceKm} km</strong></span>
                        <span>&bull;</span>
                        <span>ETA: <strong>{truck.eta}</strong></span>
                        <span>&bull;</span>
                        <span className="text-emerald-700 font-bold">{truck.cost}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDispatchTruck(activeTruckDonor, truck.id)}
                      disabled={bookingTruck}
                      className="px-4 py-2 bg-[#164B38] hover:bg-[#103B2D] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                    >
                      <Truck size={13} className="text-[#F28B45]" /> Dispatch
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="p-3 bg-[#E6F8F0] border border-[#01B574]/30 rounded-xl text-[11px] text-[#164B38] flex items-center justify-between">
              <span>All charity fleet transports are <strong>100% Free</strong> for verified NGOs.</span>
              <span className="font-bold text-emerald-800">Zero Commission</span>
            </div>
          </div>
        </div>
      )}

      {/* Charity Truck Dispatch Confirmation Modal */}
      {truckConfirmed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#FAF7EF] w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-[#DDE9DC] relative animate-in fade-in zoom-in-95 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Truck size={28} />
            </div>

            <div>
              <h3 className="text-xl font-bold font-serif-heading text-[#103B2D]">
                Charity Truck Dispatched!
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Your dedicated food rescue vehicle is en route to collect donor meals.
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-gray-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Booking Ref:</span>
                <span className="font-mono font-bold text-[#164B38]">{truckConfirmed.bookingReference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Assigned Driver:</span>
                <span className="font-semibold text-gray-900">{truckConfirmed.driverName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Vehicle / Plate:</span>
                <span className="font-mono font-semibold">{truckConfirmed.plate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Vehicle Type:</span>
                <span className="font-semibold">{truckConfirmed.vehicleType?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Driver Phone:</span>
                <span className="font-semibold">{truckConfirmed.driverPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pickup OTP:</span>
                <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                  {truckConfirmed.pickupOtp}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Est. Arrival:</span>
                <span className="font-bold text-emerald-700">{truckConfirmed.pickupEta}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-gray-500">Transit Cost:</span>
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                  {truckConfirmed.estimatedFare || '100% FREE (Charity Fleet)'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setTruckConfirmed(null)}
              className="w-full py-2.5 bg-[#164B38] hover:bg-[#103B2D] text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              Done & Return to Portal
            </button>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectingRequestId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#FAF7EF] w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-[#DDE9DC] relative">
            <h4 className="text-lg font-bold font-serif-heading text-[#103B2D] mb-1">
              Decline Donation Allocation
            </h4>
            <p className="text-xs text-gray-600 mb-4">
              Providing a reason helps the matching algorithm reroute immediately to the next candidate NGO.
            </p>

            <div className="space-y-3">
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#DDE9DC] rounded-xl"
              >
                <option value="Capacity full for current dinner meal">Capacity full for dinner</option>
                <option value="Storage refrigeration currently at maximum limit">Refrigeration full</option>
                <option value="Dietary requirement mismatch for today's beneficiaries">Dietary mismatch</option>
                <option value="Facility closed early for renovation">Facility closed</option>
              </select>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setRejectingRequestId(null)}
                  className="flex-1 py-2 text-xs border border-gray-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRespond(rejectingRequestId, 'DECLINE', rejectionReason)}
                  className="flex-1 py-2 text-xs bg-red-600 text-white rounded-xl font-semibold shadow-sm"
                >
                  Confirm Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Proof of Delivery Upload & OTP Modal */}
      {showDeliveryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#FAF7EF] w-full max-w-md rounded-3xl p-8 shadow-2xl border border-[#DDE9DC] relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowDeliveryModal(false)}
              className="absolute top-5 right-5 text-gray-500 hover:text-gray-800 text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center"
            >
              &times;
            </button>

            <h3 className="text-2xl font-bold font-serif-heading text-[#103B2D] mb-1">
              Verify Delivery Handover
            </h3>
            <p className="text-xs text-gray-600 mb-6">
              Enter the 6-digit Delivery OTP and upload proof of receipt to complete the donation.
            </p>

            <form onSubmit={handleConfirmReceipt} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  6-Digit Delivery OTP (Sent to NGO Manager SMS)
                </label>
                <input
                  type="text"
                  required
                  maxLength="6"
                  value={deliveryOtp}
                  onChange={(e) => setDeliveryOtp(e.target.value)}
                  placeholder="e.g. 583921"
                  className="w-full px-4 py-2 text-center tracking-widest font-mono text-lg font-bold bg-white border border-[#DDE9DC] rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Received Quantity (Portions)
                </label>
                <input
                  type="number"
                  required
                  value={receivedQty}
                  onChange={(e) => setReceivedQty(e.target.value)}
                  placeholder="120"
                  className="w-full px-4 py-2 text-sm bg-white border border-[#DDE9DC] rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Proof of Receipt Photo (Camera Snap or File Upload)
                </label>
                <div className="p-4 border-2 border-dashed border-[#DDE9DC] rounded-xl text-center bg-white space-y-3">
                  {proofPreview ? (
                    <div className="relative inline-block">
                      <img
                        src={proofPreview}
                        alt="Proof preview"
                        className="w-40 h-28 object-cover rounded-xl border border-gray-200 mx-auto shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setProofPreview(null);
                          setProofUrl('');
                        }}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
                      >
                        &times;
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-center gap-3 text-gray-400">
                        <Camera size={26} className="text-[#164B38]" />
                        <ImageIcon size={26} className="text-[#F28B45]" />
                      </div>
                      <div className="text-xs text-gray-600 font-medium">
                        Take a receipt photo or choose an image file
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center gap-2 pt-1">
                    {/* Live Camera Snap */}
                    <label className="cursor-pointer px-3 py-1.5 bg-[#164B38] hover:bg-[#103B2D] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all">
                      <Camera size={14} /> Open Camera
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleProofFileChange}
                        className="hidden"
                      />
                    </label>

                    {/* File Upload */}
                    <label className="cursor-pointer px-3 py-1.5 bg-white border border-[#DDE9DC] hover:border-[#164B38] text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all">
                      <ImageIcon size={14} /> Choose File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProofFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingDelivery}
                className="w-full py-3.5 bg-[#164B38] hover:bg-[#103B2D] text-white rounded-xl font-semibold shadow-md transition-all text-xs"
              >
                {submittingDelivery ? 'Verifying OTP & Receipt...' : 'Confirm Delivery & Release Donor Credit'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
