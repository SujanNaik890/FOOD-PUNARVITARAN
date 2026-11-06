import { z } from 'zod';

export const UserRoleSchema = z.enum(['ADMIN', 'DONOR', 'NGO_MANAGER']);

export const CoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180)
});

export const AddressSchema = z.object({
  line1: z.string().min(5, 'Address line 1 must be at least 5 characters'),
  area: z.string().min(2, 'Area/Locality is required'),
  city: z.string().default('Bengaluru'),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, 'Invalid Indian 6-digit PIN code')
});

export const RegisterUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Valid email address required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Phone must be a valid 10-digit Indian mobile number starting with 6-9'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must include at least one uppercase letter (A-Z)')
    .regex(/[a-z]/, 'Password must include at least one lowercase letter (a-z)')
    .regex(/[0-9]/, 'Password must include at least one number (0-9)')
    .regex(/[^A-Za-z0-9]/, 'Password must include at least one special character (e.g. !, @, #, $, %, &, *)'),
  role: UserRoleSchema,
  
  // Specific role metadata
  donorType: z.enum(['INDIVIDUAL', 'RESTAURANT', 'HOTEL', 'MARRIAGE_HALL', 'CORPORATE']).optional(),
  organizationName: z.string().optional(),
  fssaiLicenseNumber: z.string().optional(),
  
  ngoName: z.string().optional(),
  registrationNumber: z.string().optional(),
  address: AddressSchema.optional(),
  coordinates: CoordinatesSchema.optional()
}).refine((data) => {
  if (data.role === 'DONOR' && !data.donorType) {
    return false;
  }
  if (data.role === 'NGO_MANAGER' && (!data.ngoName || !data.registrationNumber)) {
    return false;
  }
  return true;
}, {
  message: 'Missing required profile fields for the selected role',
  path: ['role']
});

export const LoginSchema = z.object({
  identifier: z.string().min(3, 'Email or Phone is required'),
  password: z.string().min(1, 'Password is required')
});

export const RequestOtpSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit Indian mobile number required'),
  purpose: z.enum(['REGISTRATION', 'LOGIN', 'PASSWORD_RESET', 'DELIVERY_HANDOVER'])
});

export const VerifyOtpSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit Indian mobile number required'),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be exactly 6 digits'),
  purpose: z.enum(['REGISTRATION', 'LOGIN', 'PASSWORD_RESET', 'DELIVERY_HANDOVER'])
});

export const ForgotPasswordSchema = z.object({
  identifier: z.string().min(3, 'Email or phone number is required')
});

export const ResetPasswordSchema = z.object({
  identifier: z.string().min(3, 'Email or phone number is required'),
  resetToken: z.string().min(10, 'Reset token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must include at least one uppercase letter (A-Z)')
    .regex(/[a-z]/, 'Password must include at least one lowercase letter (a-z)')
    .regex(/[0-9]/, 'Password must include at least one number (0-9)')
    .regex(/[^A-Za-z0-9]/, 'Password must include at least one special character (e.g. !, @, #, $, %, &, *)')
});
