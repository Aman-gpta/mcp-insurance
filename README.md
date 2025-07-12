# MCP Insurance Server

A Node.js/Express server that acts as a Model Context Protocol (MCP) server for insurance operations using the OpenKoda API.

## Features

- **Policy Management**: Create, retrieve, and list insurance policies
- **Client Integration**: List all policies for specific clients  
- **OpenKoda API Integration**: Seamless connection to OpenKoda platform
- **Type Safety**: Full TypeScript support with Zod schema validation
- **Error Handling**: Comprehensive error handling and validation
- **Mock Mode**: Testing mode when OpenKoda server is not available

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd mcp-insurance
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Configure environment**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your OpenKoda API credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Health Check
- `GET /` - Basic server status
- `GET /health` - Detailed health information

### Policy Operations
- `POST /policies/details` - Get policy details by ID
- `POST /policies/create` - Create a new policy
- `GET /policies/client/:clientId` - List all policies for a client

## Environment Variables

Create a `.env` file in the `backend` directory:

```env
OPENKODA_API_KEY=your_api_key_here
OPENKODA_API_BASE_URL=http://localhost:8080/api/v2
MOCK_MODE=true
PORT=3000
```

## Testing

Test policy creation:
```bash
node -e "
const http = require('http');
const data = JSON.stringify({
  clientId: 'CLIENT123',
  policyType: 'AUTO',
  startDate: '2025-07-12T00:00:00Z',
  endDate: '2026-07-12T00:00:00Z',
  premiumAmount: 1200.50
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/policies/create',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
  });
});

req.write(data);
req.end();
"
```

## Technology Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Validation**: Zod for schema validation
- **HTTP Client**: Axios for API requests
- **Development**: tsx for hot reloading

## License

ISC
