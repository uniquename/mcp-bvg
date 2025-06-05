#!/usr/bin/env node

/**
 * Example script to test the BVG MCP server tools directly
 * This is useful for development and testing purposes
 */

import { executeLocationsSearch } from './build/tools/locations.js';
import { executeNearbyLocations } from './build/tools/nearby.js';
import { executeStopDepartures } from './build/tools/stops.js';
import { executeJourneyPlan } from './build/tools/journeys.js';

async function runExamples() {
  console.log('🚌 BVG MCP Server Examples\n');

  try {
    // Example 1: Search for locations
    console.log('1. Searching for "Alexanderplatz"...');
    const locations = await executeLocationsSearch({
      query: 'Alexanderplatz',
      results: 3,
      addresses: false,
      poi: false,
      linesOfStops: false,
      language: 'en'
    });
    console.log(`Found ${locations.length} locations:`);
    locations.forEach(loc => {
      console.log(`   - ${loc.name} (${loc.type})`);
    });
    console.log();

    // Example 2: Find nearby stops
    console.log('2. Finding stops near Brandenburg Gate (52.5162,13.3777)...');
    const nearbyStops = await executeNearbyLocations({
      coordinates: '52.5162,13.3777',
      results: 3,
      distance: 500,
      stops: true,
      poi: false,
      linesOfStops: false,
      language: 'en'
    });
    console.log(`Found ${nearbyStops.length} nearby stops:`);
    nearbyStops.forEach(stop => {
      console.log(`   - ${stop.name} (${stop.distance}m away)`);
    });
    console.log();

    // Example 3: Get departures (using a well-known stop ID)
    if (locations.length > 0 && locations[0].id) {
      console.log(`3. Getting departures from ${locations[0].name}...`);
      const departures = await executeStopDepartures({
        stopId: locations[0].id,
        duration: 60,
        results: 5,
        linesOfStops: false,
        remarks: true,
        language: 'en'
      });
      console.log(`Found ${departures.length} upcoming departures:`);
      departures.forEach(dep => {
        const time = dep.when ? new Date(dep.when).toLocaleTimeString() : 'Unknown';
        console.log(`   - ${dep.line.name} to ${dep.direction} at ${time}`);
      });
      console.log();
    }

    // Example 4: Plan a journey
    console.log('4. Planning journey from Alexanderplatz to Potsdamer Platz...');
    const journeys = await executeJourneyPlan({
      from: 'Alexanderplatz',
      to: 'Potsdamer Platz',
      results: 2,
      stopovers: false,
      transfers: -1,
      transferTime: 0,
      accessibility: undefined,
      bike: false,
      walkingSpeed: 'normal',
      startWithWalking: true,
      endWithWalking: true,
      language: 'en'
    });
    console.log(`Found ${journeys.length} journey options:`);
    journeys.forEach((journey, i) => {
      const duration = journey.legs.reduce((total, leg) => {
        if (leg.arrival && leg.departure) {
          return total + (new Date(leg.arrival).getTime() - new Date(leg.departure).getTime());
        }
        return total;
      }, 0);
      const durationMin = Math.round(duration / 60000);
      console.log(`   ${i + 1}. ${journey.legs.length} legs, ~${durationMin} minutes`);
    });

  } catch (error) {
    console.error('❌ Error running examples:', error instanceof Error ? error.message : error);
  }
}

// Run examples if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples();
}
