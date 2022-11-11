/**
 * @format
 */
import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import BackgroundMessage from './app/utils/BackgroundMessage';
import agoraConfig from './agora.config';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('remoteMessage ', remoteMessage);
  const {callerName, callerNumer, uuid, url, fcmToken, title} =
    remoteMessage.data;
  await BackgroundMessage(callerName, callerNumer, uuid, url, fcmToken, title);
});

AppRegistry.registerComponent(appName, () => {
  return App;
});
