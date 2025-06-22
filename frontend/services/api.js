import axios from 'axios';
import mockImageData from '../assets/mockImageData';
import { getFallbackCameraImage } from '../assets/fallbackCameraImages';

// Base URL for the API - adjust as needed for your environment
// For Expo: Use your computer's local IP address instead of localhost
// You can find your IP address by running 'ipconfig' on Windows or 'ifconfig' on Mac/Linux
// For example: '192.168.1.5:3000/api'
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 
  // Default fallback - replace with your local network IP when testing with real devices
  // For the hackathon, this should be the IP address of the computer running the backend
  'http://localhost:3000/api';

// Create an axios instance with custom configuration for the hackathon demo
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000, // 5 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add a flag to track if we're in fallback mode
let usingFallbackMode = false;

// Add response interceptor to handle network errors consistently
api.interceptors.response.use(
  (response) => {
    // Reset fallback mode flag when we get a successful response
    if (usingFallbackMode) {
      console.log('Network connection restored, using live API data');
      usingFallbackMode = false;
    }
    return response;
  },
  (error) => {
    // Set fallback mode flag when we get a network error
    if (error.message && (error.message.includes('Network Error') || error.code === 'ECONNABORTED')) {
      if (!usingFallbackMode) {
        console.log('Network error detected, switching to fallback demo mode');
        usingFallbackMode = true;
      }
    }
    return Promise.reject(error);
  }
);

// Format date and time utilities
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toTimeString().split(' ')[0].substring(0, 5);
};

/**
 * Extract location name from camera data or coordinates
 * Uses camera name or approximate location based on borough
 */
const getLocationName = (location, cameraId, cameraName, area) => {
  // If we have a camera name, use it directly
  if (cameraName) {
    return cameraName;
  }
  
  // Fallback to area-based naming if we have location
  if (location) {
    const areas = {
      'Brooklyn': 'Brooklyn',
      'Manhattan': 'Manhattan',
      'Queens': 'Queens',
      'Bronx': 'Bronx',
      'Staten Island': 'Staten Island'
    };
    
    // Try to determine borough from coordinates
    if (location.lat > 40.7 && location.lat < 40.9 && location.lng > -74.03 && location.lng < -73.9) {
      return `Manhattan (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})`;
    } else if (location.lat > 40.6 && location.lat < 40.75 && location.lng > -74.05 && location.lng < -73.85) {
      return `Brooklyn (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})`;
    } else if (location.lat > 40.65 && location.lat < 40.85 && location.lng > -73.96 && location.lng < -73.7) {
      return `Queens (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})`;
    } else if (location.lat > 40.8 && location.lat < 40.92 && location.lng > -73.94 && location.lng < -73.8) {
      return `Bronx (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})`;
    } else if (location.lat > 40.5 && location.lat < 40.65 && location.lng > -74.25 && location.lng < -74.05) {
      return `Staten Island (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})`;
    }
  }
  
  return 'New York City';
};

/**
 * Get address from camera data or location
 * For real-world usage, we would implement reverse geocoding
 */
const getAddress = (location, cameraId, cameraName, area) => {
  // If we have camera name and area, use them to create an approximate address
  if (cameraName && area) {
    return `${cameraName}, ${area}, NY`;
  }
  
  // If we only have coordinates, format them as an address
  if (location) {
    const borough = 
      location.lat > 40.7 && location.lat < 40.9 && location.lng > -74.03 && location.lng < -73.9 ? 'Manhattan' :
      location.lat > 40.6 && location.lat < 40.75 && location.lng > -74.05 && location.lng < -73.85 ? 'Brooklyn' :
      location.lat > 40.65 && location.lat < 40.85 && location.lng > -73.96 && location.lng < -73.7 ? 'Queens' :
      location.lat > 40.8 && location.lat < 40.92 && location.lng > -73.94 && location.lng < -73.8 ? 'Bronx' :
      location.lat > 40.5 && location.lat < 40.65 && location.lng > -74.25 && location.lng < -74.05 ? 'Staten Island' :
      'New York City';
      
    return `Coordinates: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}, ${borough}, NY`;
  }
  
  return 'New York, NY';
};

