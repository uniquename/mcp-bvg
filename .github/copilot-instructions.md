# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is an MCP (Model Context Protocol) server project in TypeScript for consuming the BVG Berlin Transport API.

You can find more info and examples at https://modelcontextprotocol.io/llms-full.txt

Additional reference: https://github.com/modelcontextprotocol/create-python-server

## Project Context

This MCP server provides tools to interact with the BVG (Berlin Public Transport) API at https://v6.bvg.transport.rest/api.html

Available API endpoints include:
- `/locations` - Search for stops, addresses, and POIs
- `/locations/nearby` - Find nearby stops and POIs by coordinates
- `/stops` - Get stops by query or list all stops
- `/stops/:id` - Get stop details by ID
- `/stops/:id/departures` - Get departures at a stop
- `/stops/:id/arrivals` - Get arrivals at a stop
- `/journeys` - Plan journeys from A to B
- `/trips/:id` - Get trip details by ID
- `/radar` - Find vehicles in an area with movement data

## Code Style Guidelines

- Use TypeScript with strict type checking
- Follow the MCP SDK patterns for tool definitions
- Use Zod schemas for input validation
- Implement proper error handling for API calls
- Include descriptive tool names and descriptions
- Use proper JSDoc comments for functions
