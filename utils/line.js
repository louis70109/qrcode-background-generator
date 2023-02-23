const { uploadGithub } = require('./github');
const imagesize = require('imagesize');
const line = require('@line/bot-sdk');
const MessageDB = require('./sqlite');
const { AwesomeQR } = require('awesome-qr');
const { QRcodeGenerate } = require('./qr');

const client = new line.Client({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
});
function downloadContent(messageId) {
  return client.getMessageContent(messageId).then(
    (stream) =>
      new Promise((resolve, reject) => {
        const chunkTotal = [];
        let length = 0;
        stream.on('data', (chunk) => {
          chunkTotal.push(Buffer.from(chunk));
          length += chunk.length;
        });
        stream.on('end', async () => {
          const imagedata = Buffer.concat(chunkTotal, length);
          resolve(await uploadGithub(messageId, imagedata));
        });

        stream.on('error', reject);
      })
  );
}

async function contentSize(messageId) {
  return client.getMessageContent(messageId).then(
    (stream) =>
      new Promise((resolve, reject) => {
        imagesize(stream, function (err, result) {
          if (!err) {
            // console.log(result); // {type, width, height}
            resolve(result);
          }
        });
      })
  );
}

async function handleImage(message) {
  if (message.contentProvider.type === 'line') {
    const githubContent = await downloadContent(message.id);
    return githubContent.download_url;
  }
}

// event handler
async function handleEvent(event) {
  const msgType = event.message.type;
  console.log(event);

  if (event.type !== 'message' && (msgType !== 'image' || msgType !== 'text')) {
    // ignore non-text-message event
    return Promise.resolve(null);
  }
  const uid = event.source.userId;
  const keyword = event.message.text;
  let msgStat = new MessageDB();
  let responseText = '請先輸入文字';
  if (msgType === 'text') {
    // await msgStat.init()

    let msgData = await msgStat.find(uid);
    if (msgData.length === 0) {
      const data = await msgStat.create(uid, keyword);
      msgData = await msgStat.find(uid);
    } else {
      const updateData = await msgStat.update(uid, keyword);
      msgData = await msgStat.find(uid);
    }
    responseText = JSON.stringify(msgData);
  } else {
    let msgData = await msgStat.find(uid);
    console.log(msgData);
    if (msgData[0].keyword !== '') {
      const imageUrl = await handleImage(event.message);
      const imageSize = await contentSize(event.message.id);
      let size = imageSize.width;
      if (imageSize.width < imageSize.height) size = imageSize.height;
      console.log('Size...:' + size);

      const buffer = await QRcodeGenerate(msgData[0].keyword, imageUrl, size);
      const github = await uploadGithub(
        event.message.id + '-1.' + imageSize.format,
        buffer
      );
      console.log(github);
      responseText = github.html_url;
      // client.replyMessage(event.replyToken, {
      //   type: 'image',
      //   originalContentUrl: github.download_url,
      //   previewImageUrl: github.download_url,
      // });
    }
  }
  msgStat.close();
  client.replyMessage(event.replyToken, {
    type: 'text',
    text: responseText,
  });
}

module.exports = { handleEvent };
