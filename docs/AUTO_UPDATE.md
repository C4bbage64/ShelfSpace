# Auto-Update Setup

ShelfSpace now has automatic update functionality built-in using `electron-updater`.

## How It Works

1. **Automatic Checking**: The app checks for updates:
   - On startup
   - Every 4 hours while running

2. **User Notifications**: When an update is available, users see a notification in the top-right corner with options to:
   - Download the update
   - Dismiss and check later

3. **Download Progress**: Shows real-time progress with percentage and MB downloaded

4. **Installation**: After download, users can:
   - Restart immediately to install
   - Install later (will install on next app quit)

## Publishing Updates

### 1. Build and Package Your App

```powershell
pnpm run package
```

This creates installable files in the `release/` directory.

### 2. Create a GitHub Release

1. Go to your repository: https://github.com/C4bbage64/shelfspace
2. Click "Releases" → "Draft a new release"
3. Create a new tag (e.g., `v1.0.1`)
4. Upload the installer files from `release/`:
   - Windows: `ShelfSpace Setup 1.0.0.exe` (or `.exe` file)
   - Mac: `.dmg` file
   - Linux: `.AppImage` and `.deb` files
5. Publish the release

### 3. Automatic Updates

Once published, all users will automatically:
- Be notified when the update is available
- Be able to download and install with one click
- Get the new version seamlessly

## Update Behavior

- **Development Mode**: Auto-updater is disabled when running in dev mode
- **Production**: Fully functional with GitHub releases
- **Auto-install**: Updates install automatically when the app quits (unless user chooses "Restart Now")

## Testing Updates

To test the update flow:

1. Create a release with a higher version number than your current build
2. Run the packaged app (not dev mode)
3. The update notification should appear
4. Click "Download" to test the download progress
5. Click "Restart Now" to test installation

## Configuration

The update settings are in `electron-builder.json`:

```json
{
  "publish": {
    "provider": "github",
    "owner": "C4bbage64",
    "repo": "shelfspace"
  }
}
```

## Manual Update Check

Users can also manually check for updates via the Settings page (if you add a button that calls `window.api.checkForUpdates()`).

## Version Bumping

Before creating a new release:

1. Update version in `package.json`:
   ```json
   {
     "version": "1.0.1"
   }
   ```

2. Rebuild and package:
   ```powershell
   pnpm run package
   ```

3. Create the GitHub release with matching version tag

## Troubleshooting

- **Updates not detected**: Ensure GitHub release version is higher than current app version
- **Download fails**: Check internet connection and GitHub release assets are public
- **Install fails**: Try running app as administrator (Windows) or check permissions (Mac/Linux)
