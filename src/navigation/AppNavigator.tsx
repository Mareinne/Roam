import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Text, View, StyleSheet, Platform } from 'react-native';

import { MapScreen } from '../screens/MapScreen';
import { ListScreen } from '../screens/ListScreen';
import { LogScreen } from '../screens/LogScreen';
import { FriendsScreen } from '../screens/FriendsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { DetailScreen } from '../screens/DetailScreen';
import { Colors } from '../theme';

export type RootStackParamList = {
  Tabs: undefined;
  Detail: { experienceId: string };
  Log: undefined;
};

export type TabParamList = {
  Map: undefined;
  List: undefined;
  Friends: undefined;
  You: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabItem}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiFocused]}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
    </View>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🗺" label="Map" focused={focused} /> }}
      />
      <Tab.Screen
        name="List"
        component={ListScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="☰" label="List" focused={focused} /> }}
      />
      <Tab.Screen
        name="Friends"
        component={FriendsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👥" label="Friends" focused={focused} /> }}
      />
      <Tab.Screen
        name="You"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="You" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Tabs" component={TabNavigator} />
          <Stack.Screen name="Detail" component={DetailScreen} options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="Log" component={LogScreen} options={{ animation: 'slide_from_bottom' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(253,250,245,0.97)',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    height: Platform.OS === 'ios' ? 84 : 68,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 8,
  },
  tabItem: { alignItems: 'center', gap: 2 },
  tabEmoji: { fontSize: 22, opacity: 0.4 },
  tabEmojiFocused: { opacity: 1 },
  tabLabel: { fontSize: 9, fontWeight: '600', color: Colors.muted },
  tabLabelFocused: { color: Colors.pine },
});