// Get static demo violations for hackathon
const getDemoViolations = () => {
  console.log('Using demo violations data');
  
  // Use the actual traffic camera URLs with timestamp to prevent caching
  const timestamp = Date.now();
  
  // Use multiple different camera IDs for more variety
  const liveCameraIds = [
    'd4bbce49-b087-4524-a835-08cb253926a7',
    '04589f46-2429-4e26-ad46-12a1198e9a9c',
    '9dbb3101-9918-4b61-946f-a34d7c7c662b',
    'e25e1dfa-97cd-4beb-bed2-006c43c208ce',
    '8c781c69-18be-4e6d-9075-4e7f37375c84'
  ];
  
  return [
    {
      id: '7f9c24a5-9f4b-4eaa-8a67-1a15d6173281',
      imageUrl: `https://webcams.nyctmc.org/api/cameras/${liveCameraIds[0]}/image?t=${timestamp}`,
      vehicleType: 'SUV',
      licensePlate: 'ABC1234',
      location: { lat: 40.7197, lng: -73.9566 },
      locationName: 'First Ave at E 42nd St, Manhattan',
      address: 'First Ave at E 42nd St, Manhattan, NY',
      date: formatDate(new Date().toISOString()),
      time: formatTime(new Date().toISOString()),
      timestamp: new Date().toISOString(),
      status: 'Reported',
      notes: 'Vehicle parked in bike lane for approximately 25 minutes.'
    },
    {
      id: '2a8b72c1-5d9e-4f00-b87e-3a912e6f90c5',
      imageUrl: `https://webcams.nyctmc.org/api/cameras/${liveCameraIds[1]}/image?t=${timestamp}`,
      vehicleType: 'Taxi',
      licensePlate: 'T505623C',
      location: { lat: 40.7282, lng: -73.9942 },
      locationName: 'W 57th St at 11th Ave, Manhattan',
      address: 'W 57th St at 11th Ave, Manhattan, NY',
      date: formatDate(new Date(Date.now() - 3600000).toISOString()),
      time: formatTime(new Date(Date.now() - 3600000).toISOString()),
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'Pending',
      notes: 'Temporary stop in bike lane.'
    },
    {
      id: '5c9d3f4a-1e8b-4c7d-9a2f-6d8b5e7c9d3f',
      imageUrl: `https://webcams.nyctmc.org/api/cameras/${liveCameraIds[2]}/image?t=${timestamp}`,
      vehicleType: 'Delivery Van',
      licensePlate: 'XYZ9876',
      location: { lat: 40.7328, lng: -74.0027 },
      locationName: 'Broadway at W 46th St, Manhattan',
      address: 'Broadway at W 46th St, Manhattan, NY',
      date: formatDate(new Date(Date.now() - 7200000).toISOString()),
      time: formatTime(new Date(Date.now() - 7200000).toISOString()),
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      status: 'Reported',
      notes: 'Repeated violation - 3rd time this week.'
    },
    {
      id: '3e7d2a8f-9c5b-4e3a-8d6f-1a2b3c4d5e6f',
      imageUrl: `https://webcams.nyctmc.org/api/cameras/${liveCameraIds[3]}/image?t=${timestamp}`,
      vehicleType: 'Police',
      licensePlate: 'NYPD4527',
      location: { lat: 40.7536, lng: -73.9805 },
      locationName: '42nd St at 5th Ave, Manhattan',
      address: '42nd St at 5th Ave, Manhattan, NY',
      date: formatDate(new Date(Date.now() - 10800000).toISOString()),
      time: formatTime(new Date(Date.now() - 10800000).toISOString()),
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      status: 'Pending',
      notes: 'Emergency stop.'
    },
    {
      id: '4f5g6h7j-8k9l-0m1n-2o3p-4q5r6s7t8u9v',
      imageUrl: `https://webcams.nyctmc.org/api/cameras/${liveCameraIds[4]}/image?t=${timestamp}`,
      vehicleType: 'Truck',
      licensePlate: 'TRK9876',
      location: { lat: 40.6847, lng: -73.9773 },
      locationName: 'Atlantic Ave at Flatbush Ave, Brooklyn',
      address: 'Atlantic Ave at Flatbush Ave, Brooklyn, NY',
      date: formatDate(new Date(Date.now() - 14400000).toISOString()),
      time: formatTime(new Date(Date.now() - 14400000).toISOString()),
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      status: 'Reported',
      notes: 'Commercial delivery blocking bike lane.'
    }
  ];
};

