export interface ContainerTrip {
  id: number;
  containerNumber: string;
  sealNumber: string;
  containerType: string;
  grossWeightKg: number;
  originLocation: string;
  destinationLocation: string;
  tripStatus: "SCHEDULED" | "IN_TRANSIT" | "DELIVERED";
  truckId: number;
  driverId: number;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
}

export interface TelemetryPayload {
  latitude: number;
  longitude: number;
  speedKmH: number;
  timestamp?: string;
}

export interface TripSummary {
  tripId: number;
  containerNumber: string;
  tripStatus: string;
  startedAt: string;
  finishedAt: string | null;
  durationMinutes: number;
  totalTelemetryPoints: number;
  totalDistanceKm: number;
  averageSpeedKmH: number;
  maxSpeedKmH: number;
}