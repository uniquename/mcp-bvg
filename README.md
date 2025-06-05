# BVG MCP Server

A Model Context Protocol (MCP) server for interacting with the BVG (Berlin Public Transport) API. This server provides tools to search for locations, plan journeys, get real-time departures/arrivals, and more.

## Features

This MCP server provides the following tools:

### Location Search
- **bvg_locations_search**: Search for stops, addresses, and points of interest
- **bvg_locations_nearby**: Find nearby stops and POIs by coordinates

### Stop Information
- **bvg_stop_details**: Get detailed information about a specific stop
- **bvg_stop_departures**: Get upcoming departures at a stop
- **bvg_stop_arrivals**: Get upcoming arrivals at a stop

### Journey Planning
- **bvg_journey_plan**: Plan journeys from A to B using public transport

### Trip and Vehicle Information
- **bvg_trip_details**: Get detailed information about a specific trip
- **bvg_radar**: Find vehicles in a geographic area with movement data

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bvg-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Usage

### As an MCP Server

The server communicates via stdio and can be used with any MCP-compatible client.

```bash
npm start
```

### Configuration for Claude Desktop

Add this to your Claude Desktop configuration file (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "bvg-transport": {
      "command": "node",
      "args": ["/absolute/path/to/bvg-mcp-server/build/index.js"]
    }
  }
}
```

### Configuration for VS Code

This project includes VS Code configuration files in the `.vscode` directory:

- **Tasks**: Build, watch, start server, and test examples
- **Launch configurations**: Debug the MCP server and examples
- **Settings**: TypeScript and editor preferences
- **MCP Config**: Ready-to-use MCP server configuration

To use with VS Code:
1. Open the project folder in VS Code
2. Use `Cmd+Shift+P` → "Tasks: Run Task" to access build tasks
3. Use `F5` to debug the MCP server
4. The MCP configuration is available in `.vscode/mcp-config.json`

## Example Queries

Here are some example queries you can make:

### Search for Locations
```
Search for "Alexanderplatz" in Berlin
```

### Find Nearby Stops
```
Find stops near coordinates 52.5200,13.4050 (Brandenburg Gate)
```

### Get Departures
```
Get the next departures from Alexanderplatz station
```

### Plan a Journey
```
Plan a journey from Alexanderplatz to Potsdamer Platz
```

## API Reference

The server uses the BVG REST API v6: https://v6.bvg.transport.rest/api.html

## Development

### Scripts

- `npm run build`: Compile TypeScript to JavaScript
- `npm run dev`: Watch mode for development
- `npm start`: Start the MCP server
- `npm test`: Run example tests
- `npm run clean`: Clean build directory

### Project Structure

```
src/
├── index.ts              # Main MCP server
├── types/
│   └── bvg.ts           # TypeScript types for BVG API
├── utils/
│   └── api.ts           # HTTP client and utilities
└── tools/               # MCP tool implementations
    ├── locations.ts
    ├── nearby.ts
    ├── stops.ts
    ├── journeys.ts
    └── additional.ts
```

## License

MIT License

MIT License
