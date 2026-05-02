import { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import StartWorkout from './screens/StartWorkout';
import History from './screens/History';
import { Workout } from './data/types';

const Tab = createBottomTabNavigator();

export default function App() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  function addWorkout(workout: Workout) {
    setWorkouts(prev => [workout, ...prev]);
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarIcon: () => null,
          tabBarIconStyle: { display: 'none' },
          tabBarLabelStyle: { fontSize: 15 },
          tabBarItemStyle: { justifyContent: 'center' },
        }}
      >
        <Tab.Screen name="Start Workout">
          {() => <StartWorkout onWorkoutComplete={addWorkout} lastWorkout={workouts[0] ?? null} />}
        </Tab.Screen>
        <Tab.Screen name="History">
          {() => <History workouts={workouts} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
