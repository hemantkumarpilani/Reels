import { View, Text } from 'react-native';
import React, { FC } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { mergedStacks } from './ScreenCollection';
import { UploadProvider } from '../components/uploadservice/UploadContext';

const Stack = createNativeStackNavigator();
const MainNavigator: FC = () => {
  return (
    <UploadProvider>
      <Stack.Navigator
        initialRouteName="SplashScreen"
        screenOptions={{
          headerShown: false,
        }}
      >
        {mergedStacks.map((item, index) => {
          return (
            <Stack.Screen
              key={index}
              name={item.name}
              component={item.component}
            />
          );
        })}
      </Stack.Navigator>
    </UploadProvider>
  );
};

export default MainNavigator;
