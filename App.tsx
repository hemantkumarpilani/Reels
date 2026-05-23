import 'react-native-gesture-handler';
import { Platform, StatusBar, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Navigation from './src/navigation/Navigation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { persistor, store } from './src/redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import Config from 'react-native-config';

const giphyapikey = Config.GIPHY_API_KEY;
console.log('giphyapikey', giphyapikey);

GoogleSignin.configure({
  webClientId:
    '606947446763-5n90gf9kbg5ojmrog650bc92t4h1i3fl.apps.googleusercontent.com',
  forceCodeForRefreshToken: true,
  offlineAccess: false,
  iosClientId:
    '606947446763-ci21mmkg7cb9egfl84u6nralrc53t1e7.apps.googleusercontent.com',
});
const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar
        translucent={Platform.OS === 'ios'}
        backgroundColor={'transparent'}
      />
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Navigation />
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default App;

const styles = StyleSheet.create({});
