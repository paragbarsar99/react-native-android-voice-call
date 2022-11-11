import {
  View,
  Text,
  Vibration,
  ToastAndroid,
  Alert,
  StyleSheet,
} from 'react-native';
import React, {useEffect, useReducer} from 'react';
import createAgoraRtcEngine from 'react-native-agora';
import engine, {
  agoraInitialization,
  engineLeave,
} from '../../utils/AgoraInstance';
import agoraConfig from '../../../agora.config';
import {IconButton} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

const reducer = (state, action) => ({...state, ...action});
const initialState = {
  inCall: false,
  remoteUser: [],
  enableSpeakerphone: false,
  openMicrophone: true,
  onSwitchCamera: false,
};

export default function AudioCallReceiver(props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {userName, userPhone} = props;
  const {inCall, openMicrophone, enableSpeakerphone, onSwitchCamera} = state;

  const navigation = useNavigation();

  const engine = createAgoraRtcEngine.instance();

  useEffect(() => {
    (async () => {
      await init();
    })();
    return () => {
      engine.removeListener('JoinChannelSuccess');
      engine.removeListener('UserJoined');
      engine.removeListener('LeaveChannel');
      engine.removeListener('UserOffline');
      engine.destroy();
    };
  }, []);

  // Pass in your App ID through this.state, create and initialize an RtcEngine object.
  const init = async () => {
    // await agoraInitialization();
    // engine = createAgoraRtcEngine.instance();
    engine.joinChannel(agoraConfig.token, agoraConfig.channelName, null, 0);
    engine.addListener('JoinChannelSuccess', ({localUid, channelId}) => {
      // Alert.alert('onJoinChannelSuccess');
      ToastAndroid.show(`${localUid} Joined ${channelId}`, ToastAndroid.LONG);
      dispatch({
        inCall: true,
      });
    });
    // Occurs when a remote user (COMMUNICATION)/ host (LIVE_BROADCASTING) joins the channel.
    engine.addListener('UserJoined', ({localUid, channelId}) => {
      ToastAndroid.show(
        `${localUid} Remote User Joined ${channelId}`,
        ToastAndroid.LONG,
      );
      dispatch({remoteUser: localUid});
    });
    engine.addListener('LeaveChannel', ({localUid}) => {
      Vibration.vibrate([0, 100]);
      dispatch({
        inCall: false,
        remoteUser: null,
      });

      ToastAndroid.showWithGravity(
        `${localUid} Call Ended`,
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
      // engine.destroy();
      navigation.goBack();
    });
    engine.addListener('UserOffline', ({}) => {
      endCall();
    });
  };

  const switchMicrophone = async () => {
    try {
      engine.enableLocalAudio(openMicrophone ? false : true);
      dispatch({
        openMicrophone: !openMicrophone,
      });
    } catch (err) {
      console.warn('enableLocalAudio', err);
    }
  };

  const switchSpeakerphone = () => {
    try {
      engine.setEnableSpeakerphone(!enableSpeakerphone);
      dispatch({enableSpeakerphone: !enableSpeakerphone});
    } catch (err) {
      console.warn('setEnableSpeakerphone', err);
    }
  };

  const endCall = connection => {
    console.log('channelLeave');
    try {
      engine.leaveChannel();
    } catch (error) {
      console.log(error + ' EndCall');
    }
  };
  const onToggleCamera = () => {
    try {
      engine.switchCamera();
      dispatch({onSwitchCamera: !onSwitchCamera});
    } catch (err) {
      console.warn('setEnableToggleCamera', err);
    }
  };

  function CallingActionBtn() {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          backgroundColor: 'white',
          borderRadius: 10,
          bottom: 40,
          marginHorizontal: '20%',
          padding: 10,
          position: 'absolute',
        }}>
        <IconButton
          icon={{
            uri: 'https://cdn-icons-png.flaticon.com/128/6366/6366556.png',
          }}
          onPress={endCall}
          color={'red'}
        />
        <IconButton
          icon={{
            uri: 'https://cdn-icons-png.flaticon.com/512/665/665909.png',
          }}
          onPress={switchMicrophone}
          color={openMicrophone ? 'black' : 'gray'}
        />
        <IconButton
          icon={{
            uri: 'https://cdn-icons-png.flaticon.com/128/59/59284.png',
          }}
          onPress={switchSpeakerphone}
          color={enableSpeakerphone ? 'black' : 'gray'}
        />
        <IconButton
          icon={{
            uri: 'https://cdn-icons-png.flaticon.com/128/711/711245.png',
          }}
          onPress={onToggleCamera}
          color={onSwitchCamera ? 'black' : 'gray'}
        />
      </View>
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <View>
        <IconButton
          icon={{
            uri: 'https://cdn-icons-png.flaticon.com/512/3033/3033143.png',
          }}
          size={100}
          animated
          style={{
            alignSelf: 'center',
            justifyContent: 'center',
          }}
        />
        <Text
          style={{
            color: 'black',
            fontWeight: 'bold',
            fontSize: 22,
            alignSelf: 'center',
          }}>
          {userName}
        </Text>
        <Text
          style={{
            color: 'black',
            fontWeight: '500',
            fontSize: 15,
            alignSelf: 'center',
          }}>
          {userPhone}
        </Text>
      </View>
      <CallingActionBtn />
    </View>
  );
}

const styles = StyleSheet.create({});