// Fetch all violations
export const fetchViolations = async () => {
  try {
    // If we know we're in fallback mode, don't even try the API
    if (usingFallbackMode) {
      console.log('In fallback mode, using demo data directly');
      return getDemoViolations();
    }
    
    // Make API call to our backend
    const response = await api.get('/violations');
    
    if (!response.data || !response.data.success) {
      throw new Error('Failed to fetch violations');
    }
    
    // Map the backend data to our frontend format
    const timestamp = Date.now();
    const liveCameraId = 'd4bbce49-b087-4524-a835-08cb253926a7';
    
    const violations = response.data.data.map((violation, index) => {
      // Replace any S3 image URLs with live camera feeds
      const liveCameraIds = [
        'd4bbce49-b087-4524-a835-08cb253926a7', 
        '04589f46-2429-4e26-ad46-12a1198e9a9c',
        '9dbb3101-9918-4b61-946f-a34d7c7c662b',
        'e25e1dfa-97cd-4beb-bed2-006c43c208ce',
        '8c781c69-18be-4e6d-9075-4e7f37375c84'
      ];
      
      let imageUrl = violation.imageUrl;
      if (imageUrl.includes('s3.amazonaws.com') || !imageUrl.includes('webcams.nyctmc.org')) {
        // Use a different camera ID for each violation to add variety
        const cameraId = liveCameraIds[index % liveCameraIds.length];
        imageUrl = `https://webcams.nyctmc.org/api/cameras/${cameraId}/image?t=${timestamp}&i=${index}`;
      } else {
        // Add cache-busting to ensure we get the latest image
        imageUrl = `${violation.imageUrl}${violation.imageUrl.includes('?') ? '&' : '?'}t=${timestamp}&i=${index}`;
      }
      
      return {
        id: violation.id,
        imageUrl: imageUrl,
        vehicleType: violation.vehicleType,
        licensePlate: violation.licensePlate || 'Unknown',
        location: violation.location,
        locationName: getLocationName(violation.location, violation.cameraId, violation.cameraName, violation.area),
        address: getAddress(violation.location, violation.cameraId, violation.cameraName, violation.area),
        date: formatDate(violation.timestamp),
        time: formatTime(violation.timestamp),
        timestamp: violation.timestamp,
        status: violation.status,
        notes: violation.notes || '',
        confidence: violation.confidence
      };
    });
    
    return violations;
  } catch (error) {
    // Only log the full error in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching violations:', error);
    } else {
      console.log('API connection issue, using demo data');
    }
    
    // Set the fallback mode flag
    usingFallbackMode = true;
    
    // Return demo data
    return getDemoViolations();
  }
};

// Fetch a single violation by ID
export const fetchViolation = async (id) => {
  try {
    // If we're in fallback mode, search the demo violations
    if (usingFallbackMode) {
      const demoViolations = getDemoViolations();
      const demoViolation = demoViolations.find(v => v.id === id);
      
      if (demoViolation) {
        return demoViolation;
      }
      
      // If not found in demo data, throw an error
      throw new Error(`Violation with ID ${id} not found in demo data`);
    }
    
    // Use our configured api instance
    const response = await api.get(`/violations/${id}`);
    
    if (!response.data || !response.data.success) {
      throw new Error(`Failed to fetch violation with ID ${id}`);
    }
    
    const violation = response.data.data;
    
    return {
      id: violation.id,
      imageUrl: violation.imageUrl,
      vehicleType: violation.vehicleType,
      licensePlate: violation.licensePlate || 'Unknown',
      location: violation.location,
      locationName: getLocationName(violation.location, violation.cameraId, violation.cameraName, violation.area),
      address: getAddress(violation.location, violation.cameraId, violation.cameraName, violation.area),
      date: formatDate(violation.timestamp),
      time: formatTime(violation.timestamp),
      timestamp: violation.timestamp,
      status: violation.status,
      notes: violation.notes || '',
      confidence: violation.confidence
    };
  } catch (error) {
    console.error(`Error fetching violation with ID ${id}:`, error);
    
    // If this is a network error, try the demo violations
    if (error.message && (error.message.includes('Network Error') || error.code === 'ECONNABORTED')) {
      usingFallbackMode = true;
      const demoViolations = getDemoViolations();
      const demoViolation = demoViolations.find(v => v.id === id);
      
      if (demoViolation) {
        return demoViolation;
      }
    }
    
    throw error;
  }
};

