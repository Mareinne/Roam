# 🌿 Roam

> Your friends have been there. Skip the tourist lists.

Roam is a social travel app where friends log, rate, and geotag real experiences on a map — so when you visit a new city, you see what the people you trust actually did, not what's sponsored.

---

## Stack

- **React Native** (Expo SDK 52)
- **expo-router** navigation
- **react-native-maps** — MapKit on iOS, Google Maps on Android
- **zustand** — global state
- **expo-image-picker** — photo uploads
- **expo-haptics** — tactile feedback
- **expo-location** — GPS pinning

---

## Getting Started (local dev)

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli eas-cli`
- iOS: Xcode 15+ (Mac only) or Expo Go on your phone
- Android: Android Studio or Expo Go

### Install

```bash
git clone https://github.com/Mareinne/Roam.git
cd Roam
npm install
npx expo start
```

Scan the QR code with **Expo Go** on your phone to run instantly. No Xcode needed for development.

---

## App Store Submission

### 1. Apple Developer Account
Sign up at [developer.apple.com](https://developer.apple.com) ($99/year).

### 2. Configure `eas.json`
Fill in your details:
```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@email.com",
        "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID",
        "appleTeamId": "YOUR_10_CHAR_TEAM_ID"
      }
    }
  }
}
```

### 3. Configure `app.json`
- Set `ios.bundleIdentifier` — must be unique (e.g. `com.yourname.roam`)
- Run `eas init` to get your EAS project ID and paste it into `extra.eas.projectId`

### 4. Build for production

```bash
eas build --platform ios --profile production
```

EAS will handle signing, provisioning profiles, and building a `.ipa`. Takes ~10 minutes.

### 5. Submit to App Store

```bash
eas submit --platform ios
```

Or upload the `.ipa` manually via [App Store Connect](https://appstoreconnect.apple.com).

### 6. App Store Connect setup
- Create a new app at appstoreconnect.apple.com
- Fill in: description, screenshots (6.5" and 5.5" iPhone), keywords, category (Travel), age rating
- Submit for review (~24–48 hours)

---

## Project Structure

```
Roam/
├── App.tsx                  # Entry point
├── app.json                 # Expo config (bundle ID, permissions, splash)
├── eas.json                 # EAS Build + Submit config
├── src/
│   ├── screens/
│   │   ├── MapScreen.tsx    # Main map with friend pins
│   │   ├── ListScreen.tsx   # Filterable, sortable experience list
│   │   ├── DetailScreen.tsx # Full experience detail + directions
│   │   ├── LogScreen.tsx    # Log a new memory
│   │   ├── FriendsScreen.tsx # Follow/unfollow friends
│   │   └── ProfileScreen.tsx # Your logged memories
│   ├── components/
│   │   ├── Avatar.tsx
│   │   ├── TypeBadge.tsx
│   │   ├── StarRating.tsx
│   │   ├── ExperienceCard.tsx
│   │   ├── FilterBar.tsx
│   │   └── FriendsFilterBar.tsx
│   ├── navigation/
│   │   └── AppNavigator.tsx # Bottom tabs + stack navigator
│   ├── store/
│   │   └── useRoamStore.ts  # Zustand global store
│   ├── data/
│   │   └── seed.ts          # Sample experiences + friends
│   ├── types.ts
│   └── theme.ts             # Colors, typography, spacing
└── assets/                  # Icon, splash, adaptive icon
```

---

## Adding a Backend

The app currently runs on local state (Zustand + seed data). To make it multi-user and persistent, connect a backend:

**Recommended stack:**
- **Supabase** — Postgres + auth + real-time + storage (photos)
- **PostGIS** — geospatial queries ("experiences near me")

**Key tables:**
```sql
users (id, name, handle, avatar_url)
experiences (id, user_id, name, type, lat, lng, rating, review, date)
experience_photos (id, experience_id, photo_url)
follows (follower_id, following_id)
```

Replace the Zustand store's seed data with Supabase queries and the app is production-ready.

---

## Environment Variables

Create `.env.local` (never commit this):
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_key  # Android only
```

---

## Required Assets

Add these to `/assets/` before submitting:
- `icon.png` — 1024×1024, no rounded corners (Apple applies mask)
- `splash.png` — 1284×2778 recommended
- `adaptive-icon.png` — 1024×1024 for Android

Use the Roam brand: dark pine green `#1E4010` background, white/green logo.

---

## License

Private. All rights reserved.
