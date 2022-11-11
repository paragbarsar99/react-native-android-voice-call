import {StyleSheet, Linking, Text, View, StatusBar} from 'react-native';
import React, {useEffect, useState} from 'react';
import MainNavigator from './app/navigation/NavigationIndex';
import {Provider as UserProvider} from './app/store/Context/UserContext/ContextIndex';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {agoraInitialization} from './app/utils/AgoraInstance';
import createAgoraRtcEngine from 'react-native-agora';
import agoraConfig from './agora.config';

export default function App() {
  const config = {
    screens: {
      HomeStack: {
        initialRouteName: 'Home',
        screens: {
          Home: 'home',
          Receive: 'calling/:userName/:userPhone:/:type',
        },
      },
      Dial: 'dial',
    },
  };

  const linking = {
    prefixes: [`meeting://`],
    // get Initial Url While App opens via any link
    async getInitialUrl() {
      const url = await Linking.getInitialURL();
      console.log('url: ', url);
      return url;
    },
    subscribe(listener) {
      const linkingSubscription = Linking.addEventListener('url', ({url}) => {
        console.log('url from listener: ', url);
        listener(url);
      });
      return () => {
        //clean up event listener
        linkingSubscription.remove();
      };
    },
    config,
  };

  useEffect(() => {
    (async () => {
      await createAgoraRtcEngine.create(agoraConfig.appId);
    })();
  });

  return (
    <NavigationContainer linking={linking} theme={DefaultTheme}>
      <UserProvider>
        <SafeAreaProvider>
          <StatusBar backgroundColor={'white'} barStyle={'dark-content'} />
          <MainNavigator />
        </SafeAreaProvider>
      </UserProvider>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({});
