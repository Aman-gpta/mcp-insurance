#!/usr/bin/env node

const { spawn } = require('child_process');
const readline = require('readline');

// Test the MCP server by sending a tool call
async function testMCPServer() {
  console.log('Testing MCP Insurance Server...\n');
  
  const mcpProcess = spawn('node', ['mcp-server.ts'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  const rl = readline.createInterface({
    input: mcpProcess.stdout,
    terminal: false
  });
  
  let response = '';
  
  rl.on('line', (line) => {
    response += line + '\n';
  });
  
  // Send a tool call request
  const toolCall = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'create_insurance_policy',
      arguments: {
        clientId: 'TEST_CLIENT_001',
        policyType: 'HOME',
        startDate: '2025-07-12T00:00:00Z',
        endDate: '2026-07-12T00:00:00Z',
        premiumAmount: 1500.00
      }
    }
  };
  
  mcpProcess.stdin.write(JSON.stringify(toolCall) + '\n');
  
  setTimeout(() => {
    console.log('MCP Server Response:');
    console.log(response);
    mcpProcess.kill();
    process.exit(0);
  }, 2000);
}

testMCPServer().catch(console.error);