import UploadReelScreen from '../components/reel/UploadReelScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import SplashScreen from '../screens/auth/SplashScreen';
import HomeScreen from '../screens/dashboard/HomeScreen';
import PickReelScreen from '../screens/reel/PickReelScreen';
import BottomTab from './BottomTab';

export const authStack = [
  {
    name: 'LoginScreen',
    component: LoginScreen,
  },
  {
    name: 'RegisterScreen',
    component: RegisterScreen,
  },
  {
    name: 'SplashScreen',
    component: SplashScreen,
  },
];

export const dashboardStack = [
  {
    name: 'BottomTab',
    component: BottomTab,
  },
  {
    name: 'PickReelScreen',
    component: PickReelScreen,
  },
  {
    name: 'UploadReelScreen',
    component: UploadReelScreen,
  },
];

export const mergedStacks = [...dashboardStack, ...authStack];
