import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { Trip, RadarResult } from '../types/bvg.js';
import { bvgApi } from '../utils/api.js';

/**
 * Schema for trip details parameters
 */
export const TripDetailsSchema = z.object({
  tripId: z.string().min(1).describe('Unique identifier of the trip'),
  lineName: z.string().optional().describe('Line name for additional context'),
  stopovers: z.boolean().default(true).describe('Include stopovers for the trip'),
  polyline: z.boolean().default(false).describe('Include geographic polyline'),
  language: z.enum(['de', 'en']).default('en').describe('Language for results')
});

export type TripDetailsParams = z.infer<typeof TripDetailsSchema>;

/**
 * Schema for radar search parameters
 */
export const RadarSchema = z.object({
  north: z.number().describe('Northern boundary latitude'),
  west: z.number().describe('Western boundary longitude'),
  south: z.number().describe('Southern boundary latitude'),
  east: z.number().describe('Eastern boundary longitude'),
  results: z.number().min(1).max(256).default(256).describe('Maximum number of vehicles to return'),
  duration: z.number().min(1).max(30).default(30).describe('Compute frames for the next n seconds'),
  frames: z.number().min(1).max(20).default(3).describe('Number of frames to compute'),
  polylines: z.boolean().default(true).describe('Include polylines for vehicle movements'),
  language: z.enum(['de', 'en']).default('en').describe('Language for results')
});

export type RadarParams = z.infer<typeof RadarSchema>;

/**
 * MCP tool for getting trip details
 */
export const tripDetailsTool: Tool = {
  name: 'bvg_trip_details',
  description: 'Get detailed information about a specific trip by ID',
  inputSchema: {
    type: 'object',
    properties: {
      tripId: {
        type: 'string',
        description: 'Unique identifier of the trip',
        minLength: 1
      },
      lineName: {
        type: 'string',
        description: 'Line name for additional context'
      },
      stopovers: {
        type: 'boolean',
        description: 'Include stopovers for the trip',
        default: true
      },
      polyline: {
        type: 'boolean',
        description: 'Include geographic polyline',
        default: false
      },
      language: {
        type: 'string',
        enum: ['de', 'en'],
        description: 'Language for results',
        default: 'en'
      }
    },
    required: ['tripId']
  }
};

/**
 * MCP tool for radar search
 */
export const radarTool: Tool = {
  name: 'bvg_radar',
  description: 'Find vehicles in a geographic area with movement data',
  inputSchema: {
    type: 'object',
    properties: {
      north: {
        type: 'number',
        description: 'Northern boundary latitude'
      },
      west: {
        type: 'number',
        description: 'Western boundary longitude'
      },
      south: {
        type: 'number',
        description: 'Southern boundary latitude'
      },
      east: {
        type: 'number',
        description: 'Eastern boundary longitude'
      },
      results: {
        type: 'number',
        description: 'Maximum number of vehicles to return (1-256)',
        minimum: 1,
        maximum: 256,
        default: 256
      },
      duration: {
        type: 'number',
        description: 'Compute frames for the next n seconds (1-30)',
        minimum: 1,
        maximum: 30,
        default: 30
      },
      frames: {
        type: 'number',
        description: 'Number of frames to compute (1-20)',
        minimum: 1,
        maximum: 20,
        default: 3
      },
      polylines: {
        type: 'boolean',
        description: 'Include polylines for vehicle movements',
        default: true
      },
      language: {
        type: 'string',
        enum: ['de', 'en'],
        description: 'Language for results',
        default: 'en'
      }
    },
    required: ['north', 'west', 'south', 'east']
  }
};

/**
 * Execute trip details lookup
 */
export async function executeTripDetails(params: TripDetailsParams): Promise<Trip> {
  const queryParams: Record<string, string | number | boolean> = {
    stopovers: params.stopovers,
    polyline: params.polyline,
    language: params.language
  };

  if (params.lineName) {
    queryParams.lineName = params.lineName;
  }

  try {
    const response = await bvgApi.get<{ trip: Trip }>(`/trips/${encodeURIComponent(params.tripId)}`, queryParams);
    return response.trip;
  } catch (error) {
    throw new Error(`Failed to get trip details: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Execute radar search
 */
export async function executeRadar(params: RadarParams): Promise<RadarResult> {
  // Validate bounding box
  if (params.north <= params.south) {
    throw new Error('Northern boundary must be greater than southern boundary');
  }
  if (params.east <= params.west) {
    throw new Error('Eastern boundary must be greater than western boundary');
  }

  const queryParams = {
    north: params.north,
    west: params.west,
    south: params.south,
    east: params.east,
    results: params.results,
    duration: params.duration,
    frames: params.frames,
    polylines: params.polylines,
    language: params.language
  };

  try {
    const response = await bvgApi.get<RadarResult>('/radar', queryParams);
    return response;
  } catch (error) {
    throw new Error(`Failed to execute radar search: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
