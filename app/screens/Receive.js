import React from 'react';
// Import the React Native classes into your project.
import {View, LogBox} from 'react-native';
// Import the Agora SDK classes into your project.

import styles from './styles';
import VideoCallReceiver from './Video/VideoReceiver';
import AudioCallReceiver from './Audio/AudioReceiver';

LogBox.ignoreLogs(['EventEmitter.removeListener']);

export default function Receive({route, navigation}) {
  const {userName, userPhone, type} = route.params;

  return (
    <View style={[styles.container]}>
      {type === 'VideoCall' ? (
        <VideoCallReceiver userName={userName} userPhone={userPhone} />
      ) : (
        <AudioCallReceiver userName={userName} userPhone={userPhone} />
      )}
    </View>
  );
}
