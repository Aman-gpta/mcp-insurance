# MCP Insurance Server

A Node.js/Express server that acts as a Model Context Protocol (MCP) server for insurance operations using the OpenKoda API.

## Features

- **Policy Management**: Create, retrieve, and list insurance policies
- **Client Integration**: List all policies for specific clients  
- **OpenKoda API Integration**: Seamless connection to OpenKoda platform
- **Type Safety**: Full TypeScript support with Zod schema validation
- **Error Handling**: Comprehensive error handling and validation
- **Mock Mode**: Complete testing mode when OpenKoda server is not available
- **MCP Protocol**: Full Model Context Protocol server implementation

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

5. **Start MCP server** (in a separate terminal)
   ```bash
   npm run mcp-server
   ```

## API Endpoints

### Health Check
- `GET /` - Basic server status
- `GET /health` - Detailed health information

### Policy Operations
- `POST /policies/details` - Get policy details by ID
- `POST /policies/create` - Create a new policy
- `GET /policies/client/:clientId` - List all policies for a client

## MCP Tools

The MCP server provides the following tools:

1. **create_insurance_policy** - Create a new insurance policy
2. **get_policy_details** - Retrieve details of an existing policy
3. **list_client_policies** - List all policies for a specific client

## Environment Variables

Create a `.env` file in the `backend` directory:

```env
OPENKODA_API_KEY=your_api_key_here
OPENKODA_API_BASE_URL=http://localhost:8080/api/v2
MOCK_MODE=true
PORT=3000
```

## Testing

### Test Backend API
```bash
# Create a policy
curl -X POST http://localhost:3000/policies/create \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "CLIENT123",
    "policyType": "AUTO",
    "startDate": "2025-07-12T00:00:00Z",
    "endDate": "2026-07-12T00:00:00Z",
    "premiumAmount": 1200.50
  }'

# Get policy details
curl -X POST http://localhost:3000/policies/details \
  -H "Content-Type: application/json" \
  -d '{"policyId": "POL-1752332808164"}'

# List client policies
curl http://localhost:3000/policies/client/CLIENT123

# Health check
curl http://localhost:3000/health
```

### Test MCP Server
```bash
# Run the MCP server test
node test-mcp.js
```

## Mock Mode

When `MOCK_MODE=true` is set in the environment, the server operates in mock mode:

- **Policy Creation**: Creates mock policies with generated IDs
- **Policy Retrieval**: Returns mock policies from in-memory storage
- **Client Policy Listing**: Returns all mock policies for the specified client
- **No External Dependencies**: Works without OpenKoda API connection

This is perfect for development and testing without requiring the actual OpenKoda server.

## Project Structure

```
mcp-insurance/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── index.ts        # Main server file
│   │   ├── tools.ts        # Business logic functions
│   │   ├── schemas.ts      # Zod validation schemas
│   │   └── openkoda.ts     # OpenKoda API client
│   ├── package.json
│   └── .env               # Environment configuration
├── mcp-server.ts          # MCP protocol server
├── test-mcp.js           # MCP server test script
└── package.json          # Root package configuration
```

## Technology Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Validation**: Zod for schema validation
- **HTTP Client**: Axios for API requests
- **Development**: tsx for hot reloading
- **MCP**: Model Context Protocol SDK
- **Testing**: Mock mode for offline development

## Development

### Running in Development Mode
```bash
# Terminal 1: Start backend server
cd backend && npm run dev

# Terminal 2: Start MCP server
npm run mcp-server
```

### Building for Production
```bash
npm run build
npm start
```

## License

ISC
