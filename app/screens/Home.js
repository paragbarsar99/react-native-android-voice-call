import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Linking,
  FlatList,
  PermissionsAndroid,
  Animated as RNAnimated,
  Alert,
  Vibration,
} from 'react-native';
import {Context as UserContext} from '../store/Context/UserContext/ContextIndex';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import React, {useCallback, useContext, useEffect, useReducer} from 'react';
import agoraConfig from '../../agora.config';
import Messaging from '@react-native-firebase/messaging';
import RNNotificationCall from 'react-native-full-screen-notification-incoming-call';
import {SendFcm} from '../services/Fcm';
import {useFocusEffect} from '@react-navigation/native';
import {engineLeave} from '../utils/AgoraInstance';
import {ActivityIndicator} from 'react-native-paper';
import AudioCaller from './Audio/AudioCaller';
import VideoCaller from './Video/VideoCaller';

const reducer = (state, payload) => ({...state, ...payload});

const initialState = {
  uuid: '',
  userName: 'Pixel_2_API_31',
  userPhone: '82738534',
  channelName: agoraConfig.channelId,
  userNameError: '',
  userPhoneError: '',
  isHasAccount: false,
  isConnectionService: undefined,
  userList: [],
  isVisibleVideo: false,
  isVisibleAudio: false,
  swipableValue: 0,
  permission: false,
  receiverFcm: '',
  isLoading: false,
};

