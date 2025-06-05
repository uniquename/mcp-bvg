import { ApiError } from '../types/bvg.js';

/**
 * Base URL for the BVG API
 */
export const BVG_API_BASE_URL = 'https://v6.bvg.transport.rest';

/**
 * HTTP client for BVG API calls with error handling
 */
export class BvgApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = BVG_API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Make a GET request to the BVG API
   */
  async get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<T> {
    const url = new URL(endpoint, this.baseUrl);

    // Add query parameters
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'bvg-mcp-server/1.0.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Check if the API returned an error
      if (this.isApiError(data)) {
        throw new Error(`BVG API error: ${data.msg}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch from BVG API: ${error.message}`);
      }
      throw new Error('Unknown error occurred while fetching from BVG API');
    }
  }

  /**
   * Type guard to check if response is an API error
   */
  private isApiError(data: any): data is ApiError {
    return data && typeof data === 'object' && data.error === true && typeof data.msg === 'string';
  }
}

/**
 * Default BVG API client instance
 */
export const bvgApi = new BvgApiClient();

/**
 * Format a date for API consumption
 */
export function formatDate(date: Date): string {
  return date.toISOString();
}

/**
 * Parse coordinates string into latitude and longitude
 */
export function parseCoordinates(coords: string): { latitude: number; longitude: number } {
  const [lat, lon] = coords.split(',').map(s => parseFloat(s.trim()));

  if (isNaN(lat) || isNaN(lon)) {
    throw new Error('Invalid coordinates format. Expected "latitude,longitude"');
  }

  if (lat < -90 || lat > 90) {
    throw new Error('Latitude must be between -90 and 90');
  }

  if (lon < -180 || lon > 180) {
    throw new Error('Longitude must be between -180 and 180');
  }

  return { latitude: lat, longitude: lon };
}

/**
 * Validate stop ID format
 */
export function validateStopId(stopId: string): boolean {
  return typeof stopId === 'string' && stopId.length > 0;
}

/**
 * Format duration in minutes to human readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}min`;
}
