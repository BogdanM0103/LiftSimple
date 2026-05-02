import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import StartWorkout from './screens/StartWorkout';
import History from './screens/History';

const Tab = createBottomTabNavigator();

export default function App() {
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
        <Tab.Screen name="Start Workout" component={StartWorkout} />
        <Tab.Screen name="History" component={History} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
