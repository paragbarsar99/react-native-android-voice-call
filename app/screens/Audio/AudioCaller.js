import {
  StyleSheet,
  View,
  Modal,
  ToastAndroid,
  Vibration,
  Text,
} from 'react-native';
import React, {useContext, useReducer} from 'react';
import {IconButton} from 'react-native-paper';
import {SendFcm} from '../../services/Fcm';
import agoraConfig from '../../../agora.config';
import {BlurView} from '@react-native-community/blur';
import AnimatedText from '../component/AnimatedText';
import engine, {agoraInitialization} from '../../utils/AgoraInstance';
import {ClientRoleType, ChannelProfileType} from 'react-native-agora';
import {Context as UserContext} from '../../store/Context/UserContext/ContextIndex';
const reducer = (state, action) => ({...state, ...action});
const initialState = {
  inCall: false,
  enableSpeakerphone: false,
  openMicrophone: true,
  localUser: null,
  remoteUser: null,
};

function AudioCaller(props) {
  const {userName, userPhone, isVisible, onModalToggle, receiverFcm} = props;
  const [state, dispatch] = useReducer(reducer, initialState);
  const {inCall, openMicrophone, enableSpeakerphone, localUser, remoteUser} =
    state;

  const {
    state: {
      userDetails: {data},
    },
  } = useContext(UserContext);

  const makeCall = async () => {
    try {
      agoraInitialization();
      engine.registerEventHandler({
        onJoinChannelSuccess: onJoinChannelSuccess,
        onLeaveChannel: onLeaveChannel,
        onUserOffline: onUserOffline,
        onUserJoined: onUserJoined,
      });
      engine.enableAudio();
      engine.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);
      engine.joinChannel(agoraConfig.token, agoraConfig.channelName, 0, {
        ClientRole: ClientRoleType.ClientRoleBroadcaster,
      });
      return () => {
        engine.unregisterEventHandler({
          onJoinChannelSuccess: onJoinChannelSuccess,
          onLeaveChannel: onLeaveChannel,
          onUserOffline: onUserOffline,
          onUserJoined: onUserJoined,
        });
      };
    } catch (e) {}
  };

  const onUserJoined = (connection, Uid) => {
    try {
      dispatch({
        remoteUser: Uid,
      });
    } catch (error) {}
  };

  const onJoinChannelSuccess = (connection, Uid) => {
    ToastAndroid.show(`Channel Joined `, ToastAndroid.SHORT);
    dispatch({
      inCall: true,
      localUser: 0,
    });
  };

  const onLeaveChannel = () => {
    Vibration.vibrate([0, 100]);
    dispatch({
      inCall: false,
      localUid: null,
      remoteUser: null,
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

  const endCall = () => {
    try {
      engine.leaveChannel();
    } catch (error) {
      console.log(error + ' EndCall');
    }
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

  // Switch the audio playback device.
  const switchSpeakerphone = () => {
    try {
      engine.setEnableSpeakerphone(!enableSpeakerphone);
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

  const CallingContainer = props => {
    return (
      <View style={styles.callingContainer}>
        <View
          style={{
            width: 150,
            height: 150,
            borderRadius: 75,
            borderColor: 'blue',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text style={{color: 'black', fontWeight: '500', fontSize: 18}}>
            {props.userName}
          </Text>
        </View>
      </View>
    );
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
            <>
              <CallingContainer userName={userName} />
              {remoteUser && <CallingContainer userName={data.userName} />}
            </>
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
  callingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'black',
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
    bottom: 40,
    marginHorizontal: '20%',
    padding: 10,
    position: 'absolute',
  },
});

export default React.memo(AudioCaller);