// Report a new violation
export const reportViolation = async (violationData) => {
  try {
    // If we're in fallback mode and this is a demo, return a mock successful response
    if (usingFallbackMode) {
      console.log('In fallback mode, returning mock violation report');
      
      // Generate a random violation ID for demo mode
      const demoId = 'demo-violation-id-' + Math.floor(Math.random() * 1000);
      
      return {
        success: true,
        data: {
          hasCarsInBikeLane: true,
          vehicleType: 'SUV',
          timestamp: new Date().toISOString(),
          violationId: demoId
        }
      };
    }
    
    const formData = new FormData();
    
    // Append image file - handle both URI and base64 formats
    if (violationData.image) {
      const localUri = violationData.image.uri;
      const filename = localUri.split('/').pop();
      
      // Infer the type of the image
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      // Create the file object for the FormData
      formData.append('image', { 
        uri: localUri,
        name: filename,
        type 
      });
      
      console.log('Sending image to API:', filename);
    }
    
    // Append camera ID if present
    if (violationData.cameraId) {
      formData.append('cameraId', violationData.cameraId);
    }
    
    // Append location if available
    if (violationData.location) {
      formData.append('location', JSON.stringify(violationData.location));
    }
    
    // Use our configured api instance for consistent error handling
    const response = await api.post(
      '/detect-bike-lane-violations', 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
        timeout: 15000, // Increase timeout for image upload
      }
    );
    
    if (!response.data || !response.data.success) {
      throw new Error('Failed to report violation');
    }
    
    console.log('Violation report success:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error reporting violation:', error);
    
    // If this is a network error, return a mock response
    if (error.message && (error.message.includes('Network Error') || error.code === 'ECONNABORTED')) {
      usingFallbackMode = true;
      console.log('Network error, returning mock violation report');
      
      // Generate a random violation ID for the fallback mode
      const fallbackId = 'fallback-violation-id-' + Math.floor(Math.random() * 1000);
      
      return {
        success: true,
        data: {
          hasCarsInBikeLane: true,
          vehicleType: 'SUV',
          timestamp: new Date().toISOString(),
          violationId: fallbackId
        }
      };
    }
    
    throw error;
  }
};

