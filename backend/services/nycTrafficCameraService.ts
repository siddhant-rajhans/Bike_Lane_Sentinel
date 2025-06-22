import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import { TrafficCamera, TrafficCameraFeed, GeoLocation } from '../types';

/**
 * NYC Traffic Camera Service
 * 
 * This service handles interactions with NYC DOT Traffic Camera feeds.
 * It provides methods to:
 * - Get all available traffic cameras (locations, IDs)
 * - Get the latest image from a specific camera
 * - Find cameras near bike lanes
 */
export class NYCTrafficCameraService {
  private readonly cameraDataCache: Map<string, TrafficCamera> = new Map();
  private readonly CACHE_FILE_PATH = path.join(__dirname, '../data/camera_cache.json');
  private readonly CAMERA_DATA_URL = 'https://webcams.nyctmc.org/api/cameras'; // Real NYC DOT API endpoint
  
  // NYC bike lane locations with high violation rates - used to determine if a camera is near a bike lane
  private readonly bikeLaneLocations = [
    { name: 'Bedford Ave, Brooklyn', lat: 40.7197, lng: -73.9566, radius: 0.5 }, // radius in miles
    { name: '1st Ave, Manhattan', lat: 40.7282, lng: -73.9942, radius: 0.5 },
    { name: '8th Ave, Manhattan', lat: 40.7328, lng: -74.0027, radius: 0.5 },
    { name: 'Queens Blvd, Queens', lat: 40.7334, lng: -73.9272, radius: 0.5 },
    { name: 'Grand Concourse, Bronx', lat: 40.8301, lng: -73.9187, radius: 0.5 },
  ];

