import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  Utensils,
  PlusCircle,
  Clock,
  MapPin,
  CheckCircle,
  Truck,
  TrendingUp,
  Award,
  UploadCloud,
  Camera,
  Image as ImageIcon,
  IndianRupee,
  ChevronRight,
  ShieldCheck,
  Calendar,
  AlertCircle
} from 'lucide-react';

const STATUS_STEPS = [
  { key: 'SUBMITTED', label: 'Logged' },
  { key: 'VALIDATED', label: 'Safety Verified' },
  { key: 'MATCHING', label: 'NGO Matched' },
  { key: 'NGO_ACCEPTED', label: 'Shelter Accepted' },
  { key: 'IN_TRANSIT', label: 'In Transit' },
  { key: 'CLOSED', label: 'Handed Over' }
];

export function DonorPortal() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Monetary contribution state
  const [monetaryAmount, setMonetaryAmount] = useState('1000');
  const [panNumber, setPanNumber] = useState('');
  const [paying, setPaying] = useState(false);

  // Multi-step food donation form state (NO hardcoded default address; uses donor's registered phone)
  const [foodCategory, setFoodCategory] = useState('COOKED_MEALS');
  const [dietaryType, setDietaryType] = useState('VEG');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('PORTIONS');
  const [hoursRemaining, setHoursRemaining] = useState('5');
  const [addressLine1, setAddressLine1] = useState('');
  const [area, setArea] = useState('');
  const [pincode, setPincode] = useState('');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setImageUrl(reader.result); // Base64 data URI for upload & perceptual hash
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchDonations = async () => {
    try {
      const res = await axios.get('/api/v1/donations/my');
      setDonations(res.data.data.donations || []);
    } catch (err) {
      console.error('Failed to fetch donations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
    // Auto-poll every 5 seconds so donor sees NGO match and acceptance in real time
    const interval = setInterval(fetchDonations, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateDonation = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const deadline = new Date(Date.now() + parseInt(hoursRemaining) * 3600 * 1000).toISOString();

    const payload = {
      foodCategory,
      dietaryType,
      foodItems: [
        {
          name: itemName,
          quantity: parseFloat(quantity),
          unit
        }
      ],
      perishable: true,
      consumptionDeadline: deadline,
      storageCondition: 'AMBIENT',
      pickupAddress: {
        line1: addressLine1,
        area: area,
        city: 'Bengaluru',
        pincode: pincode,
        contactPerson: user?.name || 'Donor Incharge',
        contactPhone: contactPhone || user?.phone
      },
      pickupCoordinates: {
        latitude: 12.9784,
        longitude: 77.6412
      },
      notes
    };

    try {
      const res = await axios.post('/api/v1/donations', payload);
      const newDonation = res.data.data.donation;

      // Register image if provided
      if (imageUrl) {
        await axios.post('/api/v1/integrations/cloudinary/register-image', {
          donationId: newDonation._id,
          cloudinaryPublicId: `pub_${Date.now()}`,
          secureUrl: imageUrl
        });
      }

      setShowCreateModal(false);
      setCurrentStep(1);
      setItemName('');
      setQuantity('');
      setImageUrl('');
      fetchDonations();
    } catch (err) {
      if (err.response?.status === 403) {
        alert('Permission Denied: Your active session lacks Food Donor permissions (you may be logged in as an NGO Manager or Admin in another tab). Please sign in with a Donor account.');
      } else if (err.response?.status === 401) {
        alert('Session expired or invalid. Please sign in again.');
      } else {
        alert(err.response?.data?.message || 'Error creating donation');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRazorpayPayment = async (e) => {
    e.preventDefault();
    setPaying(true);
    try {
      const res = await axios.post('/api/v1/payments/create-order', {
        amount: parseFloat(monetaryAmount),
        panNumber
      });
      const order = res.data.data;

      // Complete payment capture simulation
      await axios.post('/api/v1/payments/verify', {
        razorpayOrderId: order.orderId,
        razorpayPaymentId: `pay_${Date.now()}`,
        razorpaySignature: 'valid_test_sig'
      });

      alert(`₹${monetaryAmount} successfully received! Section 80G Tax Exemption receipt registered for PAN: ${panNumber || 'N/A'}`);
      setShowPayModal(false);
      setPanNumber('');
    } catch (err) {
      alert(err.response?.data?.message || 'Payment initiation failed');
    } finally {
      setPaying(false);
    }
  };

  const totalMeals = donations.reduce((acc, d) => acc + (d.totalPortionsEstimated || 0), 0);
  const co2OffsetKg = Math.round(totalMeals * 0.45 * 10) / 10; // ~0.45kg CO2 saved per meal portion

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      {/* Top Banner & Action Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#DDE9DC] shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#F28B45]">
            Donor Impact Portal
          </span>
          <h1 className="text-3xl font-serif-heading font-bold text-[#103B2D]">
            Bengaluru Food Rescue Desk
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Redirecting hotel, banquet, and kitchen surplus to local verified community shelters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPayModal(true)}
            className="px-5 py-3 border border-[#164B38] text-[#164B38] hover:bg-[#164B38] hover:text-white rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <IndianRupee size={16} /> Donate Funds (80G)
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-[#164B38] hover:bg-[#103B2D] text-white rounded-full text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            <PlusCircle size={16} /> New Food Donation
          </button>
        </div>
      </div>

      {/* Impact Scorecard */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#DDE9DC] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#DDE9DC] text-[#164B38] flex items-center justify-center">
            <Utensils size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold font-serif-heading text-[#103B2D]">
              {totalMeals} Portions
            </div>
            <div className="text-xs text-gray-600">Total Food Rescued</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#DDE9DC] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold font-serif-heading text-[#103B2D]">
              {co2OffsetKg} kg
            </div>
            <div className="text-xs text-gray-600">CO₂ Emissions Prevented</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#DDE9DC] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-[#F28B45] flex items-center justify-center">
            <Truck size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold font-serif-heading text-[#103B2D]">
              {donations.filter((d) => d.status === 'CLOSED').length} Handouts
            </div>
            <div className="text-xs text-gray-600">Completed Distributions</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#DDE9DC] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Award size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold font-serif-heading text-[#103B2D]">
              Rank #4
            </div>
            <div className="text-xs text-gray-600">Bengaluru Leaderboard</div>
          </div>
        </div>
      </div>

      {/* Active Donation Tracking Stepper */}
      {donations.length > 0 && (
        <div className="bg-white rounded-3xl border border-[#DDE9DC] p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 className="text-xl font-bold font-serif-heading text-[#103B2D] flex items-center gap-2">
                <Clock size={20} className="text-[#F28B45]" /> Live Distribution Stepper
              </h2>
              {donations[0].allocatedNgo ? (
                <p className="text-xs text-emerald-800 font-semibold mt-1">
                  Matched & Dispatched to: <strong>{donations[0].allocatedNgo.name}</strong> ({donations[0].allocatedNgo.area})
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  Matching with nearby verified Bengaluru shelters...
                </p>
              )}
            </div>
            <span className="text-xs font-mono font-bold text-[#164B38] bg-[#DDE9DC] px-3 py-1 rounded-full">
              Status: {donations[0].status}
            </span>
          </div>

          <div className="py-4">
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {STATUS_STEPS.map((st, i) => {
                const currentStatus = donations[0].status;
                const statusOrder = [
                  'SUBMITTED',
                  'VALIDATED',
                  'MATCHING',
                  'NGO_ACCEPTED',
                  'IN_TRANSIT',
                  'CLOSED'
                ];
                const currentIndex = statusOrder.indexOf(currentStatus);
                const stepIndex = statusOrder.indexOf(st.key);
                const isPassed = stepIndex <= (currentIndex !== -1 ? currentIndex : 1);

                return (
                  <div key={st.key} className="flex flex-col items-center text-center space-y-2">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isPassed
                          ? 'bg-[#164B38] text-white shadow-md'
                          : 'bg-gray-100 text-gray-400 border border-gray-200'
                      }`}
                    >
                      {isPassed ? <CheckCircle size={16} /> : i + 1}
                    </div>
                    <span
                      className={`text-xs ${
                        isPassed ? 'font-bold text-[#103B2D]' : 'text-gray-400'
                      }`}
                    >
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Donation History Table */}
      <div className="bg-white rounded-3xl border border-[#DDE9DC] p-6 shadow-sm">
        <h2 className="text-xl font-bold font-serif-heading text-[#103B2D] mb-4">
          Donation Log & Audits
        </h2>

        {loading ? (
          <div className="text-center py-8 text-sm text-gray-500">Loading your donations...</div>
        ) : donations.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-500 space-y-3">
            <Utensils className="mx-auto text-gray-400" size={32} />
            <p>You have not created any food donations yet.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-[#164B38] font-semibold underline text-sm"
            >
              Post your first surplus meal batch
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF7EF] text-gray-600 border-b border-[#DDE9DC]">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Dietary</th>
                  <th className="py-3 px-4">Portions</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Logged At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {donations.map((d) => (
                  <tr key={d._id} className="hover:bg-gray-50/80">
                    <td className="py-3.5 px-4 font-mono font-medium text-[#164B38]">
                      {d.donationCode}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-800">
                      {d.foodItems?.map((i) => `${i.name} (${i.quantity} ${i.unit})`).join(', ')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          d.dietaryType === 'VEG'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {d.dietaryType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-900">
                      {d.totalPortionsEstimated}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#DDE9DC] text-[#164B38]">
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-500">
                      {new Date(d.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Multi-Step Food Donation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#FAF7EF] w-full max-w-lg rounded-3xl p-8 shadow-2xl border border-[#DDE9DC] relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => {
                setShowCreateModal(false);
                setCurrentStep(1);
              }}
              className="absolute top-5 right-5 text-gray-500 hover:text-gray-800 text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center"
            >
              &times;
            </button>

            {/* Stepper Progress Header */}
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#DDE9DC]">
              <div>
                <h3 className="text-xl font-bold font-serif-heading text-[#103B2D]">
                  Post Surplus Meals
                </h3>
                <p className="text-xs text-gray-500">Step {currentStep} of 3</p>
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`w-6 h-1.5 rounded-full ${
                      step <= currentStep ? 'bg-[#164B38]' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateDonation} className="space-y-4">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={foodCategory}
                        onChange={(e) => setFoodCategory(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-[#DDE9DC] rounded-xl"
                      >
                        <option value="COOKED_MEALS">Cooked Meals</option>
                        <option value="RAW_RATION">Raw Ration</option>
                        <option value="PACKAGED_FOOD">Packaged Goods</option>
                        <option value="BAKERY_DAIRY">Bakery & Dairy</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Dietary Type
                      </label>
                      <select
                        value={dietaryType}
                        onChange={(e) => setDietaryType(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-[#DDE9DC] rounded-xl"
                      >
                        <option value="VEG">Vegetarian</option>
                        <option value="NON_VEG">Non-Vegetarian</option>
                        <option value="VEGAN">Vegan</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Food Item Description
                    </label>
                    <input
                      type="text"
                      required
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      placeholder="e.g. Sambar Rice & Poriyal trays"
                      className="w-full px-4 py-2 text-sm bg-white border border-[#DDE9DC] rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="50"
                        className="w-full px-4 py-2 text-sm bg-white border border-[#DDE9DC] rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Unit</label>
                      <select
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-[#DDE9DC] rounded-xl"
                      >
                        <option value="PORTIONS">Portions</option>
                        <option value="KG">Kilograms (KG)</option>
                        <option value="PACKETS">Packets</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!itemName || !quantity}
                    onClick={() => setCurrentStep(2)}
                    className="w-full py-3 bg-[#164B38] hover:bg-[#103B2D] text-white rounded-xl font-semibold shadow-md transition-all flex items-center justify-center gap-1.5 mt-2"
                  >
                    Continue to Food Safety & Photo <ChevronRight size={16} />
                  </button>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Hours Before Food Expiry
                    </label>
                    <select
                      value={hoursRemaining}
                      onChange={(e) => setHoursRemaining(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#DDE9DC] rounded-xl"
                    >
                      <option value="3">3 Hours (Urgent Priority)</option>
                      <option value="5">5 Hours</option>
                      <option value="8">8 Hours</option>
                      <option value="24">24 Hours</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Food Image (Camera Snap or File Upload)
                    </label>
                    <div className="p-4 border-2 border-dashed border-[#DDE9DC] rounded-xl text-center bg-white space-y-3">
                      {imagePreview ? (
                        <div className="relative inline-block">
                          <img
                            src={imagePreview}
                            alt="Food preview"
                            className="w-40 h-28 object-cover rounded-xl border border-gray-200 mx-auto shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null);
                              setImageUrl('');
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
                            Take a live kitchen photo or select an image file
                          </div>
                        </div>
                      )}

                      <div className="flex justify-center gap-2 pt-1">
                        {/* Live Camera Capture Input */}
                        <label className="cursor-pointer px-3 py-1.5 bg-[#164B38] hover:bg-[#103B2D] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all">
                          <Camera size={14} /> Open Camera
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleImageFileChange}
                            className="hidden"
                          />
                        </label>

                        {/* File Upload Input */}
                        <label className="cursor-pointer px-3 py-1.5 bg-white border border-[#DDE9DC] hover:border-[#164B38] text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all">
                          <ImageIcon size={14} /> Choose File
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <div className="text-[10px] text-gray-400">
                        Supports JPEG, PNG, WEBP with automated fraud-detection hashing
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 py-3 border border-[#DDE9DC] text-gray-700 rounded-xl font-semibold text-xs"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="flex-2 py-3 bg-[#164B38] hover:bg-[#103B2D] text-white rounded-xl font-semibold text-xs shadow-md"
                    >
                      Continue to Pickup Address
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Street / Facility Address Line 1 *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      placeholder="e.g. 42/1, 100ft Road, Opp. Metro Pillar 12"
                      className="w-full px-4 py-2 text-sm bg-white border border-[#DDE9DC] rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Bengaluru Locality / Area *
                      </label>
                      <input
                        type="text"
                        required
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        placeholder="e.g. Indiranagar, Whitefield, Koramangala"
                        className="w-full px-4 py-2 text-sm bg-white border border-[#DDE9DC] rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        required
                        pattern="[1-9][0-9]{5}"
                        maxLength="6"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="560038"
                        className="w-full px-4 py-2 text-sm bg-white border border-[#DDE9DC] rounded-xl font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Donor Contact Phone for Driver Pickup (Your Registered Number)
                    </label>
                    <input
                      type="tel"
                      required
                      value={contactPhone || user?.phone || ''}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder={user?.phone || 'Your registered 10-digit number'}
                      className="w-full px-4 py-2 text-sm bg-gray-50 border border-[#DDE9DC] rounded-xl font-medium"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">
                      Pre-filled from your authenticated account profile.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Pickup Handling Notes (Optional)
                    </label>
                    <textarea
                      rows="2"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Please bring insulated food containers; back service gate."
                      className="w-full px-4 py-2 text-sm bg-white border border-[#DDE9DC] rounded-xl"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="flex-1 py-3 border border-[#DDE9DC] text-gray-700 rounded-xl font-semibold text-xs"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !addressLine1 || !area || !pincode}
                      className="flex-2 py-3 bg-[#164B38] hover:bg-[#103B2D] text-white rounded-xl font-semibold text-xs shadow-md disabled:opacity-50"
                    >
                      {submitting ? 'Validating & Publishing...' : 'Confirm & Publish Donation'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Razorpay Monetary Donation Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#FAF7EF] w-full max-w-md rounded-3xl p-8 shadow-2xl border border-[#DDE9DC] relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowPayModal(false)}
              className="absolute top-5 right-5 text-gray-500 hover:text-gray-800 text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center"
            >
              &times;
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <IndianRupee size={24} />
              </div>
              <h3 className="text-2xl font-bold font-serif-heading text-[#103B2D]">
                Fuel Bengaluru Cold-Chain
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Supports fuel and insulated storage for emergency evening food rescue rounds.
              </p>
            </div>

            <form onSubmit={handleRazorpayPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Donation Amount (INR ₹)
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {['500', '1000', '2500'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setMonetaryAmount(amt)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        monetaryAmount === amt
                          ? 'bg-[#164B38] text-white border-[#164B38]'
                          : 'bg-white text-gray-700 border-[#DDE9DC]'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  required
                  min="50"
                  value={monetaryAmount}
                  onChange={(e) => setMonetaryAmount(e.target.value)}
                  className="w-full px-4 py-2 text-sm bg-white border border-[#DDE9DC] rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  PAN Number (Optional for 80G Tax Exemption)
                </label>
                <input
                  type="text"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. ABCDE1234F"
                  maxLength="10"
                  className="w-full px-4 py-2 text-sm bg-white border border-[#DDE9DC] rounded-xl font-mono uppercase"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-center gap-2">
                <ShieldCheck size={16} className="text-amber-700 shrink-0" />
                <span>Eligible for 50% deduction under Section 80G of the Indian IT Act.</span>
              </div>

              <button
                type="submit"
                disabled={paying}
                className="w-full py-3.5 bg-[#164B38] hover:bg-[#103B2D] text-white rounded-xl font-semibold shadow-md transition-all"
              >
                {paying ? 'Processing Payment...' : `Complete Razorpay Payment of ₹${monetaryAmount}`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
