import React, { useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRoamStore } from '../store/useRoamStore';
import { FilterBar } from '../components/FilterBar';
import { FriendsFilterBar } from '../components/FriendsFilterBar';
import { Colors, TypeColors, TypeEmojis, Spacing, Radius } from '../theme';
import { Experience } from '../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

// Lazy import MapView to prevent top-level native module crash before bridge ready
const MapView = require('react-native-maps').default;
const { Marker } = require('react-native-maps');

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CANCUN_REGION = {
  latitude: 21.12,
  longitude: -86.81,
  latitudeDelta: 0.18,
  longitudeDelta: 0.12,
};

export function MapScreen() {
  const mapRef = useRef<any>(null);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [mapReady, setMapReady] = useState(false);

  const {
    activeFilter, setFilter,
    activeFriendIds, toggleFriend,
    friends, selectExperience,
    getVisibleExperiences,
  } = useRoamStore();

  const visible = getVisibleExperiences();

  const handleMarkerPress = useCallback(
    (exp: Experience) => {
      selectExperience(exp.id);
      navigation.navigate('Detail', { experienceId: exp.id });
    },
    [navigation, selectExperience]
  );

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={CANCUN_REGION}
        showsUserLocation
        showsMyLocationButton={false}
        onMapReady={() => setMapReady(true)}
      >
        {mapReady && visible.map((exp) => (
          <Marker
            key={exp.id}
            coordinate={{ latitude: exp.latitude, longitude: exp.longitude }}
            onPress={() => handleMarkerPress(exp)}
          >
            <View style={[styles.pin, { backgroundColor: TypeColors[exp.type] }]}>
              <Text style={styles.pinEmoji}>{TypeEmojis[exp.type]}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Top overlay */}
      <View style={[styles.topOverlay, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.destPill}>
          <Text style={styles.destText}>📍 Cancún, Mexico</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{visible.length}</Text>
          </View>
        </View>
        <View style={styles.filterContainer}>
          <FilterBar active={activeFilter} onSelect={setFilter} />
        </View>
        <FriendsFilterBar
          friends={friends}
          activeFriendIds={activeFriendIds}
          onToggle={toggleFriend}
        />
      </View>

      {/* Log button */}
      <TouchableOpacity
        style={[styles.logBtn, { bottom: insets.bottom + 96 }]}
        onPress={() => navigation.navigate('Log')}
        activeOpacity={0.9}
      >
        <Text style={styles.logBtnText}>+ Log memory</Text>
      </TouchableOpacity>

      {/* Recenter */}
      <TouchableOpacity
        style={[styles.locationBtn, { bottom: insets.bottom + 96 }]}
        onPress={() => mapRef.current?.animateToRegion(CANCUN_REGION, 600)}
        activeOpacity={0.85}
      >
        <Text style={styles.locationIcon}>◎</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.sand },
  topOverlay: { position: 'absolute', top: 0, left: 0, right: 0 },
  destPill: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'center',
    backgroundColor: Colors.pine,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    borderRadius: Radius.full, marginBottom: Spacing.sm, gap: Spacing.sm,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  destText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 10, paddingHorizontal: 7, paddingVertical: 1,
  },
  countText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  filterContainer: {
    backgroundColor: 'rgba(253,250,245,0.95)',
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  pin: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 4, elevation: 4,
    borderWidth: 2, borderColor: '#fff',
  },
  pinEmoji: { fontSize: 17 },
  logBtn: {
    position: 'absolute', alignSelf: 'center',
    backgroundColor: Colors.terracotta,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    shadowColor: Colors.terracotta,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  logBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  locationBtn: {
    position: 'absolute', right: Spacing.lg,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 3,
  },
  locationIcon: { fontSize: 20, color: Colors.pine },
});
