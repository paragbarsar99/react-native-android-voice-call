// import {
//     StyleSheet,
//     View,
//     Modal,
//     ToastAndroid,
//     Vibration,
//     Text as RNText,
//     Animated,
//     Alert,
//   } from 'react-native';
//   import React, {useCallback, useReducer} from 'react';
//   import {IconButton, Text} from 'react-native-paper';
//   import engine, {
//     agoraInitialization,
//     engineLeave,
//   } from '../../utils/AgoraInstance';
//   import {SendFcm} from '../../services/Fcm';
//   import agoraConfig from '../../../agora.config';
//   import {
//     ClientRoleType,
//     RenderModeType,
//     RtcSurfaceView,
//     RtcTextureView,
//     VideoViewSetupMode,
//   } from 'react-native-agora';
//   import {BlurView} from '@react-native-community/blur';
//   import AnimatedText from '../component/AnimatedText';

//   const reducer = (state, action) => ({...state, ...action});
//   const initialState = {
//     inCall: false,
//     joinSucceed: false,
//     enableSpeakerphone: false,
//     openMicrophone: true,
//     currentCallId: null,
//     remoteUser: null,
//     onSwitchCamera: false,
//   };

//   function VideoCaller(props) {
//     const {userName, userPhone, isVisible, onModalToggle, receiverFcm} = props;
//     const [state, dispatch] = useReducer(reducer, initialState);
//     const {openMicrophone, enableSpeakerphone, onSwitchCamera, inCall} = state;

//     const endCall = useCallback(() => {
//       console.log('channelLeave');
//       try {
//         engineLeave();
//       } catch (error) {
//         console.log(error + ' EndCall');
//       }
//     }, []);

//     const makeCall = async () => {
//       console.log('Dialing');
//       try {
//         await agoraInitialization();
//         engine.enableVideo();
//         engine.startPreview();
//         engine.joinChannel(agoraConfig.token, agoraConfig.channelName, 0, {
//           clientRoleType: ClientRoleType.ClientRoleBroadcaster,
//         });
//         engine.addListener('onJoinChannelSuccess', ({localUid, channelId}) => {
//           ToastAndroid.show(`${localUid} Joined ${channelId}`, ToastAndroid.LONG);
//           dispatch({inCall: true});
//         });

//         engine.addListener('onUserJoined', ({localUid, channelId}) => {
//           ToastAndroid.show(
//             `${localUid} Remote User Joined ${channelId}`,
//             ToastAndroid.LONG,
//           );
//           dispatch({remoteUser: localUid});
//         });

//         //Occurs when a user leaves a channel
//         engine.addListener('onLeaveChannel', ({localUid, channelId}) => {
//           // SendFcm({fcmToken: receiverFcm}, 'callEndedBYVideoCaller');
//           Vibration.vibrate([0, 100]);
//           dispatch({inCall: false, remoteUser: null});
//           ToastAndroid.showWithGravity(
//             `${localUid} Call Ended`,
//             ToastAndroid.SHORT,
//             ToastAndroid.BOTTOM,
//           );
//           onModalToggle({
//             isVisibleVideo: false,
//           });
//           engine.stopPreview();
//           engine.release();
//         });
//         //occurs when remote user leave the channel
//         engine.addListener('onUserOffline', ({localUid}) => {
//           endCall(localUid);
//         });
//         engine.addListener('onRemoteAudioStateChanged', () => {});
//         // Enable the audio module.
//       } catch (error) {
//         console.error(error);
//       }
//     };
//     // Enables or disables the microphone.
//     const switchMicrophone = async () => {
//       try {
//         // console.log(openMicrophone, ' openMicrophone');
//         const isLocal = engine.enableLocalAudio(openMicrophone ? false : true);
//         console.log(`isLocalAudioEnabled: ${isLocal} `);
//         dispatch({
//           openMicrophone: !openMicrophone,
//         });
//       } catch (err) {
//         console.warn('enableLocalAudio', err);
//       }
//     };

