# Claude Integration Setup

This guide explains how to connect your MCP Insurance server with Claude Desktop so Claude can buy insurance policies for you.

## Prerequisites

1. **Claude Desktop**: Download and install Claude Desktop from Anthropic
2. **Node.js**: Ensure you have Node.js 18+ installed
3. **Your Insurance Server**: Must be running on `localhost:3000`

## Setup Steps

### 1. Install Dependencies
```bash
cd "d:/mcp insurance"
npm install
```

### 2. Start Your Insurance Server
```bash
# Terminal 1: Start the insurance API server
npm run dev
```

### 3. Configure Claude Desktop

**For Windows:**
1. Open file explorer and navigate to: `%APPDATA%\Claude\`
2. Create or edit the file `claude_desktop_config.json`
3. Copy the content from `claude_desktop_config.json` in this project

**For macOS:**
1. Open Finder and navigate to: `~/Library/Application Support/Claude/`
2. Create or edit the file `claude_desktop_config.json`
3. Copy the content from `claude_desktop_config.json` in this project

### 4. Test the Integration

1. **Restart Claude Desktop** completely
2. Start a new conversation
3. Ask Claude something like:

```
"Hi! I'd like to buy an auto insurance policy. Can you help me create one with these details:
- Client ID: CLIENT123
- Policy Type: AUTO
- Start Date: 2025-07-12
- End Date: 2026-07-12
- Premium Amount: $1200.50"
```

Claude should now be able to:
- ✅ Create insurance policies
- ✅ Look up existing policy details
- ✅ List all policies for a client
- ✅ Handle errors and validation

## Example Conversations with Claude

### Buy a New Policy
```
You: "I need a home insurance policy for client HOME123, starting today for one year, with $1500 monthly premium"

Claude: "I'll help you create a home insurance policy. Let me process this for you..."
[Claude will use the create_insurance_policy tool]
```

### Check Existing Policies
```
You: "Can you show me all policies for client CLIENT123?"

Claude: "I'll look up all policies for that client..."
[Claude will use the list_client_policies tool]
```

### Get Policy Details
```
You: "What are the details of policy POL-12345?"

Claude: "Let me retrieve the details for that policy..."
[Claude will use the get_policy_details tool]
```

## Troubleshooting

1. **Claude can't see the tools**: Restart Claude Desktop completely
2. **Connection errors**: Make sure your insurance server is running on port 3000
3. **Permission errors**: Check that the file paths in the config are correct
4. **Tool not working**: Check the terminal where your insurance server is running for error messages

## Mock Mode

If you don't have OpenKoda running, make sure `MOCK_MODE=true` is set in your `backend/.env` file. This allows Claude to create policies using mock data for testing.
