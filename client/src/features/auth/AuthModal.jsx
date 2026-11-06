import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, ArrowRight, UserCheck, Eye, EyeOff, KeyRound, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

export function AuthModal({ isOpen, onClose, defaultRole = 'DONOR' }) {
  const { login, register, loading } = useAuth();
  const [viewMode, setViewMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [role, setRole] = useState(defaultRole);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Forgot password flow states
  const [forgotStep, setForgotStep] = useState(1); // 1: request token, 2: reset password
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    if (defaultRole) {
      setRole(defaultRole);
    }
  }, [defaultRole, isOpen]);

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [donorType, setDonorType] = useState('RESTAURANT');
  const [orgName, setOrgName] = useState('');
  const [ngoName, setNgoName] = useState('');
  const [ngoRegNo, setNgoRegNo] = useState('');

  if (!isOpen) return null;

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setResetLoading(true);

    try {
      if (forgotStep === 1) {
        const res = await axios.post('/api/v1/auth/forgot-password', {
          identifier: forgotIdentifier
        });
        setSuccessMessage(res.data.message || 'Reset code generated.');
        if (res.data.data?.resetToken) {
          setResetToken(res.data.data.resetToken);
        }
        setForgotStep(2);
      } else {
        const res = await axios.post('/api/v1/auth/reset-password', {
          identifier: forgotIdentifier,
          resetToken,
          newPassword
        });
        setSuccessMessage(res.data.message || 'Password reset successfully! Please log in.');
        setTimeout(() => {
          setViewMode('login');
          setIdentifier(forgotIdentifier);
          setPassword(newPassword);
          setForgotStep(1);
          setSuccessMessage('Password reset successfully! You can now log in.');
        }, 1200);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Failed to process request.';
      setError(msg);
    } finally {
      setResetLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (viewMode === 'login') {
      const res = await login(identifier, password);
      if (!res.success) {
        setError(res.message);
      } else {
        onClose();
      }
    } else if (viewMode === 'register') {
      const payload = {
        name,
        email,
        phone,
        password,
        role,
        ...(role === 'DONOR' && {
          donorType,
          organizationName: orgName || name
        }),
        ...(role === 'NGO_MANAGER' && {
          ngoName,
          registrationNumber: ngoRegNo
        })
      };

      const res = await register(payload);
      if (!res.success) {
        setError(res.message);
      } else {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#FAF7EF] w-full max-w-md rounded-3xl p-8 shadow-2xl border border-[#DDE9DC] relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-gray-800 text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-200/60"
        >
          &times;
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#164B38] text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            {viewMode === 'forgot' ? <KeyRound size={24} /> : <ShieldCheck size={24} />}
          </div>
          <h2 className="text-2xl font-bold font-serif-heading text-[#103B2D]">
            {viewMode === 'forgot'
              ? 'Reset Your Password'
              : viewMode === 'login'
              ? 'Welcome to Food Punarvitaran'
              : 'Create an Account'}
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            {viewMode === 'forgot'
              ? 'Recover your account access safely'
              : viewMode === 'login'
              ? 'Access your food rescue dashboard'
              : 'Join Bengaluru’s zero food-waste network'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* FORGOT PASSWORD FORM */}
        {viewMode === 'forgot' ? (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            {forgotStep === 1 ? (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Registered Email or Mobile Number
                </label>
                <input
                  type="text"
                  required
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  placeholder="name@domain.com or 9876543210"
                  className="w-full px-4 py-2 text-sm bg-white border border-[#DDE9DC] rounded-xl focus:outline-none focus:border-[#164B38]"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  We'll generate a verification reset token for your account.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Verification Reset Token
                  </label>
                  <input
                    type="text"
                    required
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="Enter reset token"
                    className="w-full px-4 py-2 text-xs font-mono bg-white border border-[#DDE9DC] rounded-xl focus:outline-none focus:border-[#164B38]"
                  />
                  <p className="text-[11px] text-emerald-700 mt-1">
                    Token pre-filled or check your email for the reset code.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-4 pr-11 py-2 text-sm bg-white border border-[#DDE9DC] rounded-xl focus:outline-none focus:border-[#164B38]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors p-1"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed bg-[#FAF7EF] p-2 rounded-lg border border-[#DDE9DC]">
                    <strong>Password requirement:</strong> At least 8 characters, with 1 uppercase, 1 lowercase, 1 number, and 1 special symbol (!@#$%&*).
                  </p>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={resetLoading}
              className="w-full py-3 bg-[#164B38] hover:bg-[#103B2D] text-white rounded-xl font-semibold shadow-md transition-all flex items-center justify-center gap-2 mt-2"
            >
              {resetLoading
                ? 'Processing...'
                : forgotStep === 1
                ? 'Send Reset Instructions'
                : 'Confirm New Password'}
              {!resetLoading && <ArrowRight size={16} />}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setViewMode('login');
                  setError('');
                  setSuccessMessage('');
                  setForgotStep(1);
                }}
                className="text-xs text-[#164B38] font-semibold hover:underline"
              >
                &larr; Back to Login
              </button>
            </div>
          </form>
        ) : (
          /* LOGIN & REGISTER FORMS */
          <form onSubmit={handleSubmit} className="space-y-4">
            {viewMode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Full Name / Representative
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-4 py-2 text-sm bg-white border border-[#DDE9DC] rounded-xl focus:outline-none focus:border-[#164B38]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Role</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('DONOR')}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                        role === 'DONOR'
                          ? 'bg-[#164B38] text-white border-[#164B38]'
                          : 'bg-white text-gray-700 border-[#DDE9DC]'
                      }`}
                    >
                      Food Donor
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('NGO_MANAGER')}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                        role === 'NGO_MANAGER'
                          ? 'bg-[#164B38] text-white border-[#164B38]'
                          : 'bg-white text-gray-700 border-[#DDE9DC]'
                      }`}
                    >
                      NGO / Shelter
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('ADMIN')}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                        role === 'ADMIN'
                          ? 'bg-[#164B38] text-white border-[#164B38]'
                          : 'bg-white text-gray-700 border-[#DDE9DC]'
                      }`}
                    >
                      Admin Staff
                    </button>
                  </div>
                </div>

                {role === 'DONOR' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Donor Type
                    </label>
                    <select
                      value={donorType}
                      onChange={(e) => setDonorType(e.target.value)}
                      className="w-full px-4 py-2 text-sm bg-white border border-[#DDE9DC] rounded-xl focus:outline-none focus:border-[#164B38]"
                    >
                      <option value="RESTAURANT">Restaurant / Cafe</option>
                      <option value="HOTEL">Hotel / Resort</option>
                      <option value="MARRIAGE_HALL">Marriage / Banquet Hall</option>
                      <option value="CORPORATE">Corporate Cafeteria</option>
                      <option value="INDIVIDUAL">Individual Household</option>
                    </select>
                  </div>
                )}

                {role === 'NGO_MANAGER' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Registered NGO Name
                      </label>
                      <input
                        type="text"
                        required
                        value={ngoName}
                        onChange={(e) => setNgoName(e.target.value)}
                        placeholder="e.g. Robin Hood Army Whitefield"
                        className="w-full px-4 py-2 text-sm bg-white border border-[#DDE9DC] rounded-xl focus:outline-none focus:border-[#164B38]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Registration / Darpan Number
                      </label>
                      <input
                        type="text"
                        required
                        value={ngoRegNo}
                        onChange={(e) => setNgoRegNo(e.target.value)}
                        placeholder="e.g. KA-2023-DARPAN-994"
                        className="w-full px-4 py-2 text-sm bg-white border border-[#DDE9DC] rounded-xl focus:outline-none focus:border-[#164B38]"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full px-4 py-2 text-sm bg-white border border-[#DDE9DC] rounded-xl focus:outline-none focus:border-[#164B38]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    10-Digit Mobile Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    pattern="[6-9][0-9]{9}"
                    className="w-full px-4 py-2 text-sm bg-white border border-[#DDE9DC] rounded-xl focus:outline-none focus:border-[#164B38]"
                  />
                </div>
              </>
            )}

            {viewMode === 'login' ? (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email or Mobile Number
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="chef@itcgardenia.com or 9876543210"
                  className="w-full px-4 py-2 text-sm bg-white border border-[#DDE9DC] rounded-xl focus:outline-none focus:border-[#164B38]"
                />
              </div>
            ) : null}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-700">Password</label>
                {viewMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('forgot');
                      setError('');
                      setSuccessMessage('');
                      if (identifier) setForgotIdentifier(identifier);
                    }}
                    className="text-[11px] font-semibold text-[#F28B45] hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-4 pr-11 py-2 text-sm bg-white border border-[#DDE9DC] rounded-xl focus:outline-none focus:border-[#164B38]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {viewMode === 'register' && (
                <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed bg-[#FAF7EF] p-2 rounded-lg border border-[#DDE9DC]">
                  <strong>Password requirement:</strong> At least 8 characters, with at least one uppercase letter (A-Z), one lowercase letter (a-z), one number (0-9), and one special character (!@#$%&*).
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#164B38] hover:bg-[#103B2D] text-white rounded-xl font-semibold shadow-md transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? 'Please wait...' : viewMode === 'login' ? 'Sign In' : 'Create Account'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        )}

        {viewMode !== 'forgot' && (
          <div className="mt-6 text-center text-xs text-gray-600">
            {viewMode === 'login' ? "Don't have an account yet?" : 'Already registered?'}
            <button
              type="button"
              onClick={() => {
                setViewMode(viewMode === 'login' ? 'register' : 'login');
                setError('');
                setSuccessMessage('');
              }}
              className="ml-1 text-[#F28B45] font-semibold hover:underline"
            >
              {viewMode === 'login' ? 'Sign Up' : 'Log In'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
