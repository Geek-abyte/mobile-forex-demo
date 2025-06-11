# EAS Build Guide for ForexProMobile

This guide will help you build your React Native Expo app using EAS (Expo Application Services) for remote testing.

## Prerequisites

1. **Expo Account**: Make sure you have an Expo account at [expo.dev](https://expo.dev)
2. **EAS CLI**: Already installed in this project
3. **Git**: Ensure your project is committed to git (EAS requires this)

## Setup Steps

### 1. Login to EAS
```bash
npx eas login
```
Enter your Expo account credentials when prompted.

### 2. Configure Your Project
```bash
npx eas build:configure
```
This will set up your project for EAS builds if not already configured.

### 3. Build Profiles Available

#### Development Build
- For testing with Expo Go or custom development client
- Includes debugging tools
```bash
npm run build:development
```

#### Preview Build
- For internal testing and sharing
- Creates APK for Android, simulator build for iOS
```bash
npm run build:preview
```

#### Production Build
- For app store deployment
- Optimized and signed
```bash
npm run build:all
```

### 4. Platform-Specific Builds

#### Android Only
```bash
npm run build:android
# or
npx eas build --platform android
```

#### iOS Only
```bash
npm run build:ios
# or
npx eas build --platform ios
```

## Remote Testing Options

### 1. Preview Builds (Recommended for Testing)
```bash
npm run build:preview
```
- Creates installable APK for Android
- Creates simulator build for iOS
- Perfect for sharing with testers

### 2. Development Builds
```bash
npm run build:development
```
- Includes development tools
- Allows hot reloading and debugging
- Ideal for active development

## Build Process

1. **Start a build**:
   ```bash
   npm run build:preview
   ```

2. **Monitor progress**:
   - Visit [expo.dev/builds](https://expo.dev/builds)
   - Or use `npx eas build:list` to see build status

3. **Download and distribute**:
   - Once complete, you'll get download links
   - Share APK links for Android testing
   - Use TestFlight or similar for iOS

## Sharing Your Build

### Android
- Direct APK download link provided after build
- Can be installed directly on Android devices
- Share the link with testers

### iOS
- Upload to TestFlight for beta testing
- Or use Apple Configurator for direct installation
- Requires Apple Developer account for device testing

## Build Status Commands

```bash
# List all builds
npx eas build:list

# Check specific build
npx eas build:view [BUILD_ID]

# Cancel a build
npx eas build:cancel [BUILD_ID]
```

## Troubleshooting

### Common Issues

1. **Git not committed**: Commit your changes before building
2. **Authentication**: Run `npx eas login` if you get auth errors  
3. **Build failures**: Check the build logs at expo.dev/builds

### Build Logs
- Always check build logs for detailed error information
- Available at expo.dev/builds or via CLI

## Environment Variables

If your app uses environment variables, add them to `eas.json`:

```json
{
  "build": {
    "preview": {
      "env": {
        "API_URL": "https://your-api.com"
      }
    }
  }
}
```

## Next Steps

1. Run `npx eas login` to authenticate
2. Commit any uncommitted changes
3. Run `npm run build:preview` for your first test build
4. Monitor the build at expo.dev/builds
5. Share the generated APK/IPA with your testers

Happy building! 🚀
