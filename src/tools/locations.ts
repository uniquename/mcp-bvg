import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { Location } from '../types/bvg.js';
import { bvgApi } from '../utils/api.js';

/**
 * Schema for locations search parameters
 */
export const LocationsSearchSchema = z.object({
  query: z.string().min(1).describe('Search query for locations (stops, addresses, POIs)'),
  results: z.number().min(1).max(100).default(10).describe('Maximum number of results to return'),
  addresses: z.boolean().default(true).describe('Include addresses in search'),
  poi: z.boolean().default(true).describe('Include points of interest in search'),
  linesOfStops: z.boolean().default(false).describe('Include lines that serve returned stops'),
  language: z.enum(['de', 'en']).default('en').describe('Language for results')
});

export type LocationsSearchParams = z.infer<typeof LocationsSearchSchema>;

/**
 * MCP tool for searching locations
 */
export const locationsSearchTool: Tool = {
  name: 'bvg_locations_search',
  description: 'Search for stops, addresses, and points of interest in Berlin using the BVG API. Use this tool to find stop IDs by station name for other tools that require stopId parameters.',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query for locations (stops, addresses, POIs)',
        minLength: 1
      },
      results: {
        type: 'number',
        description: 'Maximum number of results to return (1-100)',
        minimum: 1,
        maximum: 100,
        default: 10
      },
      addresses: {
        type: 'boolean',
        description: 'Include addresses in search',
        default: true
      },
      poi: {
        type: 'boolean',
        description: 'Include points of interest in search',
        default: true
      },
      linesOfStops: {
        type: 'boolean',
        description: 'Include lines that serve returned stops',
        default: false
      },
      language: {
        type: 'string',
        enum: ['de', 'en'],
        description: 'Language for results',
        default: 'en'
      }
    },
    required: ['query']
  }
};

/**
 * Execute locations search
 */
export async function executeLocationsSearch(params: LocationsSearchParams): Promise<Location[]> {
  const queryParams = {
    query: params.query,
    results: params.results,
    addresses: params.addresses,
    poi: params.poi,
    linesOfStops: params.linesOfStops,
    language: params.language
  };

  try {
    const response = await bvgApi.get<Location[]>('/locations', queryParams);
    return response;
  } catch (error) {
    throw new Error(`Failed to search locations: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
