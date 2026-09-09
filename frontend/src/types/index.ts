export interface ContainerTrip {
  id: number;
  containerNumber: string;
  sealNumber: string;
  containerType: string;
  grossWeightKg: number;
  originLocation: string;
  destinationLocation: string;
  tripStatus: 'SCHEDULED' | 'IN_TRANSIT' | 'DELIVERED';
  truckId: number;
  driverId: number;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
}

export interface TelemetryData {
  tripId: number;
  latitude: number;
  longitude: number;
  speedKmH: number;
  recordedAt: string;
  ttlSeconds: number;
}