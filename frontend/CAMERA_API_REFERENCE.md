# Expo Camera API Reference

## Camera Types
For camera-facing direction in Expo Camera 16.1.8, use:

```javascript
// Import Camera properly
import { Camera, CameraType } from 'expo-camera';

// Camera types
CameraType.front  // Front-facing camera
CameraType.back   // Back-facing camera (default)

// Example usage
const [type, setType] = useState(CameraType.back);

// Toggle camera direction
setType(
  type === CameraType.back
    ? CameraType.front
    : CameraType.back
);
```

## Camera Permissions
To request camera permissions:

```javascript
// Request camera permissions
const { status } = await Camera.requestCameraPermissionsAsync();
setHasPermission(status === 'granted');
```

## Taking Pictures
To take a picture with the camera:

```javascript
// Using camera ref
const photo = await cameraRef.current.takePictureAsync({
  quality: 0.8,
  base64: false,
  exif: true,
  skipProcessing: false
});

// Access the URI
console.log(photo.uri);
```

## Common Issues
- **TypeError: Cannot read property 'back' of undefined**: 
  - Make sure to import and use `CameraType.back` instead of `Camera.Constants.Type.back`
  - Ensure the Camera and CameraType are properly imported from expo-camera: `import { Camera, CameraType } from 'expo-camera'`

- **Permissions Errors**:
  - Use `Camera.requestCameraPermissionsAsync()` instead of `Camera.requestPermissionsAsync()`

- **Black screen instead of camera preview**:
  - Check that camera permissions are granted
  - Ensure device has a camera and it's not being used by another app
  - Verify the Camera component has appropriate dimensions in your styles
