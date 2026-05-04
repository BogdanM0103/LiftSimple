import { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StartWorkout from './screens/StartWorkout';
import History from './screens/History';
import Stats from './screens/Stats';
import { Workout } from './data/types';

const Tab = createBottomTabNavigator();
const STORAGE_KEY = 'workouts';

export default function App() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (!raw) return;
      const parsed: Workout[] = JSON.parse(raw).map((w: any) => ({ ...w, date: new Date(w.date) }));
      setWorkouts(parsed);
    });
  }, []);

  function save(updated: Workout[]) {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setWorkouts(updated);
  }

  function addWorkout(workout: Workout) {
    save([workout, ...workouts]);
  }

  function updateWorkout(workout: Workout) {
    save(workouts.map(w => w.id === workout.id ? workout : w));
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
          {() => <StartWorkout onWorkoutComplete={addWorkout} onWorkoutUpdate={updateWorkout} lastWorkout={workouts[0] ?? null} />}
        </Tab.Screen>
        <Tab.Screen name="History">
          {() => <History workouts={workouts} />}
        </Tab.Screen>
        <Tab.Screen name="Stats">
          {() => <Stats workouts={workouts} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
