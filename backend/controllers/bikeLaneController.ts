import { Request, Response } from 'express';
import { moondreamModel } from '../services/moondreamModel';
import { BikeLaneDetectionResponse } from '../types';

export class BikeLaneController {
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

      // Ask Moondream if there are cars parking on the bike lane
      const queryResult: any = await moondreamModel.query({
        image: req.file.buffer,
        question: "Are there cars parking on the bike lane? Answer in yes or no.",
        stream: false // Ensure we get a non-streaming response
      });
      
      // The answer is a direct string when not streaming
      const answer = queryResult.answer as string;

      // Parse the yes/no answer
      const hasCarsInBikeLane = this.parseYesNoAnswer(answer);

      // Return successful response
      res.status(200).json({
        success: true,
        data: {
          hasCarsInBikeLane,
          answer: answer,
          timestamp: new Date().toISOString()
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
   * Parse yes/no answer from Moondream response
   * @param answer - The answer from Moondream API
   * @returns boolean indicating if there are violations
   */
  private parseYesNoAnswer(answer: string): boolean {
    const lowerAnswer = answer.toLowerCase().trim();
    return lowerAnswer === 'yes';
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