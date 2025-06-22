// Local fallback camera images for when the NYC traffic cameras API fails
// These will be used in demo mode and when connections to the NYC DOT cameras fail

// Export base64 encoded images to ensure they can be displayed offline
export const fallbackCameraImages = {
  // Camera 1
  'd4bbce49-b087-4524-a835-08cb253926a7': {
    // Example of a small Base64 placeholder image (gray square)
    // In a real app, you would include actual Base64-encoded images here
    data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsAQMAAABDsxw2AAAAA1BMVEWSk5SrhSQpAAAAI0lEQVR42u3BMQEAAADCIPunNsU+YAAAAAAAAAAAAAAA4G8SAAABK9d8TwAAAABJRU5ErkJggg==',
    name: 'First Ave at E 42nd St',
  },
  
  // Camera 2
  '07717cda-a5e0-4496-b051-2d0c9f6a873f': {
    data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsAQMAAABDsxw2AAAAA1BMVEWSk5SrhSQpAAAAI0lEQVR42u3BMQEAAADCIPunNsU+YAAAAAAAAAAAAAAA4G8SAAABK9d8TwAAAABJRU5ErkJggg==',
    name: 'Bedford Ave at N 7th St',
  },
  
  // Camera 3
  'c4e4d38f-89e9-4a09-90ae-24b9ab4ff456': {
    data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsAQMAAABDsxw2AAAAA1BMVEWSk5SrhSQpAAAAI0lEQVR42u3BMQEAAADCIPunNsU+YAAAAAAAAAAAAAAA4G8SAAABK9d8TwAAAABJRU5ErkJggg==',
    name: 'Queens Blvd at 63rd Dr',
  },
  
  // Default camera - used when no camera ID matches
  'default': {
    data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsAQMAAABDsxw2AAAAA1BMVEWSk5SrhSQpAAAAI0lEQVR42u3BMQEAAADCIPunNsU+YAAAAAAAAAAAAAAA4G8SAAABK9d8TwAAAABJRU5ErkJggg==',
    name: 'NYC Traffic Camera',
  }
};

// Function to get a camera image by ID
export const getFallbackCameraImage = (cameraId) => {
  return fallbackCameraImages[cameraId] || fallbackCameraImages.default;
};
