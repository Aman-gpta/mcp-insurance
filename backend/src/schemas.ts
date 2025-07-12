// src/schemas.ts

import { z } from 'zod';

/**
 * Schema for validating the input for fetching policy details.
 * Requires a non-empty string for the policy ID.
 */
export const getPolicyDetailsSchema = z.object({
  policyId: z.string().min(1, { message: "Policy ID cannot be empty." }),
});

/**
 * Schema for validating the input for creating a new policy.
 * All fields are required.
 */
export const createPolicySchema = z.object({
  clientId: z.string().min(1, { message: "Client ID cannot be empty." }),
  policyType: z.string().min(1, { message: "Policy type cannot be empty." }),
  startDate: z.string().datetime({ message: "Invalid start date format." }),
  endDate: z.string().datetime({ message: "Invalid end date format." }),
  premiumAmount: z.number().positive({ message: "Premium amount must be a positive number." }),
});

/**
 * Schema for validating the input for listing policies for a client.
 * Requires a non-empty string for the client ID.
 */
export const listClientPoliciesSchema = z.object({
  clientId: z.string().min(1, { message: "Client ID cannot be empty." }),
});

/**
 * Schema for policy response data
 */
export const policyResponseSchema = z.object({
  policyId: z.string(),
  clientId: z.string(),
  policyType: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  premiumAmount: z.number(),
  status: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

/**
 * Schema for error responses
 */
export const errorResponseSchema = z.object({
  error: z.string(),
  details: z.any().optional(),
  message: z.string().optional(),
});