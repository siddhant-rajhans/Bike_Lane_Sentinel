// Moondream Query API Types
export interface MoondreamQueryRequest {
  image: Buffer;
  question: string;
}

export interface MoondreamQueryResponse {
  request_id: string;
  answer: string;
}

// Bike Lane Detection Types
export interface BikeLaneDetectionResult {
  hasCarsInBikeLane: boolean;
  answer: string;
  timestamp: string;
  cameraId?: string;
  location?: GeoLocation;
  vehicleType?: string;
  licensePlate?: string;
  confidence?: number;
}

export interface BikeLaneDetectionRequest {
  image: any; // Express.Multer.File type
  cameraId?: string;
}

export interface BikeLaneDetectionResponse {
  success: boolean;
  data?: BikeLaneDetectionResult;
  message?: string;
}

// Traffic Camera Types
export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface TrafficCamera {
  id: string;
  name: string;
  location: GeoLocation;
  area: string; // Borough (Manhattan, Brooklyn, etc.)
  imageUrl: string;
  lastUpdated: string;
  status: 'online' | 'offline' | 'maintenance';
  nearBikeLane: boolean;
}

export interface TrafficCameraFeed {
  cameraId: string;
  cameraName: string;
  timestamp: string;
  imageUrl: string;
  location: GeoLocation;
}

export interface BikeLaneViolation {
  id: string;
  cameraId: string;
  imageUrl: string;
  vehicleType: string;
  licensePlate?: string;
  location: GeoLocation;
  timestamp: string;
  status: 'Pending' | 'Reported' | 'Under Review' | 'Confirmed' | 'Rejected';
  confidence: number;
  notes?: string;
}

// API Error Types
export interface ApiError {
  message: string;
  type: string;
  code: number;
}

// Configuration Types
export interface AppConfig {
  port: number;
  moondreamApiKey: string;
  maxFileSize: number;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
} 