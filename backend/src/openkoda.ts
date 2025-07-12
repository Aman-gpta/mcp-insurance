// src/openkoda.ts

import axios from 'axios';

/**
 * Ensure the OPENKODA_API_KEY and OPENKODA_API_BASE_URL environment variables are set.
 */
const OPENKODA_API_BASE_URL = process.env.OPENKODA_API_BASE_URL;
const API_KEY = process.env.OPENKODA_API_KEY;

if (!API_KEY || !OPENKODA_API_BASE_URL) {
  console.error(
    'FATAL ERROR: Make sure OPENKODA_API_KEY and OPENKODA_API_BASE_URL are set in your .env file.'
  );
  process.exit(1);
}

/**
 * An instance of axios configured for the Openkoda API.
 * It includes the base URL and sets the api-token header
 * with the API key for all requests.
 */
const openkodaApi = axios.create({
  baseURL: OPENKODA_API_BASE_URL,
  headers: {
    'api-token': API_KEY,
    'Content-Type': 'application/json',
  },
});

export default openkodaApi; 