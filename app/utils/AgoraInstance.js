import createAgoraRtcEngine, {ChannelProfileType} from 'react-native-agora';
import agoraConfig from '../../agora.config';

export default engine = null;

export const agoraInitialization = async () => {
  try {
    await createAgoraRtcEngine.create(agoraConfig.appId);
    return true;
  } catch (error) {
    console.log(`Error inside AgoraInitialization ${error}`);
  }
  //   return Promise.resolve();
};

export const engineLeave = async () => {
  await engine.leaveChannel();
};
