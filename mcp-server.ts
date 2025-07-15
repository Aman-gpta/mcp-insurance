#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import axios from 'axios';

// Gemini specific imports
import {
  GoogleGenerativeAI,
  FunctionDeclarationSchemaType,
  FunctionDeclaration,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';
import bodyParser from 'body-parser';
import express from 'express';
import cors from 'cors';

// Import our existing schemas and functions
import { getPolicyDetailsSchema, createPolicySchema, listClientPoliciesSchema } from './backend/src/schemas.js';
import { getPolicyDetails, createPolicy, listClientPolicies } from './backend/src/tools.js';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 8082;

// Gemini API setup
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  // Don't throw error, just log it, as this server might be used for Claude only
  console.log(
    'GEMINI_API_KEY is not defined. The Gemini chat endpoint will not work.'
  );
}

const genAI = new GoogleGenerativeAI(geminiApiKey || '');
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-pro',
  systemInstruction: "You are a helpful insurance assistant. When you have enough information to use a tool to answer a user's question, use it directly without asking for permission. Just provide the answer.",
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
  ],
});

// Define the tools for Gemini from existing functions
const tools: FunctionDeclaration[] = [
  {
    name: 'createPolicy',
    description: 'Create a new insurance policy for a client',
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        clientId: { type: FunctionDeclarationSchemaType.STRING },
        policyType: { type: FunctionDeclarationSchemaType.STRING },
        startDate: { type: FunctionDeclarationSchemaType.STRING },
        endDate: { type: FunctionDeclarationSchemaType.STRING },
        premiumAmount: { type: FunctionDeclarationSchemaType.NUMBER },
      },
      required: ['clientId', 'policyType', 'startDate', 'endDate', 'premiumAmount'],
    },
  },
  {
    name: 'getPolicyDetails',
    description: 'Retrieve details of an existing insurance policy',
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        policyId: { type: FunctionDeclarationSchemaType.STRING },
      },
      required: ['policyId'],
    },
  },
  {
    name: 'listClientPolicies',
    description: 'Lists all insurance policies for the currently authenticated user. The user\'s client ID is automatically determined by the system.',
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {},
      required: [],
    },
  },
];


app.post('/api/chat', async (req, res) => {
  if (!geminiApiKey) {
    return res.status(500).json({ error: 'Gemini API key is not configured on the server.' });
  }

  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const chat = model.startChat({
      history: history || [],
      tools: [{ functionDeclarations: tools }],
    });

    const result = await chat.sendMessage(message);
    const call = result.response.functionCalls()?.[0];

    if (call) {
      let apiResult;
      const args = call.args as any;
      // Call the tool
      if (call.name === 'createPolicy') {
        apiResult = await createPolicy(args);
      } else if (call.name === 'getPolicyDetails') {
        apiResult = await getPolicyDetails(args);
      } else if (call.name === 'listClientPolicies') {
        apiResult = await listClientPolicies();
      } else {
        apiResult = { error: 'Unknown tool called by the model' };
      }

      // Send the result back to the model
      const result2 = await chat.sendMessage(
        JSON.stringify([
          {
            functionResponse: {
              name: call.name,
              response: apiResult ,
            },
          },
        ])
      );
      
      // Send the model's response to the client
      res.json({ response: result2.response.text() });
    } else {
      // If no tool is called, just send the text response
      res.json({ response: result.response.text() });
    }
  } catch (error) {
    console.error('Gemini chat error:', error);
    res.status(500).json({ error: 'Failed to communicate with Gemini' });
  }
});


class InsuranceMCPServer {
  private server: Server;
  private apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl = process.env.INSURANCE_API_URL || 'http://localhost:3001';
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

// Start the express server for Gemini requests
app.listen(PORT, () => {
  console.log(`HTTP server listening on port ${PORT}`);
});
