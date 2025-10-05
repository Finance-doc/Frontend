// app/navigation.ts
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack'; // createStackNavigator import
import Chat from './(tabs)/chat'; // Home 화면
import Content from './(tabs)/content'; // Home 화면
import Home from './(tabs)/home'; // Home 화면
import Login from './login'; // Login 화면

export type RootStackParamList = {
  Home: undefined; 
  Login: undefined; 
  Content: undefined; 
  Chat: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Content" component={Content} />
        <Stack.Screen name="Chat" component={Chat} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
