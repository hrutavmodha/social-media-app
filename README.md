# Social Media App

A full-stack, native-first social media application built with a performance-oriented tech stack across all major platforms.

## Project Overview

This project aims to deliver a high-performance, native experience on Web, Android, iOS, Linux (GTK), macOS (AppKit), and Windows (WinUI). The backend is a robust Go service backed by PostgreSQL, Redis, and MinIO.

## Repository Map

- `server/`: Go backend (Chi, sqlc, pgx)
- `client/web/`: Vanilla HTML/CSS/JS (esbuild)
- `client/mobile/android/`: Kotlin (Jetpack Compose, Hilt, Retrofit)
- `client/mobile/ios/`: Swift (SwiftUI, Combine, URLSession)
- `client/desktop/linux/`: C (GTK4, Meson)
- `client/desktop/macos/`: Swift (AppKit, Cocoa)
- `client/desktop/windows/`: C++ (WinUI 3, Windows App SDK)

## Build Instructions (Stubs)

### Server
1. Navigate to `server/`
2. Run `make build` or `go build ./cmd/api`

### Web Client
1. Navigate to `client/web/`
2. Run `npm install`
3. Run `npm run build`

### Android Client
1. Open `client/mobile/android/` in Android Studio.
2. Build and run the `app` module.

### iOS Client
1. Open `client/mobile/ios/SocialApp.xcodeproj` in Xcode.
2. Select target and run.

### Linux Desktop Client
1. Navigate to `client/desktop/linux/`
2. Run `meson setup build`
3. Run `ninja -C build`

### macOS Desktop Client
1. Open `client/desktop/macos/SocialApp.xcodeproj` in Xcode.
2. Select target and run.

### Windows Desktop Client
1. Open `client/desktop/windows/SocialApp.sln` in Visual Studio.
2. Build and run.
