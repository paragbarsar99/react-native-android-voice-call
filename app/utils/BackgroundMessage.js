import RNNotificationCall from 'react-native-full-screen-notification-incoming-call';
import {Linking} from 'react-native';
import {AndroidLog, CallkeepHelperModule} from './NativeModules';
import {SendFcm} from '../services/Fcm';

export default async (callerName, callerNumer, uuid, url, fcmToken, title) => {
  try {
    console.log(
      uuid + ' uuid',
      'callerNumer',
      callerNumer,
      'callerName',
      callerName,
      fcmToken,
      title,
    );

    const NOTIFICATION_RINGTON_TYPE = 'ringtone';
    if (title === 'Incomingcall') {
      RNNotificationCall.displayNotification(uuid, null, 15000, {
        channelId: 'incomingCall',
        channelName: 'Incoming Audio call',
        notificationIcon: 'ic_launcher', //mipmap
        notificationTitle: `${callerName ? callerName : 'Unknown'}`,
        notificationBody: 'Incoming Audio call',
        answerText: 'Answer',
        declineText: 'Decline',
      });
      RNNotificationCall.addEventListener('answer', async () => {
        await Linking.openURL(url);
      });
      RNNotificationCall.addEventListener('endCall', () => {
        SendFcm({fcmToken}, 'remoteCallEnded');
        AndroidLog.createAndroidLog(`CallEnded by: ${uuid}`);
      });
    }
    if (title === 'remoteCallEnded') {
      AndroidLog.createAndroidLog('RemoteCallEnded');
      RNNotificationCall.hideNotification();
    }
    if (title === 'callEndedBYCaller') {
      RNNotificationCall.hideNotification();
    }

    return Promise.resolve();
  } catch (error) {}
};
