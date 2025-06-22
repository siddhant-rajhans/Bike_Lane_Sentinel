# Camera Error Troubleshooting

## Error: TypeError: Cannot read property 'back' of undefined

If you encounter this error when using the camera feature, it's related to changes in the expo-camera API. The fix has been applied to the codebase, but here's what was changed:

### Import statement
```javascript
// Make sure to import CameraType along with Camera
import { Camera, CameraType } from 'expo-camera';
```

### Camera type usage
```javascript
// Use CameraType directly instead of Camera.Constants.Type
const [type, setType] = useState(CameraType.back);

// When toggling the camera
setType(
  type === CameraType.back
    ? CameraType.front
    : CameraType.back
);
```

### Camera permissions
```javascript
// Use the correct permissions method for your expo-camera version
const { status } = await Camera.requestCameraPermissionsAsync();
setHasPermission(status === 'granted');
```

## Additional Troubleshooting

If you still encounter camera-related issues:

1. Ensure your device has proper camera permissions enabled
2. Update the expo-camera package to the compatible version:
   ```
   cd frontend
   npm install expo-camera@~16.1.8
   ```
3. Try running the cache-clearing script: `./frontend/restart-clean.sh`
4. If the error persists, you might need to completely clear the React Native/Expo cache:
   ```
   cd frontend
   rm -rf node_modules/.cache/
   rm -rf .expo/
   npx expo start --clear
   ```

For more details on the camera implementation, see `CAMERA_API_REFERENCE.md` in the frontend directory.
