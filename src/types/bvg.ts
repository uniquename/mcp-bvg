/**
 * Type definitions for BVG Transport API responses
 */

export interface Location {
  type: 'location' | 'stop' | 'station' | 'poi' | 'address';
  id?: string;
  name?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  distance?: number;
  products?: Products;
}

export interface Stop extends Location {
  type: 'stop' | 'station';
  id: string;
  name: string;
  location: {
    type: 'location';
    latitude: number;
    longitude: number;
  };
  products: Products;
  station?: Stop;
}

export interface Products {
  suburban?: boolean;
  subway?: boolean;
  tram?: boolean;
  bus?: boolean;
  ferry?: boolean;
  express?: boolean;
  regional?: boolean;
}

export interface Departure {
  tripId: string;
  stop: Stop;
  when?: string;
  plannedWhen?: string;
  delay?: number;
  platform?: string;
  plannedPlatform?: string;
  prognosisType?: 'prognosis' | 'calculation';
  direction?: string;
  provenance?: string;
  line: Line;
  remarks?: Remark[];
  origin?: Stop;
  destination?: Stop;
}

export interface Arrival extends Departure {}

export interface Line {
  type: 'line';
  id: string;
  fahrtNr?: string;
  name: string;
  public: boolean;
  adminCode?: string;
  productName?: string;
  mode: 'train' | 'bus' | 'watercraft' | 'taxi' | 'gondola' | 'aircraft' | 'car' | 'bicycle' | 'walking';
  product: keyof Products;
  operator?: Operator;
}

export interface Operator {
  type: 'operator';
  id: string;
  name: string;
}

export interface Journey {
  type: 'journey';
  legs: Leg[];
  refreshToken?: string;
  price?: Price;
}

export interface Leg {
  origin: Stop;
  destination: Stop;
  departure?: string;
  plannedDeparture?: string;
  departureDelay?: number;
  arrival?: string;
  plannedArrival?: string;
  arrivalDelay?: number;
  reachable?: boolean;
  tripId?: string;
  line?: Line;
  direction?: string;
  arrivalPlatform?: string;
  plannedArrivalPlatform?: string;
  departurePlatform?: string;
  plannedDeparturePlatform?: string;
  stopovers?: Stopover[];
  distance?: number;
  public?: boolean;
  walking?: boolean;
  transfer?: boolean;
  loadFactor?: string;
  remarks?: Remark[];
  polyline?: Polyline;
}

export interface Stopover {
  stop: Stop;
  arrival?: string;
  plannedArrival?: string;
  arrivalDelay?: number;
  departure?: string;
  plannedDeparture?: string;
  departureDelay?: number;
  platform?: string;
  plannedPlatform?: string;
  remarks?: Remark[];
}

export interface Remark {
  type: 'hint' | 'warning' | 'status';
  code?: string;
  text: string;
  summary?: string;
}

export interface Price {
  amount: number;
  currency: string;
  hint?: string;
}

export interface Polyline {
  type: 'polyline';
  features: Array<{
    type: 'Feature';
    geometry: {
      type: 'LineString';
      coordinates: number[][];
    };
  }>;
}

export interface Trip {
  id: string;
  origin: Stop;
  destination: Stop;
  departure?: string;
  plannedDeparture?: string;
  departureDelay?: number;
  arrival?: string;
  plannedArrival?: string;
  arrivalDelay?: number;
  line: Line;
  direction?: string;
  stopovers?: Stopover[];
  polyline?: Polyline;
}

export interface RadarResult {
  features: Array<{
    type: 'Feature';
    properties: {
      tripId: string;
      line: Line;
      direction?: string;
      delay?: number;
    };
    geometry: {
      type: 'Point';
      coordinates: [number, number];
    };
  }>;
}

/**
 * API Error response
 */
export interface ApiError {
  error: boolean;
  msg: string;
  statusCode?: number;
}
