import {
  StyleSheet,
  View,
  Modal,
  ToastAndroid,
  Vibration,
  Text as RNText,
  Animated,
  Alert,
} from 'react-native';
import React, {useCallback, useEffect, useReducer} from 'react';
import {IconButton, Text} from 'react-native-paper';
import engine, {
  agoraInitialization,
  engineLeave,
} from '../../utils/AgoraInstance';
import {SendFcm} from '../../services/Fcm';
import agoraConfig from '../../../agora.config';
import {
  ChannelProfileType,
  ClientRoleType,
  RenderModeType,
  RtcSurfaceView,
  RtcTextureView,
  VideoViewSetupMode,
} from 'react-native-agora';
import AnimatedText from '../component/AnimatedText';
import {useNavigation} from '@react-navigation/native';
const reducer = (state, action) => ({...state, ...action});
const initialState = {
  inCall: false,
  enableSpeakerphone: false,
  openMicrophone: true,
  currentCallId: null,
  remoteUser: null,
  onSwitchCamera: false,
  localUid: null,
};

export default function VideoCallReceiver(props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {userName, userPhone} = props;
  const {
    openMicrophone,
    enableSpeakerphone,
    onSwitchCamera,
    inCall,
    localUid,
    remoteUser,
  } = state;

  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      await init();
    })();
    return () => {
      engine.unregisterEventHandler();
      engine.release();
    };
  }, []);

  const joinChannel = () => {
    try {
      engine.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);
      engine.startPreview();
      engine.joinChannel(agoraConfig.token, agoraConfig.channelName, 0, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });
    } catch (error) {}
  };

  // Pass in your App ID through this.state, create and initialize an RtcEngine object.
  const init = async () => {
    agoraInitialization();
    engine.registerEventHandler({
      onJoinChannelSuccess: (_connection, Uid) => {
        ToastAndroid.show(`You Joined The Channel`, ToastAndroid.LONG);
        dispatch({
          inCall: true,
          localUid: Uid,
        });
      },

      onUserJoined: (_connection, Uid) => {
        ToastAndroid.show(
          `Remote User Joined The Channel ${Uid} `,
          ToastAndroid.LONG,
        );
        dispatch({
          remoteUser: Uid,
        });
      },
      onUserOffline: (connection, Uid) => {
        ToastAndroid.show(
          `Remote User Leaved The Channel ${Uid} `,
          ToastAndroid.LONG,
        );
        //check this methode
        endCall();
      },
      onLeaveChannel: (_connection, Uid) => {
        ToastAndroid.show(`You Leaved The Channel`, ToastAndroid.LONG);
        // SendFcm({fcmToken: receiverFcm}, 'callEndedBYVideoCaller');
        Vibration.vibrate([0, 100]);
        dispatch({inCall: false, remoteUser: null});
        engine.release();
        navigation.goBack();
      },
    });
    engine.enableVideo();
    joinChannel();
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
            uri: 'https://cdn-icons-png.flaticon.com/128/8950/8950473.png',
          }}
          onPress={onToggleCamera}
          color={'black'}
        />
      </View>
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <View style={{flex: 1, justifyContent: 'space-between'}}>
        {inCall ? (
          <>
            <RtcSurfaceView
              style={{flex: 1}}
              canvas={{
                uid: 0,
              }}
            />
            {inCall && remoteUser ? (
              <RtcSurfaceView
                style={{flex: 1}}
                canvas={{
                  uid: remoteUser,
                }}
              />
            ) : (
              <AnimatedText textValue={'Connecting'} />
            )}
          </>
        ) : (
          <AnimatedText textValue={'Connecting'} />
        )}
        <CallingActionBtn />
      </View>
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
