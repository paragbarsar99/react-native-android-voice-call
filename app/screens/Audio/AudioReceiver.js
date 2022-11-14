import {View, Text, Vibration, ToastAndroid, StyleSheet} from 'react-native';
import React, {useContext, useEffect, useReducer} from 'react';
import {
  ChannelProfileType,
  ClientRoleType,
  RtcSurfaceView,
  VideoViewSetupMode,
} from 'react-native-agora';
import agoraConfig from '../../../agora.config';
import {IconButton} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import engine, {agoraInitialization} from '../../utils/AgoraInstance';
import AnimatedText from '../component/AnimatedText';
import {Context as UserContext} from '../../store/Context/UserContext/ContextIndex';

const reducer = (state, action) => ({...state, ...action});
const initialState = {
  inCall: false,
  enableSpeakerphone: false,
  openMicrophone: true,
  localUser: null,
  remoteUser: null,
};

export default function AudioCallReceiver(props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {userName, userPhone} = props;
  const {
    state: {
      userDetails: {data},
    },
  } = useContext(UserContext);

  const {inCall, openMicrophone, enableSpeakerphone, localUser, remoteUser} =
    state;

  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      await init();
    })();
    return () => {
      engine.unregisterEventHandler({
        onJoinChannelSuccess: onJoinChannelSuccess,
        onLeaveChannel: onLeaveChannel,
        onUserOffline: onUserOffline,
        onUserJoined: onUserJoined,
      });
      engine.release();
    };
  }, []);

  // Pass in your App ID through this.state, create and initialize an RtcEngine object.
  const init = async () => {
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
      clientRoleType: ClientRoleType.ClientRoleBroadcaster,
    });
  };

  const onUserJoined = (connection, Uid) => {
    try {
      dispatch({
        remoteUser: Uid,
      });
    } catch (error) {}
  };

  const onJoinChannelSuccess = (connection, Uid) => {
    ToastAndroid.show(`Channel Joined`, ToastAndroid.LONG);
    dispatch({
      inCall: true,
      localUser: Uid,
    });
  };
  const onLeaveChannel = () => {
    Vibration.vibrate([0, 100]);
    dispatch({
      inCall: false,
      localUser: null,
      remoteUser: null,
    });

    ToastAndroid.showWithGravity(
      `Call Ended`,
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM,
    );
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
    console.log('channelLeave ', connection);
    try {
      engine.leaveChannel();
    } catch (error) {
      console.log(error + ' EndCall');
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
    <View style={{flex: 1, backgroundColor: 'white'}}>
      {inCall ? (
        <>
          <CallingContainer userName={userName} />
          {remoteUser && <CallingContainer userName={data.userName} />}
        </>
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
  callingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
