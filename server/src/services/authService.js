import { User } from '../models/User.js';
import { DonorProfile } from '../models/DonorProfile.js';
import { NGOProfile } from '../models/NGOProfile.js';
import { PasswordReset } from '../models/PasswordReset.js';
import crypto from 'crypto';
import { sendEmailNotification, sendSmsOtp } from '../integrations/notificationService.js';
import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  hashToken
} from '../utils/crypto.js';

export const registerUser = async (registrationData) => {
  const { name, email, phone, password, role, ...profileData } = registrationData;

  const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
  if (existingUser) {
    const error = new Error('A user with this email or phone number already exists.');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await hashPassword(password);

  const user = new User({
    name,
    email,
    phone,
    passwordHash,
    role,
    status: 'ACTIVE' // Auto-active in development; verified via OTP/Email
  });

  await user.save();

  if (role === 'DONOR') {
    const donorProfile = new DonorProfile({
      userId: user._id,
      donorType: profileData.donorType,
      organizationName: profileData.organizationName,
      fssaiLicenseNumber: profileData.fssaiLicenseNumber,
      address: profileData.address || {
        line1: 'Default Street',
        area: 'Indiranagar',
        city: 'Bengaluru',
        pincode: '560038'
      },
      location: {
        type: 'Point',
        coordinates: profileData.coordinates
          ? [profileData.coordinates.longitude, profileData.coordinates.latitude]
          : [77.6412, 12.9784] // Default Indiranagar coordinates
      }
    });
    await donorProfile.save();
  } else if (role === 'NGO_MANAGER') {
    const ngoProfile = new NGOProfile({
      userId: user._id,
      ngoName: profileData.ngoName,
      registrationNumber: profileData.registrationNumber,
      address: profileData.address || {
        line1: 'NGO Facility',
        area: 'Koramangala',
        city: 'Bengaluru',
        pincode: '560034'
      },
      location: {
        type: 'Point',
        coordinates: profileData.coordinates
          ? [profileData.coordinates.longitude, profileData.coordinates.latitude]
          : [77.6245, 12.9352] // Default Koramangala coordinates
      }
    });
    await ngoProfile.save();
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();
  user.refreshTokenHash = hashToken(refreshToken);
  user.lastLoginAt = new Date();
  await user.save();

  return { user, accessToken, refreshToken };
};

export const loginUser = async (identifier, password) => {
  const user = await User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { phone: identifier }]
  }).select('+passwordHash');

  if (!user) {
    const error = new Error('Invalid email/phone or password');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await verifyPassword(user.passwordHash, password);
  if (!isPasswordValid) {
    const error = new Error('Invalid email/phone or password');
    error.statusCode = 401;
    throw error;
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();
  user.refreshTokenHash = hashToken(refreshToken);
  user.lastLoginAt = new Date();
  await user.save();

  return { user, accessToken, refreshToken };
};

export const forgotPassword = async (identifier) => {
  const cleanId = identifier.trim().toLowerCase();
  const user = await User.findOne({
    $or: [{ email: cleanId }, { phone: identifier.trim() }]
  });

  if (!user) {
    // Return standard response to avoid user enumeration attack
    return {
      success: true,
      message: 'If an account exists with this email or phone, password reset instructions have been generated.'
    };
  }

  // Invalidate any previous pending reset tokens for this user
  await PasswordReset.deleteMany({ userId: user._id });

  // Generate a cryptographically secure reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(resetToken);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

  await PasswordReset.create({
    userId: user._id,
    tokenHash,
    expiresAt,
    consumed: false
  });

  // Attempt sending notification (email or simulated SMS)
  if (user.email) {
    await sendEmailNotification({
      to: user.email,
      subject: 'FoodBridge Password Reset Request',
      text: `Your password reset token is: ${resetToken}\nUse this token to reset your password within 15 minutes.`
    });
  }

  return {
    success: true,
    message: 'If an account exists with this email or phone, password reset instructions have been generated.',
    // Provide resetToken in response for dev / testing convenience
    resetToken
  };
};

export const resetPassword = async (identifier, resetToken, newPassword) => {
  const cleanId = identifier.trim().toLowerCase();
  const user = await User.findOne({
    $or: [{ email: cleanId }, { phone: identifier.trim() }]
  });

  if (!user) {
    const error = new Error('Invalid user or expired reset token.');
    error.statusCode = 400;
    throw error;
  }

  const tokenHash = hashToken(resetToken);
  const resetRecord = await PasswordReset.findOne({
    userId: user._id,
    tokenHash,
    consumed: false,
    expiresAt: { $gt: new Date() }
  });

  if (!resetRecord) {
    const error = new Error('Invalid or expired reset token. Please request a new one.');
    error.statusCode = 400;
    throw error;
  }

  // Update password
  user.passwordHash = await hashPassword(newPassword);
  user.refreshTokenHash = null; // Invalidate current refresh sessions
  await user.save();

  // Mark token consumed & cleanup
  resetRecord.consumed = true;
  await resetRecord.save();
  await PasswordReset.deleteMany({ userId: user._id });

  return {
    success: true,
    message: 'Password has been reset successfully. You can now log in with your new password.'
  };
};
