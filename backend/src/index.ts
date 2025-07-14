// src/index.ts

import 'dotenv/config';
import express from 'express';
import cors from 'cors';

// Create the Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies

const port = 3001;

// --- MOCK DATA ---
const mockPolicies = {
  'user-12345': [
    { policyId: 'pol-001', clientId: 'user-12345', policyType: 'AUTO', premiumAmount: 150.75, status: 'ACTIVE', startDate: '2024-01-15', endDate: '2025-01-14' },
    { policyId: 'pol-002', clientId: 'user-12345', policyType: 'HOME', premiumAmount: 320.50, status: 'ACTIVE', startDate: '2023-06-20', endDate: '2024-06-19' },
  ],
};

let policyCounter = 3;

/**
 * A healthy-check endpoint.
 */
app.get('/', (req, res) => {
  res.send('Openkoda Insurance MCP Mock Server is running!');
});

/**
 * Endpoint to fetch policy details.
 */
app.post('/policies/details', async (req, res) => {
  const { policyId } = req.body;
  const allPolicies = Object.values(mockPolicies).flat();
  const policy = allPolicies.find(p => p.policyId === policyId);

  if (policy) {
    res.json(policy);
  } else {
    res.status(404).json({ error: 'Policy not found' });
  }
});

/**
 * Endpoint to create a new insurance policy.
 */
app.post('/policies/create', async (req, res) => {
  const { clientId, ...policyData } = req.body;
  const newPolicyId = `pol-${String(policyCounter++).padStart(3, '0')}`;
  const newPolicy = {
    policyId: newPolicyId,
    clientId,
    ...policyData,
    status: 'ACTIVE',
  };

  if (!mockPolicies[clientId]) {
    mockPolicies[clientId] = [];
  }
  mockPolicies[clientId].push(newPolicy);

  res.status(201).json(newPolicy);
});

/**
 * Endpoint to list all policies for a client.
 */
app.get('/policies/client/:clientId', async (req, res) => {
  const { clientId } = req.params;
  const policies = mockPolicies[clientId];

  if (policies) {
    res.json(policies);
  } else {
    // Return empty array if client has no policies
    res.json([]);
  }
});

/**
 * Health check endpoint with more detailed information
 */
app.get('/health', async (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0-mock',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
  console.log(`Open http://localhost:${port} to see the status.`);
});