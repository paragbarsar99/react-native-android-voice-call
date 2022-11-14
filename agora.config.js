// const {
//   RtcTokenBuilder,
//   RtmTokenBuilder,
//   RtcRole,
//   RtmRole,
// } = require('agora-access-token');

// const appId = '29efc6e0e643485a882a321ac80e2248';
// const appCertificate = '<Your app certificate>';
// const channelName = 'Testing_1';
// const uid = 0;
// const userAccount = 'User account';
// const role = RtcRole.PUBLISHER; //Publisher sends stream to server or SUBSCRIBER how receives video from remote server
// const expirationTimeInSeconds = 3600;
// const currentTimestamp = Math.floor(Date.now() / 1000);
// const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
// // Build token with uid
// const token = RtcTokenBuilder.buildTokenWithUid(
//   appId,
//   appCertificate,
//   channelName,
//   uid,
//   role,
//   privilegeExpiredTs,
// );
// console.log('Token with integer number Uid: ' + token);

export default {
  appId: '29efc6e0e643485a882a321ac80e2248',
  channelName: 'Testing_1',
  token:
    '007eJxTYFB2cpkYn7tt5lWNbxXLtt5MDNDO0g8+U/9GtVOijrd30ikFBiPL1LRks1SDVDMTYxML00QLC6NEYyPDxGQLg1QjIxOLTJGi5IZARoZbL3awMjJAIIjPyRCSWlySmZceb8jAAADAhiDA',
};
