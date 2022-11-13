import {
  StyleSheet,
  View,
  Modal,
  ToastAndroid,
  Vibration,
  Text,
} from 'react-native';
import React, {useCallback, useReducer} from 'react';
import {IconButton} from 'react-native-paper';
import {SendFcm} from '../../services/Fcm';
import agoraConfig from '../../../agora.config';
import {BlurView} from '@react-native-community/blur';
import AnimatedText from '../component/AnimatedText';
import engine, {agoraInitialization} from '../../utils/AgoraInstance';
import {ClientRoleType, IRtcEngineEventHandler} from 'react-native-agora';

const reducer = (state, action) => ({...state, ...action});
const initialState = {
  ready: false,
  number: '',
  ringing: false,
  inCall: false,
  held: false,
  videoHeld: false,
  error: null,
  localStreamURL: null,
  remoteStreamURL: null,
  joinSucceed: false,
  peerIds: [],
  enableSpeakerphone: false,
  openMicrophone: true,
  currentCallId: null,
  engine: undefined,
};

function AudioCaller(props) {
  const {userName, userPhone, isVisible, onModalToggle, receiverFcm} = props;
  const [state, dispatch] = useReducer(reducer, initialState);
  const {inCall, openMicrophone, enableSpeakerphone} = state;

  const makeCall = async () => {
    try {
      await agoraInitialization();
      engine.registerEventHandler();
      engine.joinChannel(agoraConfig.token, agoraConfig.channelName, 0, {
        ClientRole: ClientRoleType.ClientRoleBroadcaster,
      });
      engine.enableAudio();
      //occures when a user joins a channel
      engine.addListener('onJoinChannelSuccess', onJoinChannelSuccess);
      engine.addListener('onLeaveChannel', onLeaveChannel);
      engine.addListener('onUserOffline', onUserOffline);
    } catch (e) {}
  };

  const onJoinChannelSuccess = () => {
    ToastAndroid.show(`Channel Joined`, ToastAndroid.SHORT);
    dispatch({
      inCall: true,
    });
  };

  const onLeaveChannel = () => {
    Vibration.vibrate([0, 100]);
    dispatch({
      inCall: false,
    });
    onModalToggle({
      isVisibleAudio: false,
    });
    ToastAndroid.showWithGravity(
      `Call Ended`,
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM,
    );
    engine.release();
  };

  const onUserOffline = () => {
    endCall();
  };

  const endCall = useCallback(() => {
    try {
      engine.leaveChannel();
    } catch (error) {
      console.log(error + ' EndCall');
    }
  }, []);

  // Enables or disables the microphone.
  const switchMicrophone = async () => {
    try {
      // console.log(openMicrophone, ' openMicrophone');
      const isLocal = engine.enableLocalAudio(openMicrophone ? false : true);
      console.log(`isLocalAudioEnabled: ${isLocal} `);
      dispatch({
        openMicrophone: !openMicrophone,
      });
    } catch (err) {
      console.warn('enableLocalAudio', err);
    }
  };

  // Switch the audio playback device.
  const switchSpeakerphone = () => {
    try {
      const isSpeaker = engine.setEnableSpeakerphone(!enableSpeakerphone);
      console.log(`setEnableSpeakerphone: ${isSpeaker} `);

      dispatch({enableSpeakerphone: !enableSpeakerphone});
    } catch (err) {
      console.warn('setEnableSpeakerphone', err);
    }
  };
  function CallingActionBtn() {
    return (
      <View style={styles.actionPanel}>
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
    <Modal
      style={styles.mainContainer}
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onShow={makeCall}
      onRequestClose={() => {
        endCall();
        onModalToggle({
          isVisibleAudio: false,
        });
      }}>
      <View style={{flex: 1}}>
        <BlurView
          style={styles.absolute}
          blurType="light"
          blurAmount={4}
          reducedTransparencyFallbackColor="rgba(255,255,255,0.4)"
        />
        <View style={styles.container}>
          {inCall ? (
            <View
              style={{
                marginTop: '30%',
              }}>
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
            <AnimatedText textValue={'Ringing'} />
          )}
          <CallingActionBtn />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'transparant',
  },
  absolute: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {flex: 1, justifyContent: 'space-between'},
  userImg: {
    alignSelf: 'center',
    justifyContent: 'center',
  },
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
  actionPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 40,
    marginHorizontal: '20%',
    padding: 10,
  },
});

export default React.memo(AudioCaller);
