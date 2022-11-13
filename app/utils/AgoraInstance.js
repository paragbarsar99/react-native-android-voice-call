import {ToastAndroid} from 'react-native';
import createAgoraRtcEngine, {
  ChannelProfileType,
  ClientRoleType,
} from 'react-native-agora';
import agoraConfig from '../../agora.config';

export default engine = createAgoraRtcEngine();

export const agoraInitialization = async () => {
  try {
    const isSuccess = await engine.initialize({
      appId: agoraConfig.appId,
      channelProfile: ChannelProfileType.ChannelProfileCommunication,
    });
    console.log(isSuccess);
  } catch (error) {
    console.log(`Error inside AgoraInitialization ${error}`);
  }
};
