import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { Stop, Departure, Arrival } from '../types/bvg.js';
import { bvgApi, validateStopId } from '../utils/api.js';

/**
 * Schema for stop details parameters
 */
export const StopDetailsSchema = z.object({
  stopId: z.string().min(1).describe('Unique identifier of the stop (not the station name - use bvg_locations_search to find stop IDs by station name)'),
  linesOfStops: z.boolean().default(false).describe('Include lines that serve this stop'),
  language: z.enum(['de', 'en']).default('en').describe('Language for results')
});

export type StopDetailsParams = z.infer<typeof StopDetailsSchema>;

/**
 * Schema for stop departures/arrivals parameters
 */
export const StopDeparturesSchema = z.object({
  stopId: z.string().min(1).describe('Unique identifier of the stop (not the station name - use bvg_locations_search to find stop IDs by station name)'),
  when: z.string().optional().describe('Date and time in ISO format (default: now)'),
  duration: z.number().min(1).max(1440).default(120).describe('Show departures for the next n minutes'),
  results: z.number().min(1).max(100).default(10).describe('Maximum number of results'),
  linesOfStops: z.boolean().default(false).describe('Include lines that serve this stop'),
  remarks: z.boolean().default(true).describe('Include remarks and alerts'),
  language: z.enum(['de', 'en']).default('en').describe('Language for results')
});

export type StopDeparturesParams = z.infer<typeof StopDeparturesSchema>;

/**
 * MCP tool for getting stop details
 */
export const stopDetailsTool: Tool = {
  name: 'bvg_stop_details',
  description: 'Get detailed information about a specific stop or station',
  inputSchema: {
    type: 'object',
    properties: {
      stopId: {
        type: 'string',
        description: 'Unique identifier of the stop (not the station name - use bvg_locations_search to find stop IDs by station name)',
        minLength: 1
      },
      linesOfStops: {
        type: 'boolean',
        description: 'Include lines that serve this stop',
        default: false
      },
      language: {
        type: 'string',
        enum: ['de', 'en'],
        description: 'Language for results',
        default: 'en'
      }
    },
    required: ['stopId']
  }
};

/**
 * MCP tool for getting stop departures
 */
export const stopDeparturesTool: Tool = {
  name: 'bvg_stop_departures',
  description: 'Get upcoming departures at a specific stop or station',
  inputSchema: {
    type: 'object',
    properties: {
      stopId: {
        type: 'string',
        description: 'Unique identifier of the stop (not the station name - use bvg_locations_search to find stop IDs by station name)',
        minLength: 1
      },
      when: {
        type: 'string',
        description: 'Date and time in ISO format (default: now)',
        format: 'date-time'
      },
      duration: {
        type: 'number',
        description: 'Show departures for the next n minutes (1-1440)',
        minimum: 1,
        maximum: 1440,
        default: 120
      },
      results: {
        type: 'number',
        description: 'Maximum number of results (1-100)',
        minimum: 1,
        maximum: 100,
        default: 10
      },
      linesOfStops: {
        type: 'boolean',
        description: 'Include lines that serve this stop',
        default: false
      },
      remarks: {
        type: 'boolean',
        description: 'Include remarks and alerts',
        default: true
      },
      language: {
        type: 'string',
        enum: ['de', 'en'],
        description: 'Language for results',
        default: 'en'
      }
    },
    required: ['stopId']
  }
};

/**
 * MCP tool for getting stop arrivals
 */
export const stopArrivalsTool: Tool = {
  name: 'bvg_stop_arrivals',
  description: 'Get upcoming arrivals at a specific stop or station',
  inputSchema: {
    type: 'object',
    properties: {
      stopId: {
        type: 'string',
        description: 'Unique identifier of the stop (not the station name - use bvg_locations_search to find stop IDs by station name)',
        minLength: 1
      },
      when: {
        type: 'string',
        description: 'Date and time in ISO format (default: now)',
        format: 'date-time'
      },
      duration: {
        type: 'number',
        description: 'Show arrivals for the next n minutes (1-1440)',
        minimum: 1,
        maximum: 1440,
        default: 120
      },
      results: {
        type: 'number',
        description: 'Maximum number of results (1-100)',
        minimum: 1,
        maximum: 100,
        default: 10
      },
      linesOfStops: {
        type: 'boolean',
        description: 'Include lines that serve this stop',
        default: false
      },
      remarks: {
        type: 'boolean',
        description: 'Include remarks and alerts',
        default: true
      },
      language: {
        type: 'string',
        enum: ['de', 'en'],
        description: 'Language for results',
        default: 'en'
      }
    },
    required: ['stopId']
  }
};

/**
 * Execute stop details lookup
 */
export async function executeStopDetails(params: StopDetailsParams): Promise<Stop> {
  if (!validateStopId(params.stopId)) {
    throw new Error('Invalid stop ID provided');
  }

  const queryParams = {
    linesOfStops: params.linesOfStops,
    language: params.language
  };

  try {
    const response = await bvgApi.get<Stop>(`/stops/${encodeURIComponent(params.stopId)}`, queryParams);
    return response;
  } catch (error) {
    throw new Error(`Failed to get stop details: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Execute stop departures lookup
 */
export async function executeStopDepartures(params: StopDeparturesParams): Promise<Departure[]> {
  if (!validateStopId(params.stopId)) {
    throw new Error('Invalid stop ID provided');
  }

  const queryParams: Record<string, string | number | boolean> = {
    duration: params.duration,
    results: params.results,
    linesOfStops: params.linesOfStops,
    remarks: params.remarks,
    language: params.language
  };

  if (params.when) {
    queryParams.when = params.when;
  }

  try {
    const response = await bvgApi.get<{ departures: Departure[] }>(`/stops/${encodeURIComponent(params.stopId)}/departures`, queryParams);
    return response.departures;
  } catch (error) {
    throw new Error(`Failed to get stop departures: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Execute stop arrivals lookup
 */
export async function executeStopArrivals(params: StopDeparturesParams): Promise<Arrival[]> {
  if (!validateStopId(params.stopId)) {
    throw new Error('Invalid stop ID provided');
  }

  const queryParams: Record<string, string | number | boolean> = {
    duration: params.duration,
    results: params.results,
    linesOfStops: params.linesOfStops,
    remarks: params.remarks,
    language: params.language
  };

  if (params.when) {
    queryParams.when = params.when;
  }

  try {
    const response = await bvgApi.get<{ arrivals: Arrival[] }>(`/stops/${encodeURIComponent(params.stopId)}/arrivals`, queryParams);
    return response.arrivals;
  } catch (error) {
    throw new Error(`Failed to get stop arrivals: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
