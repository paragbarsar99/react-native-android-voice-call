import {View, Text, Vibration, ToastAndroid, StyleSheet} from 'react-native';
import React, {useEffect, useReducer} from 'react';
import {ClientRoleType} from 'react-native-agora';
import agoraConfig from '../../../agora.config';
import {IconButton} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import engine, {agoraInitialization} from '../../utils/AgoraInstance';
import AnimatedText from '../component/AnimatedText';

const reducer = (state, action) => ({...state, ...action});
const initialState = {
  inCall: false,
  remoteUser: [],
  enableSpeakerphone: false,
  openMicrophone: true,
};

export default function AudioCallReceiver(props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {userName, userPhone} = props;
  const {openMicrophone, enableSpeakerphone, inCall} = state;

  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      await init();
    })();
    return () => {
      engine.removeListener('JoinChannelSuccess', onJoinChannelSuccess);
      engine.removeListener('onLeaveChannel', onLeaveChannel);
      engine.removeListener('onUserOffline', onUserOffline);
      engine.release();
    };
  }, []);

  // Pass in your App ID through this.state, create and initialize an RtcEngine object.
  const init = async () => {
    await agoraInitialization();
    engine.registerEventHandler();
    engine.joinChannel(agoraConfig.token, agoraConfig.channelName, 0, {
      clientRoleType: ClientRoleType.ClientRoleBroadcaster,
    });
    engine.enableAudio();
    engine.addListener('onJoinChannelSuccess', onJoinChannelSuccess);
    engine.addListener('onLeaveChannel', onLeaveChannel);
    engine.addListener('onUserOffline', onUserOffline);
  };

  const onJoinChannelSuccess = () => {
    ToastAndroid.show(`Channel Joined`, ToastAndroid.LONG);
    dispatch({
      inCall: true,
    });
  };
  const onLeaveChannel = () => {
    Vibration.vibrate([0, 100]);
    dispatch({
      inCall: false,
    });

    ToastAndroid.showWithGravity(
      `Call Ended`,
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM,
    );
    engine.release();
    navigation.goBack();
  };

  const onUserOffline = () => {
    endCall();
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
      </View>
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      {inCall ? (
        <View style={{flex: 1}}>
          <IconButton
            icon={{
              uri: 'https://cdn-icons-png.flaticon.com/512/3033/3033143.png',
            }}
            size={100}
            animated
            style={styles.userImg}
          />
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userPhone}>{userPhone}</Text>
        </View>
      ) : (
        <AnimatedText textValue={'Connecting'} />
      )}
      <CallingActionBtn />
    </View>
  );
}

const styles = StyleSheet.create({
  userName: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 22,
    alignSelf: 'center',
  },
  userPhone: {
    color: 'black',
    fontWeight: '500',
    fontSize: 15,
    alignSelf: 'center',
  },
  userImg: {
    alignSelf: 'center',
    justifyContent: 'center',
  },
});
