import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

/**
 * Convert a Zod schema to a JSON schema compatible with MCP Tool inputSchema
 */
export function zodToMcpSchema(zodSchema: z.ZodSchema): any {
  const jsonSchema = zodToJsonSchema(zodSchema, { target: 'jsonSchema7' });

  // Remove the $schema property as it's not needed for MCP tools
  const { $schema, ...mcpSchema } = jsonSchema;

  return mcpSchema;
}

/**
 * Create an MCP tool with automatic schema conversion from Zod
 */
export function createMcpTool(
  name: string,
  description: string,
  zodSchema: z.ZodSchema
): Tool {
  return {
    name,
    description,
    inputSchema: zodToMcpSchema(zodSchema)
  };
}
