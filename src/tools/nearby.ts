import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { Location } from '../types/bvg.js';
import { bvgApi, parseCoordinates } from '../utils/api.js';

/**
 * Schema for nearby locations search parameters
 */
export const NearbyLocationsSchema = z.object({
  coordinates: z.string().describe('Coordinates in "latitude,longitude" format (e.g., "52.5200,13.4050")'),
  results: z.number().min(1).max(100).default(8).describe('Maximum number of results to return'),
  distance: z.number().min(1).max(10000).default(1000).describe('Search radius in meters'),
  stops: z.boolean().default(true).describe('Include stops in search'),
  poi: z.boolean().default(false).describe('Include points of interest in search'),
  linesOfStops: z.boolean().default(false).describe('Include lines that serve returned stops'),
  language: z.enum(['de', 'en']).default('en').describe('Language for results')
});

export type NearbyLocationsParams = z.infer<typeof NearbyLocationsSchema>;

/**
 * MCP tool for finding nearby locations
 */
export const nearbyLocationsTool: Tool = {
  name: 'bvg_locations_nearby',
  description: 'Find nearby stops and points of interest by coordinates in Berlin',
  inputSchema: {
    type: 'object',
    properties: {
      coordinates: {
        type: 'string',
        description: 'Coordinates in "latitude,longitude" format (e.g., "52.5200,13.4050")',
        pattern: '^-?\\d+\\.\\d+,-?\\d+\\.\\d+$'
      },
      results: {
        type: 'number',
        description: 'Maximum number of results to return (1-100)',
        minimum: 1,
        maximum: 100,
        default: 8
      },
      distance: {
        type: 'number',
        description: 'Search radius in meters (1-10000)',
        minimum: 1,
        maximum: 10000,
        default: 1000
      },
      stops: {
        type: 'boolean',
        description: 'Include stops in search',
        default: true
      },
      poi: {
        type: 'boolean',
        description: 'Include points of interest in search',
        default: false
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
    required: ['coordinates']
  }
};

/**
 * Execute nearby locations search
 */
export async function executeNearbyLocations(params: NearbyLocationsParams): Promise<Location[]> {
  const { latitude, longitude } = parseCoordinates(params.coordinates);

  const queryParams = {
    latitude: latitude,
    longitude: longitude,
    results: params.results,
    distance: params.distance,
    stops: params.stops,
    poi: params.poi,
    linesOfStops: params.linesOfStops,
    language: params.language
  };

  try {
    const response = await bvgApi.get<Location[]>('/locations/nearby', queryParams);
    return response;
  } catch (error) {
    throw new Error(`Failed to find nearby locations: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
