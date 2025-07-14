// src/tools.ts

import openkodaApi from './openkoda';
import {
  getPolicyDetailsSchema,
  createPolicySchema,
  listClientPoliciesSchema,
} from './schemas';
import { z } from 'zod';
import { getClientId } from './context';

/**
 * Fetches the details of a specific insurance policy from the OpenKoda API.
 */
export async function getPolicyDetails(
  input: z.infer<typeof getPolicyDetailsSchema>
) {
  try {
    const { policyId } = getPolicyDetailsSchema.parse(input);
    const response = await openkodaApi.get(`/policies/${policyId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching policy details:', error.message);
    return { error: 'Failed to fetch policy details', details: error.message };
  }
}

/**
 * Creates a new insurance policy via the OpenKoda API.
 */
export async function createPolicy(
  input: z.infer<typeof createPolicySchema>
) {
  try {
    const policyData = createPolicySchema.parse(input);
    const response = await openkodaApi.post('/policies', policyData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating policy:', error.message);
    return { error: 'Failed to create policy', details: error.message };
  }
}

/**
 * Lists all policies for a given client from the OpenKoda API.
 */
export async function listClientPolicies() {
  try {
    const clientId = getClientId(); // Automatically get the client ID
    const response = await openkodaApi.get(`/policies/client/${clientId}`);
    return response.data;
  } catch (error: any) {
    console.error('Full error object while listing client policies:', error);
    console.error('Error listing client policies:', error.message);
    return { error: 'Failed to list client policies', details: error.message };
  }
}

/**
 * Checks the health of the OpenKoda API.
 */
export async function checkApiHealth() {
  try {
    const response = await openkodaApi.get('/health');
    return { status: 'healthy', apiResponse: response.data };
  } catch (error: any) {
    console.error('API health check failed:', error.message);
    return { status: 'unhealthy', error: error.message };
  }
}