  // Calculate distance between two coordinates (Haversine formula)
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3958.8; // Earth radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in miles
  }

  // Check if a camera is near any bike lane
  private isCameraNearBikeLane(cameraLocation: GeoLocation): boolean {
    return this.bikeLaneLocations.some(bikeLane => {
      const distance = this.calculateDistance(
        cameraLocation.lat, 
        cameraLocation.lng, 
        bikeLane.lat, 
        bikeLane.lng
      );
      return distance <= bikeLane.radius;
    });
  }

  // Parse camera data from NYC DOT API format to our application format
  private parseCameraData(rawCamera: any): TrafficCamera {
    return {
      id: rawCamera.id,
      name: rawCamera.name || 'Unnamed Camera',
      location: { 
        lat: parseFloat(rawCamera.lat), 
        lng: parseFloat(rawCamera.lng) 
      },
      area: rawCamera.area || this.determineArea(parseFloat(rawCamera.lat), parseFloat(rawCamera.lng)),
      imageUrl: rawCamera.image_url || `https://webcams.nyctmc.org/api/cameras/${rawCamera.id}/image`,
      lastUpdated: new Date().toISOString(),
      status: rawCamera.is_online ? 'online' : 'offline',
      nearBikeLane: this.isCameraNearBikeLane({ 
        lat: parseFloat(rawCamera.lat), 
        lng: parseFloat(rawCamera.lng) 
      })
    };
  }

  // Determine borough area based on coordinates
  private determineArea(lat: number, lng: number): string {
    // Simple bounding box check for NYC boroughs
    if (lat > 40.7 && lat < 40.9 && lng > -74.03 && lng < -73.9) return 'Manhattan';
    if (lat > 40.6 && lat < 40.75 && lng > -74.05 && lng < -73.85) return 'Brooklyn';
    if (lat > 40.65 && lat < 40.85 && lng > -73.96 && lng < -73.7) return 'Queens';
    if (lat > 40.8 && lat < 40.92 && lng > -73.94 && lng < -73.8) return 'Bronx';
    if (lat > 40.5 && lat < 40.65 && lng > -74.25 && lng < -74.05) return 'Staten Island';
    return 'New York City';
  }

  /**
   * Get all available traffic cameras
   */
  // NYC traffic camera data (for demo purposes in case API fails)
  private readonly staticCameraData: TrafficCamera[] = [
    {
      id: 'd4bbce49-b087-4524-a835-08cb253926a7',
      name: 'First Ave at E 42nd St',
      location: { lat: 40.7500, lng: -73.9707 },
      area: 'Manhattan',
      imageUrl: 'https://webcams.nyctmc.org/api/cameras/d4bbce49-b087-4524-a835-08cb253926a7/image',
      lastUpdated: new Date().toISOString(),
      status: 'online',
      nearBikeLane: true
    },
    {
      id: '07717cda-a5e0-4496-b051-2d0c9f6a873f',
      name: 'Bedford Ave at N 7th St',
      location: { lat: 40.7197, lng: -73.9566 },
      area: 'Brooklyn',
      imageUrl: 'https://webcams.nyctmc.org/api/cameras/07717cda-a5e0-4496-b051-2d0c9f6a873f/image',
      lastUpdated: new Date().toISOString(),
      status: 'online',
      nearBikeLane: true
    },
    {
      id: 'c4e4d38f-89e9-4a09-90ae-24b9ab4ff456',
      name: 'Queens Blvd at 63rd Dr',
      location: { lat: 40.7334, lng: -73.9272 },
      area: 'Queens',
      imageUrl: 'https://webcams.nyctmc.org/api/cameras/c4e4d38f-89e9-4a09-90ae-24b9ab4ff456/image',
      lastUpdated: new Date().toISOString(),
      status: 'online',
      nearBikeLane: true
    },
    {
      id: 'b8a456e2-d820-4494-9f5a-c5f0d7f9d20a',
      name: '8th Ave at W 34th St',
      location: { lat: 40.7328, lng: -74.0027 },
      area: 'Manhattan',
      imageUrl: 'https://webcams.nyctmc.org/api/cameras/b8a456e2-d820-4494-9f5a-c5f0d7f9d20a/image',
      lastUpdated: new Date().toISOString(),
      status: 'online',
      nearBikeLane: true
    },
    {
      id: '93c26401-af97-4683-b6c3-2faad7e81ff4',
      name: 'Grand Concourse at E 161st St',
      location: { lat: 40.8301, lng: -73.9187 },
      area: 'Bronx',
      imageUrl: 'https://webcams.nyctmc.org/api/cameras/93c26401-af97-4683-b6c3-2faad7e81ff4/image',
      lastUpdated: new Date().toISOString(),
      status: 'online',
      nearBikeLane: true
    }
  ];
  
  async getAllCameras(): Promise<TrafficCamera[]> {
    try {
      // Check cache first
      if (this.cameraDataCache.size > 0) {
        return Array.from(this.cameraDataCache.values());
      }
      
      // Fetch from NYC DOT API
      const response = await axios.get(this.CAMERA_DATA_URL, {
        timeout: 5000 // Add timeout to prevent long hang
      });
      
      if (!response.data) {
        console.error('No data returned from NYC Traffic Camera API, using fallback data');
        return this.staticCameraData;
      }
      
      // Parse and cache the camera data
      const cameras: TrafficCamera[] = response.data.map((camera: any) => this.parseCameraData(camera));
      
      // Update cache
      cameras.forEach(camera => {
        this.cameraDataCache.set(camera.id, camera);
      });
      
      return cameras;
    } catch (error: any) {
      console.error('Failed to get traffic camera data:', error);
      console.log('Using fallback camera data');
      
      // Return static demo data instead of throwing an error
      return this.staticCameraData;
    }
  }

  /**
   * Get cameras near bike lanes
   */
  async getCamerasNearBikeLanes(): Promise<TrafficCamera[]> {
    try {
      const allCameras = await this.getAllCameras();
      return allCameras.filter(camera => camera.nearBikeLane);
    } catch (error: any) {
      console.error('Failed to get bike lane cameras:', error);
      // Return static demo data that are near bike lanes
      return this.staticCameraData.filter(camera => camera.nearBikeLane);
    }
  }

  /**
   * Get the latest image feed from a camera
   * @param cameraId The ID of the camera
   */
  async getCameraFeed(cameraId: string): Promise<TrafficCameraFeed> {
    try {
      // Find camera in cache or fetch all cameras if not found
      let camera = this.cameraDataCache.get(cameraId);
      if (!camera) {
        const allCameras = await this.getAllCameras();
        camera = allCameras.find(c => c.id === cameraId);
      }
      
      if (!camera) {
        // If camera not found, try to find a matching static camera
        camera = this.staticCameraData.find(c => c.id === cameraId);
        
        // If still not found, use the first static camera as fallback
        if (!camera) {
          console.error(`Camera not found: ${cameraId}, using fallback camera`);
          camera = this.staticCameraData[0];
        }
      }
      
      // Generate a unique URL with a timestamp to prevent caching
      const timestamp = new Date().getTime();
      const imageUrl = `${camera.imageUrl}?t=${timestamp}`;
      
      // Return camera feed data with current timestamp
      return {
        cameraId: camera.id,
        timestamp: new Date().toISOString(),
        imageUrl: imageUrl, // URL with cache-busting parameter
        location: camera.location,
        cameraName: camera.name
      };
    } catch (error: any) {
      console.error(`Failed to get camera feed for ${cameraId}:`, error);
      
      // Return fallback camera feed with the demo camera URL
      const fallbackCamera = this.staticCameraData[0];
      const timestamp = new Date().getTime();
      
      // Use the demo camera URL that updates every 2 seconds
      const demoImageUrl = `https://webcams.nyctmc.org/api/cameras/d4bbce49-b087-4524-a835-08cb253926a7/image?t=${timestamp}`;
      
      return {
        cameraId: fallbackCamera.id,
        timestamp: new Date().toISOString(),
        imageUrl: demoImageUrl,
        location: fallbackCamera.location,
        cameraName: fallbackCamera.name + " (Demo)"
      };
    }
  }
}

// Export a singleton instance
export const nycTrafficCameraService = new NYCTrafficCameraService();