export default function Home({route, navigation}) {
  const [localState, dispatch] = useReducer(reducer, initialState);

  const {
    state: {
      userDetails: {data},
      contactList,
    },
    fetchUser,
    fetchContactList,
  } = useContext(UserContext);

  const getUserPermisson = async () => {
    await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    ).then(async res => {
      if (res) {
        dispatch({
          permission: res,
        });
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        );
        if (granted === 'granted')
          dispatch({
            permission: true,
          });
        if (granted === 'never_ask_again' || granted === 'denied') {
          Alert.alert(
            'MicroPhone Permission Required',
            'Please Allow MicroPhone Permission',
            [
              {
                onPress: () => {
                  Linking.openSettings();
                },
                text: 'Open Setting',
              },
            ],
          );
        }
      }
    });
  };

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        title: data.userName ? data.userName : '...',
      });
    }, [data]),
  );

  useEffect(() => {
    const unsubscribe = Messaging().onMessage(async remoteMessage => {
      if (remoteMessage.data.title === 'Incomingcall') {
        RNNotificationCall.displayNotification(
          remoteMessage.data.uuid,
          null,
          30000,
          {
            channelId: 'incomingCall',
            channelName: 'Incoming Audio call',
            notificationIcon: 'ic_launcher', //mipmap
            notificationTitle: `${
              remoteMessage.data.callerName
                ? `${remoteMessage.data.callerName}`
                : `UnKnown`
            }`,
            notificationBody: 'Incoming Audio call',
            answerText: 'Answer',
            declineText: 'Decline',
          },
        );
        RNNotificationCall.addEventListener('answer', async () => {
          await Linking.openURL(remoteMessage.data.url);
        });
        RNNotificationCall.addEventListener('endCall', () => {
          SendFcm({fcmToken: remoteMessage.data.fcmToken}, 'remoteCallEnded');
        });
      } else if (remoteMessage.data.title === 'remoteCallEnded') {
        console.log('remoteCallEnded on Forground');
        //making AgoraEngine Leave Channel
        // engineLeave();
        dispatch({
          isVisible: false,
        });
      } else if (remoteMessage.data.title === 'callEndedBYCaller') {
        RNNotificationCall.hideNotification();
      }
    });
    (async () => {
      await getUserPermisson();
      await fetchContactList();
      await fetchUser();
    })();

    return () => [
      RNNotificationCall.removeEventListener('answer'),
      RNNotificationCall.removeEventListener('endCall'),
      unsubscribe,
    ];
  }, []);

  const RenderRightActions = React.forwardRef((props, ref) => {
    const {progress} = props;

    const rotate = progress.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '90deg'],
      extrapolate: 'clamp',
    });

    const opacity = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 1],
      extrapolate: 'clamp',
    });

    return (
      <RNAnimated.View
        style={{
          justifyContent: 'center',
          alignItems: 'flex-end',
          // flex: 0.2,
          position: 'relative',
          width: 100,
          opacity: opacity,
          backgroundColor: 'green',
        }}>
        <Pressable>
          <RNAnimated.Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/128/6366/6366556.png',
            }}
            style={{
              transform: [
                {
                  rotate: rotate,
                },
              ],
              width: 40,
              height: 40,
              marginRight: 20,
              tintColor: 'white',
            }}
          />
        </Pressable>
      </RNAnimated.View>
    );
  });

  const RenderLeftActions = React.forwardRef((props, ref) => {
    const {progress} = props;

    const rotate = progress.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '90deg'],
      extrapolate: 'clamp',
    });

    const opacity = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 1],
      extrapolate: 'clamp',
    });

    return (
      <RNAnimated.View
        style={{
          justifyContent: 'center',
          alignItems: 'flex-end',
          // flex: 0.2,
          position: 'relative',
          width: 100,
          opacity: opacity,
          backgroundColor: 'red',
        }}>
        <Pressable>
          <RNAnimated.Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/128/711/711245.png',
            }}
            style={{
              transform: [
                {
                  rotate: rotate,
                },
              ],
              width: 40,
              height: 40,
              marginRight: 20,
              tintColor: 'white',
            }}
          />
        </Pressable>
      </RNAnimated.View>
    );
  });

  const onSwipePermissionCheck = async (direction, swipeable, ref, data) => {
    if (localState.permission) {
      ref.current.close();
      Vibration.vibrate([0, 100]);
      console.log(swipeable.state.rowState + direction);
      const callType = direction === 'right' ? 'AudioCall' : 'VideoCall';
      SendFcm({fcmToken: data.item.fcmToken}, 'dial', callType);
      // -1 for right Swipe
      // 1 for left swipe
      if (callType === 'AudioCall') {
        dispatch({
          userName: data.item.userName,
          userPhone: data.item.userPhone,
          isVisibleAudio: !localState.isVisibleAudio,
          receiverFcm: data.item.fcmToken,
        });
      } else if (callType === 'VideoCall') {
        dispatch({
          userName: data.item.userName,
          userPhone: data.item.userPhone,
          isVisibleVideo: !localState.isVisibleVideo,
          receiverFcm: data.item.fcmToken,
        });
      }
    } else {
      ref.current.close();
      await getUserPermisson();
    }
  };

  const UserList = (data, index) => {
    const ref = React.createRef();
    return (
      <Swipeable
        ref={ref}
        rightThreshold={100}
        leftThreshold={100}
        overshootRight={false}
        overshootLeft={false}
        onSwipeableOpen={(direction, swipeable) =>
          onSwipePermissionCheck(direction, swipeable, ref, data)
        }
        renderRightActions={(progress, dragX) => (
          <RenderRightActions progress={progress} dragX={dragX} ref={ref} />
        )}
        renderLeftActions={(progress, dragX) => (
          <RenderLeftActions progress={progress} dragX={dragX} ref={ref} />
        )}
        containerStyle={{
          backgroundColor: 'green',
          justifyContent: 'center',
        }}
        childrenContainerStyle={{
          backgroundColor: 'white',
          padding: 16,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <Text style={{fontSize: 22, color: 'black'}}>{data.item.userName}</Text>
        <Text style={{fontSize: 16, color: 'black'}}>
          {data.item.userPhone}
        </Text>
      </Swipeable>
    );
  };

  const ListSeparatorComponent = () => {
    return (
      <View
        style={{
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderColor: 'black',
        }}></View>
    );
  };
  return (
    <View style={{flex: 1}}>
      {!contactList.isLoading ? (
        <FlatList
          data={contactList.data}
          showsHorizontalScrollIndicator={true}
          keyExtractor={(item, index) => index.toString()}
          renderItem={UserList}
          ItemSeparatorComponent={ListSeparatorComponent}
        />
      ) : (
        <ActivityIndicator
          color="black"
          size="large"
          style={{
            alignSelf: 'center',
            marginTop: '50%',
          }}
        />
      )}
      <AudioCaller
        receiverFcm={localState.receiverFcm}
        userName={localState.userName}
        userPhone={localState.userPhone}
        isVisible={localState.isVisibleAudio}
        onModalToggle={dispatch}
      />
      <VideoCaller
        receiverFcm={localState.receiverFcm}
        userName={localState.userName}
        userPhone={localState.userPhone}
        isVisible={localState.isVisibleVideo}
        onModalToggle={dispatch}
      />
    </View>
  );
}

const styles = StyleSheet.create({});
