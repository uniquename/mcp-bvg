#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

// Import tools
import {
  locationsSearchTool,
  executeLocationsSearch,
  LocationsSearchSchema
} from './tools/locations.js';
import {
  nearbyLocationsTool,
  executeNearbyLocations,
  NearbyLocationsSchema
} from './tools/nearby.js';
import {
  stopDetailsTool,
  stopDeparturesTool,
  stopArrivalsTool,
  executeStopDetails,
  executeStopDepartures,
  executeStopArrivals,
  StopDetailsSchema,
  StopDeparturesSchema
} from './tools/stops.js';
import {
  journeyPlanTool,
  executeJourneyPlan,
  JourneyPlanSchema
} from './tools/journeys.js';
import {
  tripDetailsTool,
  radarTool,
  executeTripDetails,
  executeRadar,
  TripDetailsSchema,
  RadarSchema
} from './tools/additional.js';

/**
 * Create and configure the MCP server
 */
function createServer(): Server {
  const server = new Server(
    {
      name: 'bvg-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  /**
   * Handler for listing available tools
   */
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        locationsSearchTool,
        nearbyLocationsTool,
        stopDetailsTool,
        stopDeparturesTool,
        stopArrivalsTool,
        journeyPlanTool,
        tripDetailsTool,
        radarTool,
      ],
    };
  });

  /**
   * Handler for tool execution
   */
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'bvg_locations_search': {
          const params = LocationsSearchSchema.parse(args);
          const result = await executeLocationsSearch(params);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'bvg_locations_nearby': {
          const params = NearbyLocationsSchema.parse(args);
          const result = await executeNearbyLocations(params);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'bvg_stop_details': {
          const params = StopDetailsSchema.parse(args);
          const result = await executeStopDetails(params);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'bvg_stop_departures': {
          const params = StopDeparturesSchema.parse(args);
          const result = await executeStopDepartures(params);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'bvg_stop_arrivals': {
          const params = StopDeparturesSchema.parse(args);
          const result = await executeStopArrivals(params);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'bvg_journey_plan': {
          const params = JourneyPlanSchema.parse(args);
          const result = await executeJourneyPlan(params);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'bvg_trip_details': {
          const params = TripDetailsSchema.parse(args);
          const result = await executeTripDetails(params);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'bvg_radar': {
          const params = RadarSchema.parse(args);
          const result = await executeRadar(params);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${name}`
          );
      }
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }

      throw new McpError(
        ErrorCode.InternalError,
        `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  });

  return server;
}

/**
 * Main function to start the server
 */
async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);

  // Keep the server running
  process.on('SIGINT', async () => {
    await server.close();
    process.exit(0);
  });

  console.error('BVG MCP Server running on stdio');
}

// Start the server
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Server failed to start:', error);
    process.exit(1);
  });
}
