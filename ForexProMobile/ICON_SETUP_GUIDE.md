# App Icon Generation Guide for Fusion Markets

## Current Icon Status
- ✅ Basic icon.png exists (1024x1024)
- ✅ Adaptive icon exists for Android
- ✅ Favicon exists for web

## Required Icon Sizes for Production

### iOS Icons
- 180x180 (iPhone)
- 167x167 (iPad Pro)
- 152x152 (iPad)
- 120x120 (iPhone)
- 87x87 (iPhone small)
- 80x80 (iPad small)
- 76x76 (iPad)
- 58x58 (iPhone small)
- 40x40 (iPad small)
- 29x29 (Settings)

### Android Icons
- 192x192 (xxxhdpi)
- 144x144 (xxhdpi)
- 96x96 (xhdpi)
- 72x72 (hdpi)
- 48x48 (mdpi)

## Icon Design Guidelines
1. **Brand Colors**: Use Fusion Markets purple gradient (#6A4AE6 to #982BDC)
2. **Logo**: Simplified version of the full logo for small sizes
3. **Background**: Dark theme (#0B0D1A) or transparent
4. **Padding**: 10% safe area around the logo
5. **Format**: PNG with transparency

## Expo Icon Generation
Expo automatically generates all required sizes from the 1024x1024 icon.png file.

## Build Commands
```bash
# Generate app icons
expo install expo-app-icon-utils
npx expo-app-icon-utils generate

# Build for stores
eas build --platform ios
eas build --platform android
```

## Notes
- Current icons should work for development and basic builds
- For App Store/Play Store submission, ensure icons follow platform guidelines
- Test icons on actual devices to ensure visibility and clarity
