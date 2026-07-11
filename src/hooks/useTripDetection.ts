import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { useRoamStore } from '../store/useRoamStore';
import { DetectedCity } from '../types';

async function reverseGeocode(lat: number, lng: number): Promise<{ city: string; country: string } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'User-Agent': 'RoamApp/1.0' } }
    );
    const data = await res.json();
    const city =
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.county ||
      'Unknown';
    const country = data.address?.country || '';
    return { city, country };
  } catch {
    return null;
  }
}

export function useTripDetection() {
  const { detectedCity, setDetectedCity, markCityPrompted } = useRoamStore();
  const cityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCityRef = useRef<string | null>(null);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 1000,
          timeInterval: 300000,
        },
        async (loc) => {
          const geo = await reverseGeocode(loc.coords.latitude, loc.coords.longitude);
          if (!geo) return;

          const newCity = `${geo.city},${geo.country}`;
          if (newCity !== lastCityRef.current) {
            lastCityRef.current = newCity;
            if (cityTimerRef.current) clearTimeout(cityTimerRef.current);

            // 24 hours in new city → prompt to log
            // Set to 10s for testing: change 24 * 60 * 60 * 1000 to 10000
            cityTimerRef.current = setTimeout(() => {
              const detected: DetectedCity = {
                city: geo.city,
                country: geo.country,
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                arrivedAt: new Date().toISOString(),
                hasPrompted: false,
              };
              setDetectedCity(detected);
            }, 24 * 60 * 60 * 1000);
          }
        }
      );
    })();

    return () => {
      subscription?.remove();
      if (cityTimerRef.current) clearTimeout(cityTimerRef.current);
    };
  }, []);

  return { detectedCity, markCityPrompted };
}
