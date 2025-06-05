import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { Journey } from '../types/bvg.js';
import { bvgApi } from '../utils/api.js';

/**
 * Schema for journey planning parameters
 */
export const JourneyPlanSchema = z.object({
  from: z.string().min(1).describe('Origin location (stop ID, address, or coordinates - use bvg_locations_search to find stop IDs by station name)'),
  to: z.string().min(1).describe('Destination location (stop ID, address, or coordinates - use bvg_locations_search to find stop IDs by station name)'),
  via: z.string().optional().describe('Via location (stop ID, address, or coordinates - use bvg_locations_search to find stop IDs by station name)'),
  departure: z.string().optional().describe('Departure time in ISO format (default: now)'),
  arrival: z.string().optional().describe('Arrival time in ISO format (alternative to departure)'),
  results: z.number().min(1).max(6).default(3).describe('Number of journey alternatives'),
  stopovers: z.boolean().default(false).describe('Include stopovers for each journey leg'),
  transfers: z.number().min(-1).max(10).default(-1).describe('Maximum number of transfers (-1 for unlimited)'),
  transferTime: z.number().min(0).max(60).default(0).describe('Minimum transfer time in minutes'),
  accessibility: z.enum(['partial', 'complete']).optional().describe('Accessibility requirements'),
  bike: z.boolean().default(false).describe('Allow taking a bike'),
  walkingSpeed: z.enum(['slow', 'normal', 'fast']).default('normal').describe('Walking speed preference'),
  startWithWalking: z.boolean().default(true).describe('Allow walking to first stop'),
  endWithWalking: z.boolean().default(true).describe('Allow walking from last stop'),
  language: z.enum(['de', 'en']).default('en').describe('Language for results')
});

export type JourneyPlanParams = z.infer<typeof JourneyPlanSchema>;

/**
 * MCP tool for journey planning
 */
export const journeyPlanTool: Tool = {
  name: 'bvg_journey_plan',
  description: 'Plan journeys from A to B using Berlin public transport',
  inputSchema: {
    type: 'object',
    properties: {
      from: {
        type: 'string',
        description: 'Origin location (stop ID, address, or coordinates - use bvg_locations_search to find stop IDs by station name)',
        minLength: 1
      },
      to: {
        type: 'string',
        description: 'Destination location (stop ID, address, or coordinates - use bvg_locations_search to find stop IDs by station name)',
        minLength: 1
      },
      via: {
        type: 'string',
        description: 'Via location (stop ID, address, or coordinates - use bvg_locations_search to find stop IDs by station name)'
      },
      departure: {
        type: 'string',
        description: 'Departure time in ISO format (default: now)',
        format: 'date-time'
      },
      arrival: {
        type: 'string',
        description: 'Arrival time in ISO format (alternative to departure)',
        format: 'date-time'
      },
      results: {
        type: 'number',
        description: 'Number of journey alternatives (1-6)',
        minimum: 1,
        maximum: 6,
        default: 3
      },
      stopovers: {
        type: 'boolean',
        description: 'Include stopovers for each journey leg',
        default: false
      },
      transfers: {
        type: 'number',
        description: 'Maximum number of transfers (-1 for unlimited)',
        minimum: -1,
        maximum: 10,
        default: -1
      },
      transferTime: {
        type: 'number',
        description: 'Minimum transfer time in minutes (0-60)',
        minimum: 0,
        maximum: 60,
        default: 0
      },
      accessibility: {
        type: 'string',
        enum: ['partial', 'complete'],
        description: 'Accessibility requirements'
      },
      bike: {
        type: 'boolean',
        description: 'Allow taking a bike',
        default: false
      },
      walkingSpeed: {
        type: 'string',
        enum: ['slow', 'normal', 'fast'],
        description: 'Walking speed preference',
        default: 'normal'
      },
      startWithWalking: {
        type: 'boolean',
        description: 'Allow walking to first stop',
        default: true
      },
      endWithWalking: {
        type: 'boolean',
        description: 'Allow walking from last stop',
        default: true
      },
      language: {
        type: 'string',
        enum: ['de', 'en'],
        description: 'Language for results',
        default: 'en'
      }
    },
    required: ['from', 'to']
  }
};

/**
 * Execute journey planning
 */
export async function executeJourneyPlan(params: JourneyPlanParams): Promise<Journey[]> {
  // Validate that both departure and arrival are not set at the same time
  if (params.departure && params.arrival) {
    throw new Error('Cannot specify both departure and arrival time. Choose one.');
  }

  const queryParams: Record<string, any> = {
    from: params.from,
    to: params.to,
    results: params.results,
    stopovers: params.stopovers,
    transfers: params.transfers,
    transferTime: params.transferTime,
    bike: params.bike,
    walkingSpeed: params.walkingSpeed,
    startWithWalking: params.startWithWalking,
    endWithWalking: params.endWithWalking,
    language: params.language
  };

  // Add optional parameters
  if (params.via) queryParams.via = params.via;
  if (params.departure) queryParams.departure = params.departure;
  if (params.arrival) queryParams.arrival = params.arrival;
  if (params.accessibility) queryParams.accessibility = params.accessibility;

  try {
    const response = await bvgApi.get<{ journeys: Journey[] }>('/journeys', queryParams);
    return response.journeys;
  } catch (error) {
    throw new Error(`Failed to plan journey: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
