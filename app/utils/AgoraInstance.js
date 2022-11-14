import {ToastAndroid} from 'react-native';
import createAgoraRtcEngine, {
  ChannelProfileType,
  ClientRoleType,
} from 'react-native-agora';
import agoraConfig from '../../agora.config';

export default engine = createAgoraRtcEngine();

export const agoraInitialization = () => {
  try {
    const isSuccess = engine.initialize({
      appId: agoraConfig.appId,
    });
    console.log(isSuccess + ' isAgoraInitilize');
  } catch (error) {
    console.log(`Error inside AgoraInitialization ${error}`);
  }
};
