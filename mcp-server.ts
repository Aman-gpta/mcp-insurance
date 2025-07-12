#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import axios from 'axios';

// Import our existing schemas and functions
import { getPolicyDetailsSchema, createPolicySchema, listClientPoliciesSchema } from './schemas.js';

class InsuranceMCPServer {
  private server: Server;
  private apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl = process.env.INSURANCE_API_URL || 'http://localhost:3000';
    this.server = new Server(
      {
        name: 'insurance-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'create_insurance_policy',
            description: 'Create a new insurance policy for a client',
            inputSchema: {
              type: 'object',
              properties: {
                clientId: {
                  type: 'string',
                  description: 'Unique identifier for the client'
                },
                policyType: {
                  type: 'string',
                  description: 'Type of insurance policy (AUTO, HOME, LIFE, etc.)'
                },
                startDate: {
                  type: 'string',
                  description: 'Policy start date in ISO format'
                },
                endDate: {
                  type: 'string',
                  description: 'Policy end date in ISO format'
                },
                premiumAmount: {
                  type: 'number',
                  description: 'Monthly premium amount in dollars'
                }
              },
              required: ['clientId', 'policyType', 'startDate', 'endDate', 'premiumAmount']
            }
          },
          {
            name: 'get_policy_details',
            description: 'Retrieve details of an existing insurance policy',
            inputSchema: {
              type: 'object',
              properties: {
                policyId: {
                  type: 'string',
                  description: 'Unique identifier for the insurance policy'
                }
              },
              required: ['policyId']
            }
          },
          {
            name: 'list_client_policies',
            description: 'List all insurance policies for a specific client',
            inputSchema: {
              type: 'object',
              properties: {
                clientId: {
                  type: 'string',
                  description: 'Unique identifier for the client'
                }
              },
              required: ['clientId']
            }
          }
        ]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'create_insurance_policy':
            return await this.createPolicy(args);
          
          case 'get_policy_details':
            return await this.getPolicyDetails(args);
          
          case 'list_client_policies':
            return await this.listClientPolicies(args);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    });
  }

  private async createPolicy(args: any) {
    const response = await axios.post(`${this.apiBaseUrl}/policies/create`, args, {
      headers: { 'Content-Type': 'application/json' }
    });

    return {
      content: [
        {
          type: 'text',
          text: `Policy created successfully!\n\n${JSON.stringify(response.data, null, 2)}`
        }
      ]
    };
  }

  private async getPolicyDetails(args: any) {
    const response = await axios.post(`${this.apiBaseUrl}/policies/details`, args, {
      headers: { 'Content-Type': 'application/json' }
    });

    return {
      content: [
        {
          type: 'text',
          text: `Policy details:\n\n${JSON.stringify(response.data, null, 2)}`
        }
      ]
    };
  }

  private async listClientPolicies(args: any) {
    const response = await axios.get(`${this.apiBaseUrl}/policies/client/${args.clientId}`);

    return {
      content: [
        {
          type: 'text',
          text: `Client policies:\n\n${JSON.stringify(response.data, null, 2)}`
        }
      ]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Insurance MCP server running on stdio');
  }
}

const server = new InsuranceMCPServer();
server.run().catch(console.error);
