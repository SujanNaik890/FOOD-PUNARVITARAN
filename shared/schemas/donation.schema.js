import { z } from 'zod';
import { AddressSchema, CoordinatesSchema } from './auth.schema.js';

export const FoodCategorySchema = z.enum([
  'COOKED_MEALS',
  'RAW_RATION',
  'PACKAGED_FOOD',
  'BAKERY_DAIRY'
]);

export const DietaryTypeSchema = z.enum(['VEG', 'NON_VEG', 'VEGAN']);

export const StorageConditionSchema = z.enum(['AMBIENT', 'REFRIGERATED', 'HEATED']);

export const FoodItemSchema = z.object({
  name: z.string().min(2, 'Item name is required'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unit: z.enum(['KG', 'PORTIONS', 'PACKETS', 'LITERS']),
  preparedAt: z.coerce.date().optional()
});

export const DonationStatusSchema = z.enum([
  'DRAFT',
  'SUBMITTED',
  'VALIDATED',
  'REJECTED',
  'MATCHING',
  'ALLOCATED_PENDING_APPROVAL',
  'NGO_NOTIFIED',
  'NGO_ACCEPTED',
  'VEHICLE_ASSIGNED',
  'PICKUP_IN_PROGRESS',
  'FOOD_COLLECTED',
  'IN_TRANSIT',
  'ARRIVED_AT_DESTINATION',
  'DELIVERED_CONFIRMED',
  'CLOSED',
  'CANCELLED'
]);

export const CreateDonationSchema = z.object({
  foodCategory: FoodCategorySchema,
  dietaryType: DietaryTypeSchema,
  foodItems: z.array(FoodItemSchema).min(1, 'At least one food item must be added'),
  perishable: z.boolean().default(true),
  consumptionDeadline: z.coerce.date().refine((date) => date > new Date(), {
    message: 'Consumption deadline must be in the future'
  }),
  storageCondition: StorageConditionSchema.default('AMBIENT'),
  pickupAddress: AddressSchema.extend({
    contactPerson: z.string().min(2, 'Contact person name is required'),
    contactPhone: z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit Indian mobile number required')
  }),
  pickupCoordinates: CoordinatesSchema,
  notes: z.string().max(500).optional()
});

export const AllocationApprovalSchema = z.object({
  donationId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId'),
  selectedNgoId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId'),
  allocationNotes: z.string().max(500).optional()
});

export const NGOResponseSchema = z.object({
  allocationId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId'),
  action: z.enum(['ACCEPT', 'REJECT']),
  reason: z.string().max(500).optional()
});
