import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { Trip, RadarResult } from '../types/bvg.js';
import { bvgApi } from '../utils/api.js';
import { createMcpTool } from '../utils/schema.js';

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
export const tripDetailsTool: Tool = createMcpTool(
  'bvg_trip_details',
  'Get detailed information about a specific trip by ID',
  TripDetailsSchema
);

/**
 * MCP tool for radar search
 */
export const radarTool: Tool = createMcpTool(
  'bvg_radar',
  'Find vehicles in a geographic area with movement data',
  RadarSchema
);

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
