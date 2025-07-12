// src/index.ts

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import {
  getPolicyDetails,
  createPolicy,
  listClientPolicies,
  checkApiHealth,
} from './tools';

// Create the Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies

const port = process.env.PORT || 3000;

/**
 * A healthy-check endpoint.
 */
app.get('/', (req, res) => {
  res.send('Openkoda Insurance MCP Server is running!');
});

/**
 * Endpoint to fetch policy details.
 * Expects a JSON body with a "policyId".
 */
app.post('/policies/details', async (req, res) => {
  try {
    const result = await getPolicyDetails(req.body);
    if (result.error) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (error) {
    console.error('Error in /policies/details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Endpoint to create a new insurance policy.
 * Expects a JSON body with the policy data.
 */
app.post('/policies/create', async (req, res) => {
  try {
    const result = await createPolicy(req.body);
    if (result.error) {
      return res.status(400).json(result);
    }
    res.status(201).json(result);
  } catch (error) {
    console.error('Error in /policies/create:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Endpoint to list all policies for a client.
 * Expects the "clientId" as a URL parameter.
 */
app.get('/policies/client/:clientId', async (req, res) => {
  try {
    const result = await listClientPolicies({ clientId: req.params.clientId });
    if (result.error) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (error) {
    console.error('Error in /policies/client/:clientId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Health check endpoint with more detailed information
 */
app.get('/health', async (req, res) => {
  try {
    const apiHealth = await checkApiHealth();
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      api: apiHealth
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Service unavailable'
    });
  }
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