import { Request, Response } from 'express';
import { moondreamModel } from '../services/moondreamModel';
import { nycTrafficCameraService } from '../services/nycTrafficCameraService';
import { BikeLaneDetectionResponse, TrafficCamera, BikeLaneViolation, TrafficCameraFeed } from '../types';
import * as crypto from 'crypto';
import axios from 'axios';

export class BikeLaneController {
  private violations: Map<string, BikeLaneViolation> = new Map();

  constructor() {
    // Initialize with some demo violations for the hackathon
    this.initializeDemoViolations();
  }

  /**
   * POST /api/detect-bike-lane-violations
   * Analyze an image to detect cars parked in bike lanes
   */
  async detectBikeLaneViolations(req: Request, res: Response): Promise<void> {
    try {
      // Check if image file was uploaded
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'Image file is required.'
        } as BikeLaneDetectionResponse);
        return;
      }

      // Validate file type
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        res.status(400).json({
          success: false,
          message: 'Invalid file type. Please upload a JPEG, PNG, or GIF image.'
        } as BikeLaneDetectionResponse);
        return;
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (req.file.size > maxSize) {
        res.status(400).json({
          success: false,
          message: 'File size too large. Please upload an image smaller than 10MB.'
        } as BikeLaneDetectionResponse);
        return;
      }
      
      let cameraId = req.body.cameraId || null;
      let location = null;
      let camera = null;
      let imageBuffer = req.file.buffer;
      let cameraImageUrl = null;
      
      // If cameraId is provided, get the camera data and latest image
      if (cameraId) {
        try {
          // First get the camera details
          const cameras = await nycTrafficCameraService.getAllCameras();
          camera = cameras.find(c => c.id === cameraId);
          
          if (camera) {
            location = camera.location;
            
            // Try to fetch the latest camera feed
            try {
              const cameraFeed = await nycTrafficCameraService.getCameraFeed(cameraId);
              
              if (cameraFeed && cameraFeed.imageUrl) {
                // Store the camera image URL for later use
                cameraImageUrl = cameraFeed.imageUrl;
                
                // Try to fetch the actual image data from the URL
                try {
                  console.log(`Fetching live image from ${cameraImageUrl}`);
                  const imageResponse = await axios.get(cameraImageUrl, { responseType: 'arraybuffer' });
                  // Use the fetched image instead of the uploaded one
                  imageBuffer = Buffer.from(imageResponse.data);
                  console.log(`Successfully fetched live camera image for ${cameraId}`);
                } catch (imageErr) {
                  console.error(`Failed to fetch camera image from URL, using uploaded image instead:`, imageErr);
                  // Continue with the uploaded image if fetching the camera image fails
                }
              }
            } catch (feedErr) {
              console.error(`Failed to get camera feed for ${cameraId}, using uploaded image instead:`, feedErr);
              // Continue with the uploaded image if the camera feed fails
            }
          }
        } catch (err) {
          console.error('Error fetching camera data:', err);
        }
      }

      // Ask Moondream if there are cars parking on the bike lane
      const queryResult: any = await moondreamModel.query({
        image: imageBuffer, // Use the latest image (either from upload or camera feed)
        question: "Are there cars parking on the bike lane? If yes, what type of vehicle is it (car, taxi, truck, bus, etc)? Provide the answer in this format: 'Yes, [vehicle type]' or simply 'No'.",
        stream: false // Ensure we get a non-streaming response
      });
      
      // The answer is a direct string when not streaming
      const answer = queryResult.answer as string;

      // Parse the answer
      const { hasCarsInBikeLane, vehicleType } = this.parseVehicleAnswer(answer);
      
      console.log(`Moondream response for ${cameraId || 'user upload'}: ${answer}`);
      console.log(`Detected car in bike lane: ${hasCarsInBikeLane}, vehicle type: ${vehicleType || 'N/A'}`);
      
      // If a vehicle is detected in the bike lane, create a violation record
      let violationData = null;
      if (hasCarsInBikeLane) {
        // Generate a unique ID for this violation
        const id = crypto.randomUUID();
        
        // Create the violation object
        const violation: BikeLaneViolation = {
          id,
          cameraId: cameraId || 'user-upload',
          // Use the camera URL when available, otherwise use the base64 encoded image
          imageUrl: cameraId && cameraImageUrl 
            ? cameraImageUrl 
            : 'data:image/jpeg;base64,' + req.file.buffer.toString('base64'),
          vehicleType: vehicleType || 'Unknown Vehicle',
          location: location || { lat: 40.7128, lng: -74.0060 }, // Default to NYC coordinates
          timestamp: new Date().toISOString(),
          status: 'Pending',
          confidence: 0.85, // Mock confidence value
          notes: camera ? `Detected at ${camera.name}` : 'Detected by Bike Lane Sentinel AI'
        };
        
        // Store the violation
        this.violations.set(id, violation);
        
        violationData = {
          violationId: id,
          vehicleType
        };
      }

      // Return successful response
      res.status(200).json({
        success: true,
        data: {
          hasCarsInBikeLane,
          answer: answer,
          vehicleType,
          timestamp: new Date().toISOString(),
          cameraId,
          location,
          ...violationData
        }
      } as BikeLaneDetectionResponse);

    } catch (error) {
      console.error('Bike lane detection error:', error);
      
      res.status(500).json({
        success: false,
        message: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`
      } as BikeLaneDetectionResponse);
    }
  }

  /**
   * GET /api/cameras
   * Get all traffic cameras, optionally filtered by proximity to bike lanes
   */
  async getTrafficCameras(req: Request, res: Response): Promise<void> {
    try {
      const nearBikeLanes = req.query.nearBikeLanes === 'true';
      
      let cameras: TrafficCamera[];
      
      if (nearBikeLanes) {
        cameras = await nycTrafficCameraService.getCamerasNearBikeLanes();
      } else {
        cameras = await nycTrafficCameraService.getAllCameras();
      }
      
      res.status(200).json({
        success: true,
        data: cameras
      });
    } catch (error) {
      console.error('Error fetching traffic cameras:', error);
      res.status(500).json({
        success: false,
        message: `Failed to fetch traffic cameras: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  /**
   * GET /api/cameras/:id/feed
   * Get the latest feed from a specific camera
   */
  async getCameraFeed(req: Request, res: Response): Promise<void> {
    try {
      const cameraId = req.params.id;
      
      if (!cameraId) {
        res.status(400).json({
          success: false,
          message: 'Camera ID is required'
        });
        return;
      }
      
      const feed = await nycTrafficCameraService.getCameraFeed(cameraId);
      
      res.status(200).json({
        success: true,
        data: feed
      });
    } catch (error) {
      console.error(`Error fetching camera feed: ${error}`);
      res.status(500).json({
        success: false,
        message: `Failed to fetch camera feed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  /**
   * GET /api/violations
   * Get all recorded bike lane violations
   */
  async getViolations(req: Request, res: Response): Promise<void> {
    try {
      // Convert the Map to an array of violations
      const violations = Array.from(this.violations.values());
      
      res.status(200).json({
        success: true,
        data: violations
      });
    } catch (error) {
      console.error('Error fetching violations:', error);
      res.status(500).json({
        success: false,
        message: `Failed to fetch violations: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  /**
   * GET /api/violations/:id
   * Get a specific violation by ID
   */
  async getViolationById(req: Request, res: Response): Promise<void> {
    try {
      const violationId = req.params.id;
      
      if (!violationId) {
        res.status(400).json({
          success: false,
          message: 'Violation ID is required'
        });
        return;
      }
      
      const violation = this.violations.get(violationId);
      
      if (!violation) {
        res.status(404).json({
          success: false,
          message: `Violation with ID ${violationId} not found`
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: violation
      });
    } catch (error) {
      console.error(`Error fetching violation: ${error}`);
      res.status(500).json({
        success: false,
        message: `Failed to fetch violation: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  /**
   * POST /api/violations/:id/status
   * Update the status of a violation
   */
  async updateViolationStatus(req: Request, res: Response): Promise<void> {
    try {
      const violationId = req.params.id;
      const { status } = req.body;
      
      if (!violationId) {
        res.status(400).json({
          success: false,
          message: 'Violation ID is required'
        });
        return;
      }
      
      if (!status) {
        res.status(400).json({
          success: false,
          message: 'Status is required'
        });
        return;
      }
      
      const violation = this.violations.get(violationId);
      
      if (!violation) {
        res.status(404).json({
          success: false,
          message: `Violation with ID ${violationId} not found`
        });
        return;
      }
      
      // Update the status
      violation.status = status;
      this.violations.set(violationId, violation);
      
      res.status(200).json({
        success: true,
        data: violation
      });
    } catch (error) {
      console.error(`Error updating violation status: ${error}`);
      res.status(500).json({
        success: false,
        message: `Failed to update violation status: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  /**
   * Parse vehicle answer from Moondream response
   * @param answer - The answer from Moondream API
   * @returns Object containing boolean indicating if there are violations and vehicle type
   */
  private parseVehicleAnswer(answer: string): { hasCarsInBikeLane: boolean; vehicleType?: string } {
    const lowerAnswer = answer.toLowerCase().trim();
    
    if (lowerAnswer.startsWith('yes')) {
      // Extract the vehicle type if available
      const match = lowerAnswer.match(/yes,\s*(.*)/i);
      const vehicleType = match ? match[1].trim() : 'Unknown Vehicle';
      
      return { hasCarsInBikeLane: true, vehicleType };
    }
    
    return { hasCarsInBikeLane: false };
  }

  /**
   * Initialize demo violations for the hackathon
   */
  private initializeDemoViolations(): void {
    // Add cache-busting timestamp to ensure fresh images when viewed
    const timestamp = Date.now();
    
    // Pre-populate with some sample violations for the demo
    const demoViolations: BikeLaneViolation[] = [
      {
        id: '7f9c24a5-9f4b-4eaa-8a67-1a15d6173281',
        cameraId: 'd4bbce49-b087-4524-a835-08cb253926a7',
        imageUrl: `https://webcams.nyctmc.org/api/cameras/d4bbce49-b087-4524-a835-08cb253926a7/image?t=${timestamp}`,
        vehicleType: 'SUV',
        licensePlate: 'ABC1234',
        location: { lat: 40.7197, lng: -73.9566 },
        timestamp: new Date().toISOString(), // Use current time
        status: 'Reported',
        confidence: 0.94,
        notes: 'Vehicle parked in bike lane for approximately 25 minutes.'
      },
      {
        id: '2a8b72c1-5d9e-4f00-b87e-3a912e6f90c5',
        cameraId: '07717cda-a5e0-4496-b051-2d0c9f6a873f',
        imageUrl: `https://webcams.nyctmc.org/api/cameras/07717cda-a5e0-4496-b051-2d0c9f6a873f/image?t=${timestamp}`,
        vehicleType: 'Taxi',
        licensePlate: 'T505623C',
        location: { lat: 40.7282, lng: -73.9942 },
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago 
        status: 'Pending',
        confidence: 0.89,
        notes: 'Temporarily stopped in bike lane'
      },
      {
        id: '5c9d3f4a-1e8b-4c7d-9a2f-6d8b5e7c9d3f',
        cameraId: 'c4e4d38f-89e9-4a09-90ae-24b9ab4ff456',
        imageUrl: `https://webcams.nyctmc.org/api/cameras/c4e4d38f-89e9-4a09-90ae-24b9ab4ff456/image?t=${timestamp}`,
        vehicleType: 'Delivery Van',
        licensePlate: 'XYZ9876',
        location: { lat: 40.7328, lng: -74.0027 },
        timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        status: 'Reported',
        confidence: 0.91,
        notes: 'Repeated violation - 3rd time this week.'
      },
      {
        id: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
        cameraId: 'd4bbce49-b087-4524-a835-08cb253926a7',
        imageUrl: `https://webcams.nyctmc.org/api/cameras/d4bbce49-b087-4524-a835-08cb253926a7/image?t=${timestamp-1000}`, // Slightly different timestamp
        vehicleType: 'Police Car',
        licensePlate: 'NYPD2567',
        location: { lat: 40.8301, lng: -73.9187 },
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        status: 'Under Review',
        confidence: 0.78,
        notes: 'Emergency vehicle temporarily in bike lane'
      }
    ];
    
    // Add the demo violations to the map
    demoViolations.forEach(violation => {
      this.violations.set(violation.id, violation);
    });
  }

  /**
   * GET /api/health
   * Health check endpoint
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Bike Lane Sentinel API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
} 