import uuid from 'react-native-uuid';
import auth from '@react-native-firebase/auth';
import usersCollection from '../utils/FirebaseCollection';

export async function SendFcm(data, type = undefined, isVideo = 'Audiocall') {
  try {
    //Current user fcmToken
    const {userName, userPhone, fcmToken} = (
      await usersCollection.doc(auth().currentUser.uid).get()
    ).data();
    // console.log(data.fcmToken + ' token');
    if (type != undefined && type == 'dial') {
      await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            'key=AAAAXXaP9oM:APA91bHTOLFfR82aAazwnREGxd2-Rhub1rQ0zWS7HGSduL_32g_3gXgVUb6ZOKZNN6r5wRyme8uKRK-a5FnRNdQnVzpFiTXnuWY06EVeKa7DTf35PMMyfN0OAj7BFky7-byXAXBSUtug',
        },
        body: JSON.stringify({
          to: data.fcmToken,
          data: {
            uuid: uuid.v4(),
            callerNumer: userPhone,
            callerName: userName,
            channel_id: 'incomingCall',
            url: `meeting://calling/${userName}/${userPhone}/${isVideo}`,
            title: 'Incomingcall',
            fcmToken,
          },
          priority: 'high',
          topic: 'all',
        }),
      })
        .then(Res => Res.json())
        .then(res => console.log(res))
        .catch(err => onError(err));
    } else if (type === 'remoteCallEnded') {
      console.log('remoteCallEnded ' + data.fcmToken);
      await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            'key=AAAAXXaP9oM:APA91bHTOLFfR82aAazwnREGxd2-Rhub1rQ0zWS7HGSduL_32g_3gXgVUb6ZOKZNN6r5wRyme8uKRK-a5FnRNdQnVzpFiTXnuWY06EVeKa7DTf35PMMyfN0OAj7BFky7-byXAXBSUtug',
        },
        body: JSON.stringify({
          to: data.fcmToken,
          data: {
            fcmToken,
            callerNumer: userPhone,
            callerName: userName,
            channel_id: 'incomingCall',
            title: 'remoteCallEnded',
          },
          priority: 'high',
          topic: 'all',
        }),
      })
        .then(Res => Res.json())
        .then(res => console.log(res))
        .catch(err => onError(err));
    } else if (type === 'callEndedBYCaller') {
      await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            'key=AAAAXXaP9oM:APA91bHTOLFfR82aAazwnREGxd2-Rhub1rQ0zWS7HGSduL_32g_3gXgVUb6ZOKZNN6r5wRyme8uKRK-a5FnRNdQnVzpFiTXnuWY06EVeKa7DTf35PMMyfN0OAj7BFky7-byXAXBSUtug',
        },
        body: JSON.stringify({
          to: data.fcmToken,
          data: {
            fcmToken,
            callerNumer: userPhone,
            callerName: userName,
            channel_id: 'incomingCall',
            title: 'callEndedBYCaller',
          },
          priority: 'high',
          topic: 'all',
        }),
      })
        .then(Res => Res.json())
        .then(res => console.log(res))
        .catch(err => onError(err));
    }
  } catch (error) {
    console.error(error + ' Fcm in catch');
  }
}

function onError(err) {
  console.error(err + ` can't send Fcm to ${data.fcmToken}`);
}

export async function* makeApiCall() {
  try {
    yield await fetch('https://jsonplaceholder.typicode.com/todos/1')
      .then(res => res.json())
      .then(res => console.log(res))
      .catch(err => {
        console.log(err);
      });
  } catch (error) {
    console.error(error, ' Error from Generator function');
  }
}