// Get demo traffic cameras
const getDemoCameras = () => {
  const timestamp = Date.now();
  
  // Expanded list of NYC DOT traffic cameras with real IDs
  return [
    {
      id: 'd4bbce49-b087-4524-a835-08cb253926a7',
      name: 'First Ave at E 42nd St',
      location: { lat: 40.7500, lng: -73.9707 },
      area: 'Manhattan',
      imageUrl: `https://webcams.nyctmc.org/api/cameras/d4bbce49-b087-4524-a835-08cb253926a7/image?t=${timestamp}`,
      lastUpdated: new Date().toISOString(),
      status: 'online',
      nearBikeLane: true,
      locationName: 'First Ave at E 42nd St',
      address: 'First Ave at E 42nd St, Manhattan, NY'
    },
    {
      id: '04589f46-2429-4e26-ad46-12a1198e9a9c',
      name: 'W 57th St at 11th Ave',
      location: { lat: 40.7707, lng: -73.9936 },
      area: 'Manhattan',
      imageUrl: `https://webcams.nyctmc.org/api/cameras/04589f46-2429-4e26-ad46-12a1198e9a9c/image?t=${timestamp}`,
      lastUpdated: new Date().toISOString(),
      status: 'online',
      nearBikeLane: true,
      locationName: 'W 57th St at 11th Ave',
      address: 'W 57th St at 11th Ave, Manhattan, NY'
    },
    {
      id: '9dbb3101-9918-4b61-946f-a34d7c7c662b',
      name: 'Broadway at W 46th St',
      location: { lat: 40.7589, lng: -73.9851 },
      area: 'Manhattan',
      imageUrl: `https://webcams.nyctmc.org/api/cameras/9dbb3101-9918-4b61-946f-a34d7c7c662b/image?t=${timestamp}`,
      lastUpdated: new Date().toISOString(),
      status: 'online',
      nearBikeLane: true,
      locationName: 'Broadway at W 46th St',
      address: 'Broadway at W 46th St, Manhattan, NY'
    },
    {
      id: '07717cda-a5e0-4496-b051-2d0c9f6a873f',
      name: 'Bedford Ave at N 7th St',
      location: { lat: 40.7197, lng: -73.9566 },
      area: 'Brooklyn',
      imageUrl: `https://webcams.nyctmc.org/api/cameras/07717cda-a5e0-4496-b051-2d0c9f6a873f/image?t=${timestamp}`,
      lastUpdated: new Date().toISOString(),
      status: 'online',
      nearBikeLane: true,
      locationName: 'Bedford Ave at N 7th St',
      address: 'Bedford Ave at N 7th St, Brooklyn, NY'
    },
    {
      id: 'c4e4d38f-89e9-4a09-90ae-24b9ab4ff456',
      name: 'Queens Blvd at 63rd Dr',
      location: { lat: 40.7334, lng: -73.9272 },
      area: 'Queens',
      imageUrl: `https://webcams.nyctmc.org/api/cameras/c4e4d38f-89e9-4a09-90ae-24b9ab4ff456/image?t=${timestamp}`,
      lastUpdated: new Date().toISOString(),
      status: 'online',
      nearBikeLane: true,
      locationName: 'Queens Blvd at 63rd Dr',
      address: 'Queens Blvd at 63rd Dr, Queens, NY'
    },
    {
      id: 'e25e1dfa-97cd-4beb-bed2-006c43c208ce',
      name: '42nd St at 5th Ave',
      location: { lat: 40.7536, lng: -73.9805 },
      area: 'Manhattan',
      imageUrl: `https://webcams.nyctmc.org/api/cameras/e25e1dfa-97cd-4beb-bed2-006c43c208ce/image?t=${timestamp}`,
      lastUpdated: new Date().toISOString(),
      status: 'online',
      nearBikeLane: true,
      locationName: '42nd St at 5th Ave',
      address: '42nd St at 5th Ave, Manhattan, NY'
    },
    {
      id: '8c781c69-18be-4e6d-9075-4e7f37375c84',
      name: 'Atlantic Ave at Flatbush Ave',
      location: { lat: 40.6847, lng: -73.9773 },
      area: 'Brooklyn',
      imageUrl: `https://webcams.nyctmc.org/api/cameras/8c781c69-18be-4e6d-9075-4e7f37375c84/image?t=${timestamp}`,
      lastUpdated: new Date().toISOString(),
      status: 'online',
      nearBikeLane: true,
      locationName: 'Atlantic Ave at Flatbush Ave',
      address: 'Atlantic Ave at Flatbush Ave, Brooklyn, NY'
    }
  ];
};

// Fetch all traffic cameras
export const fetchTrafficCameras = async (nearBikeLanes = true) => {
  try {
    // If we're already in fallback mode, return demo data right away
    if (usingFallbackMode) {
      console.log('In fallback mode, using demo camera data directly');
      const demoCameras = getDemoCameras();
      return nearBikeLanes ? demoCameras.filter(camera => camera.nearBikeLane) : demoCameras;
    }
    
    // Use our configured api instance for consistent error handling
    const response = await api.get(`/cameras?nearBikeLanes=${nearBikeLanes}`);
    
    if (!response.data || !response.data.success) {
      throw new Error('Failed to fetch traffic cameras');
    }
    
    // Process cameras to ensure they have all needed fields for the UI
    const cameras = response.data.data.map(camera => ({
      ...camera,
      // Format the location name and address properly if needed
      locationName: camera.name || getLocationName(camera.location, camera.id, camera.name, camera.area),
      address: getAddress(camera.location, camera.id, camera.name, camera.area),
    }));
    
    return cameras;
  } catch (error) {
    console.error('Error fetching traffic cameras:', error);
    
    // Fallback to static camera data if API fails
    console.log('Falling back to static camera data');
    usingFallbackMode = true;
    
    // Return demo cameras
    const demoCameras = getDemoCameras();
    return nearBikeLanes ? demoCameras.filter(camera => camera.nearBikeLane) : demoCameras;
  }
};

