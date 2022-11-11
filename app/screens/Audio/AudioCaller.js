import {
  StyleSheet,
  View,
  Modal,
  ToastAndroid,
  Vibration,
  Text,
  Animated,
} from 'react-native';
import React, {useCallback, useReducer} from 'react';
import {IconButton} from 'react-native-paper';
import createAgoraRtcEngine from 'react-native-agora';
import engine, {
  agoraInitialization,
  engineLeave,
} from '../../utils/AgoraInstance';
import {SendFcm} from '../../services/Fcm';
import agoraConfig from '../../../agora.config';
import {ClientRole} from 'react-native-agora';
import {BlurView} from '@react-native-community/blur';
import AnimatedText from '../component/AnimatedText';

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
};

function AudioCaller(props) {
  const {userName, userPhone, isVisible, onModalToggle, receiverFcm} = props;
  const [state, dispatch] = useReducer(reducer, initialState);
  const {inCall, openMicrophone, enableSpeakerphone} = state;

  let engine = createAgoraRtcEngine.instance();

  const endCall = useCallback(() => {
    console.log('channelLeave');
    try {
      engine.leaveChannel();
    } catch (error) {
      console.log(error + ' EndCall');
    }
  }, []);

  const makeCall = async () => {
    console.log('Dialing');
    try {
      engine.joinChannel(agoraConfig.token, agoraConfig.channelName, null, 0);
      engine.enableAudio();
      //occures when a user joins a channel
      engine.addListener('JoinChannelSuccess', () => {});
      //Occurs when a remote user (COMMUNICATION)/ host (LIVE_BROADCASTING) joins the channel
      engine.addListener('UserJoined', ({localUid}) => {
        dispatch({inCall: true});
      });
      //Occurs when a user leaves a channel
      engine.addListener('LeaveChannel', ({localUid}) => {
        // SendFcm({fcmToken: receiverFcm}, 'callEndedBYCaller');
        Vibration.vibrate([0, 100]);
        dispatch({inCall: false});
        ToastAndroid.showWithGravity(
          'Call Ended',
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM,
        );
        onModalToggle({
          isVisibleAudio: false,
        });
        // engine.d();
      });
      //occurs when remote user leave the channel
      engine.addListener('UserOffline', ({localUid}) => {
        endCall(localUid);
      });
      engine.addListener('RemoteAudioStateChanged', () => {});
      // Enable the audio module.
    } catch (error) {
      console.error(error);
    }
  };
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
