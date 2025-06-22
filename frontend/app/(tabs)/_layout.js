import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useUser } from '../../context/UserContext';
import LoginScreen from '../login';

export default function TabLayout() {
  const { isAuthenticated, loading } = useUser();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="submit"
        options={{
          title: 'Submit Idea',
          tabBarIcon: ({ size, color }) => (
            <MaterialIcons name="add-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tracker"
        options={{
          title: 'My Ideas',
          tabBarIcon: ({ size, color }) => (
            <MaterialIcons name="track-changes" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Leaderboard',
          tabBarIcon: ({ size, color }) => (
            <MaterialIcons name="leaderboard" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="implemented"
        options={{
          title: 'Implemented',
          tabBarIcon: ({ size, color }) => (
            <MaterialIcons name="check-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}