//     // Switch the audio playback device.
//     const switchSpeakerphone = () => {
//       try {
//         const isSpeaker = engine.setEnableSpeakerphone(!enableSpeakerphone);
//         console.log(`setEnableSpeakerphone: ${isSpeaker} `);

//         dispatch({enableSpeakerphone: !enableSpeakerphone});
//       } catch (err) {
//         console.warn('setEnableSpeakerphone', err);
//       }
//     };

//     const onToggleCamera = () => {
//       try {
//         engine.switchCamera();
//         dispatch({onSwitchCamera: !onSwitchCamera});
//       } catch (err) {
//         console.warn('setEnableToggleCamera', err);
//       }
//     };

//     return (
//       <Modal
//         style={{
//           flex: 1,
//           backgroundColor: 'transparant',
//         }}
//         visible={isVisible}
//         animationType="slide"
//         transparent={true}
//         onShow={makeCall}
//         onRequestClose={() => {
//           endCall();
//           onModalToggle({
//             isVisibleVideo: false,
//           });
//         }}>
//         <View style={{flex: 1}}>
//           <BlurView
//             style={styles.absolute}
//             blurType="light"
//             blurAmount={4}
//             reducedTransparencyFallbackColor="rgba(255,255,255,0.4)"
//           />
//           <View style={{flex: 1, justifyContent: 'space-between'}}>
//             {inCall ? (
//               <View style={{flex: 1}}>
//                 <RtcSurfaceView
//                   style={{flex: 1}}
//                   canvas={{
//                     uid: 0,
//                     setupMode: VideoViewSetupMode.VideoViewSetupReplace,
//                   }}
//                 />
//                 {state.remoteUser ? (
//                   <RtcSurfaceView
//                     style={{flex: 1, backgroundColor: 'gray'}}
//                     key={state.remoteUser}
//                     canvas={{
//                       uid: state.remoteUser,
//                       setupMode: VideoViewSetupMode.VideoViewSetupReplace,
//                     }}
//                   />
//                 ) : (
//                   <AnimatedText textValue={'Connecting'} />
//                 )}
//               </View>
//             ) : (
//               <AnimatedText textValue={'Ringing'} />
//             )}
//             <View
//               style={{
//                 flexDirection: 'row',
//                 justifyContent: 'space-between',
//                 backgroundColor: 'white',
//                 borderRadius: 10,
//                 bottom: 40,
//                 marginHorizontal: '20%',
//                 padding: 10,
//                 position: 'absolute',
//               }}>
//               <IconButton
//                 icon={{
//                   uri: 'https://cdn-icons-png.flaticon.com/128/6366/6366556.png',
//                 }}
//                 onPress={endCall}
//                 color={'red'}
//               />
//               <IconButton
//                 icon={{
//                   uri: 'https://cdn-icons-png.flaticon.com/512/665/665909.png',
//                 }}
//                 onPress={switchMicrophone}
//                 color={openMicrophone ? 'black' : 'gray'}
//               />
//               <IconButton
//                 icon={{
//                   uri: 'https://cdn-icons-png.flaticon.com/128/59/59284.png',
//                 }}
//                 onPress={switchSpeakerphone}
//                 color={enableSpeakerphone ? 'black' : 'gray'}
//               />
//               <IconButton
//                 icon={{
//                   uri: 'https://cdn-icons-png.flaticon.com/128/711/711245.png',
//                 }}
//                 onPress={onToggleCamera}
//                 color={onSwitchCamera ? 'black' : 'gray'}
//               />
//             </View>
//           </View>
//         </View>
//       </Modal>
//     );
//   }

//   const styles = StyleSheet.create({
//     absolute: {
//       ...StyleSheet.absoluteFillObject,
//     },
//   });

//   export default React.memo(VideoCaller);
