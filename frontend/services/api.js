import axios from 'axios';
import mockImageData from '../assets/mockImageData';

// For hackathon demo, using mock data
const MOCK_VIOLATIONS = [
  {
    id: 1,
    imageUrl: mockImageData, // Use encoded image data
    vehicleType: 'SUV',
    licensePlate: 'ABC1234',
    location: {
      lat: 40.7128,
      lng: -74.0060
    },
    locationName: 'Bedford Ave, Brooklyn',
    address: '123 Bedford Avenue, Brooklyn, NY 11211',
    date: '2025-06-20',
    time: '15:42',
    timestamp: '2025-06-20 15:42:30',
    status: 'Reported',
    notes: 'Vehicle parked in bike lane for approximately 25 minutes.'
  },  {
    id: 2,
    imageUrl: mockImageData, // Use encoded image data
    vehicleType: 'Taxi',
    licensePlate: 'T505623C',
    location: {
      lat: 40.7282,
      lng: -73.9942
    },
    locationName: '1st Ave, Manhattan',
    address: '401 1st Avenue, New York, NY 10010',
    date: '2025-06-21',
    time: '09:15',
    timestamp: '2025-06-21 09:15:12',
    status: 'Pending',
    notes: null
  },  {
    id: 3,
    imageUrl: mockImageData, // Use encoded image data
    vehicleType: 'Delivery Van',
    licensePlate: 'XYZ9876',
    location: {
      lat: 40.7328,
      lng: -74.0027
    },
    locationName: '8th Ave, Manhattan',
    address: '512 8th Avenue, New York, NY 10018',
    date: '2025-06-21',
    time: '11:30',
    timestamp: '2025-06-21 11:30:45',
    status: 'Reported',
    notes: 'Repeated violation - 3rd time this week.'
  },  {
    id: 4,
    imageUrl: mockImageData, // Use encoded image data
    vehicleType: 'Police Car',
    licensePlate: 'NYPD2567',
    location: {
      lat: 40.7193,
      lng: -73.9879
    },
    locationName: 'DeKalb Ave, Brooklyn',
    address: '29 DeKalb Avenue, Brooklyn, NY 11201',
    date: '2025-06-19',
    time: '16:50',
    timestamp: '2025-06-19 16:50:22',
    status: 'Under Review',
    notes: null
  },
];

// Base URL for the API
// For a real app, this would be your backend API URL
const API_BASE_URL = 'https://api.bikelanesentinel.org';

// Fetch all violations
export const fetchViolations = async () => {
  try {
    // For a real app:
    // const response = await axios.get(`${API_BASE_URL}/violations`);
    // return response.data;
    
    // For the hackathon demo, return mock data
    return MOCK_VIOLATIONS;
  } catch (error) {
    console.error('Error fetching violations:', error);
    throw error;
  }
};

// Fetch a single violation by ID
export const fetchViolation = async (id) => {
  try {
    // For a real app:
    // const response = await axios.get(`${API_BASE_URL}/violations/${id}`);
    // return response.data;
    
    // For the hackathon demo, find in mock data
    const violation = MOCK_VIOLATIONS.find(v => v.id === id);
    if (!violation) {
      throw new Error(`Violation with ID ${id} not found`);
    }
    return violation;
  } catch (error) {
    console.error(`Error fetching violation ${id}:`, error);
    throw error;
  }
};

// Report a new violation
export const reportViolation = async (violationData) => {
  try {
    // For a real app:
    // const response = await axios.post(`${API_BASE_URL}/violations`, violationData);
    // return response.data;
    
    // For the hackathon demo, just log it
    console.log('Reporting violation:', violationData);
    return {
      ...violationData,
      id: Math.floor(Math.random() * 1000) + 5,
      status: 'Pending',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error reporting violation:', error);
    throw error;
  }
};
