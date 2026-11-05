import { User } from '../models/User.js';
import { DonorProfile } from '../models/DonorProfile.js';
import { NGOProfile } from '../models/NGOProfile.js';
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