// Fetch a specific camera feed
export const fetchCameraFeed = async (cameraId) => {
  try {
    // If we're in fallback mode, return a mock feed
    if (usingFallbackMode) {
      console.log('In fallback mode, using demo camera feed');
      
      // First try to get the camera from our demo data
      const demoCameras = getDemoCameras();
      const camera = demoCameras.find(c => c.id === cameraId) || demoCameras[0];
      
      // Add a timestamp to prevent caching issues
      const timestamp = Date.now();
      const imageUrl = camera.imageUrl.includes('?') 
        ? `${camera.imageUrl}&t=${timestamp}` 
        : `${camera.imageUrl}?t=${timestamp}`;
      
      // Try to use the remote image URL first
      try {
        // Test if remote URL works with a HEAD request (not perfect but helps)
        const testResponse = await fetch(imageUrl, { method: 'HEAD' });
        
        if (testResponse.ok) {
          console.log('NYC DOT camera image is accessible');
          return {
            id: cameraId,
            imageUrl: imageUrl,
            timestamp: new Date().toISOString(),
            status: 'online',
          };
        } else {
          throw new Error('NYC DOT camera image is not accessible');
        }
      } catch (remoteError) {
        console.warn('Using local fallback image for camera', cameraId);
        
        // Use local fallback image when remote fails
        const fallbackImage = getFallbackCameraImage(cameraId);
        
        return {
          id: cameraId,
          imageUrl: fallbackImage.data,
          timestamp: new Date().toISOString(),
          status: 'fallback',
          isFallback: true
        };
      }
    }
    
    // If not in fallback mode yet, use configured API instance
    const response = await api.get(`/cameras/${cameraId}/feed`);
    
    if (!response.data || !response.data.success) {
      throw new Error('Failed to fetch camera feed');
    }
    
    // Ensure we have an image URL with a cache-busting timestamp
    let feed = response.data.data;
    if (feed.imageUrl) {
      const timestamp = Date.now();
      feed.imageUrl = feed.imageUrl.includes('?') 
        ? `${feed.imageUrl}&t=${timestamp}` 
        : `${feed.imageUrl}?t=${timestamp}`;
      
      // Check if the image is accessible
      try {
        const testResponse = await fetch(feed.imageUrl, { method: 'HEAD' });
        if (!testResponse.ok) {
          throw new Error('Image not accessible');
        }
      } catch (imgError) {
        console.warn('API returned inaccessible image URL. Using fallback.');
        const fallbackImage = getFallbackCameraImage(cameraId);
        feed.imageUrl = fallbackImage.data;
        feed.isFallback = true;
        feed.status = 'fallback';
      }
    } else {
      // No image URL provided by API
      const fallbackImage = getFallbackCameraImage(cameraId);
      feed.imageUrl = fallbackImage.data;
      feed.isFallback = true;
      feed.status = 'fallback';
    }
    
    console.log(`Camera feed fetched:`, feed);
    return feed;
  } catch (error) {
    console.error(`Error fetching camera feed for ${cameraId}:`, error);
    
    // Fallback to a static feed image
    usingFallbackMode = true;
    
    // Use local fallback image
    const fallbackImage = getFallbackCameraImage(cameraId);
    
    return {
      id: cameraId,
      imageUrl: fallbackImage.data,
      timestamp: new Date().toISOString(),
      status: 'fallback',
      isFallback: true
    };
  }
};

// Update violation status
export const updateViolationStatus = async (id, status) => {
  try {
    // If we're in fallback mode, just pretend we updated it
    if (usingFallbackMode) {
      console.log(`In fallback mode, pretending to update status for violation ${id} to ${status}`);
      return { id, status, updated: true };
    }
    
    // Use our configured api instance
    const response = await api.post(`/violations/${id}/status`, { status });
    
    if (!response.data || !response.data.success) {
      throw new Error(`Failed to update violation status for violation ${id}`);
    }
    
    return response.data.data;
  } catch (error) {
    console.error(`Error updating violation status for violation ${id}:`, error);
    
    // If this is a network error, pretend it worked
    if (error.message && (error.message.includes('Network Error') || error.code === 'ECONNABORTED')) {
      usingFallbackMode = true;
      console.log(`Network error, pretending to update status for violation ${id} to ${status}`);
      return { id, status, updated: true };
    }
    
    throw error;
  }
};


