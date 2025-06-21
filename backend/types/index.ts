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
}

export interface BikeLaneDetectionRequest {
  image: any; // Express.Multer.File type
}

export interface BikeLaneDetectionResponse {
  success: boolean;
  data?: BikeLaneDetectionResult;
  message?: string;
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