// src/tools.ts

import openkodaApi from './openkoda';
import {
  getPolicyDetailsSchema,
  createPolicySchema,
  listClientPoliciesSchema,
} from './schemas';
import { z } from 'zod';

/**
 * Fetches the details of a specific insurance policy.
 * @param input - An object containing the policyId.
 * @returns The policy details.
 */
export async function getPolicyDetails(
  input: z.infer<typeof getPolicyDetailsSchema>
) {
  try {
    const { policyId } = getPolicyDetailsSchema.parse(input);
    const response = await openkodaApi.get(`/policies/${policyId}`);
    return response.data;
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { error: 'Invalid input', details: error.errors };
    }
    return { error: 'Failed to fetch policy details', details: error.message };
  }
}

/**
 * Creates a new insurance policy.
 * @param input - An object containing the new policy data.
 * @returns The newly created policy.
 */
export async function createPolicy(
  input: z.infer<typeof createPolicySchema>
) {
  try {
    const policyData = createPolicySchema.parse(input);
    
    // Mock mode for testing (when OpenKoda server is not available)
    if (process.env.MOCK_MODE === 'true') {
      return {
        success: true,
        policy: {
          policyId: `POL-${Date.now()}`,
          ...policyData,
          status: 'active',
          createdAt: new Date().toISOString()
        }
      };
    }
    
    const response = await openkodaApi.post('/policies', policyData);
    return response.data;
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { error: 'Invalid input', details: error.errors };
    }
    return { error: 'Failed to create policy', details: error.message };
  }
}

/**
 * Lists all policies for a given client.
 * @param input - An object containing the clientId.
 * @returns A list of policies.
 */
export async function listClientPolicies(
  input: z.infer<typeof listClientPoliciesSchema>
) {
  try {
    const { clientId } = listClientPoliciesSchema.parse(input);
    const response = await openkodaApi.get('/policies', {
      params: { clientId },
    });
    return response.data;
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { error: 'Invalid input', details: error.errors };
    }
    return { error: 'Failed to list client policies', details: error.message };
  }
}

/**
 * Utility function to check API connectivity
 * @returns API status and response time
 */
export async function checkApiHealth() {
  try {
    const startTime = Date.now();
    const response = await openkodaApi.get('/health');
    const responseTime = Date.now() - startTime;

    return {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      apiResponse: response.data,
    };
  } catch (error: any) {
    return {
      status: 'unhealthy',
      error: error.message,
      details: error.response?.data || 'No additional details',
    };
  }
}