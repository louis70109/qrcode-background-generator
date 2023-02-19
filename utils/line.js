const { uploadGithub } = require('./github');
const imagesize = require('imagesize');

const line = require('@line/bot-sdk');
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

function contentSize(messageId) {
  return client.getMessageContent(messageId).then(
    (stream) =>
      new Promise((resolve, reject) => {
        
        stream.on('end', async () => {
          resolve(imagesize(stream, function (err, result) {
            if (!err) {
              console.log(result); // {type, width, height}
              return result
            }
          }));
        });
        stream.on('error', reject);
      })
  );
}

async function handleImage(message, replyToken) {
  if (message.contentProvider.type === 'line') {
    const githubContent = await downloadContent(message.id);
    // const imageSize = await contentSize(message.id)
    console.log(githubContent.download_url);
    // console.log('size: '+ imageSize);
    return client.replyMessage(replyToken, {
      type: 'image',
      originalContentUrl: githubContent.download_url,
      previewImageUrl: githubContent.download_url,
    });
  }
}

// event handler
async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'image') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }
  await handleImage(event.message, event.replyToken);
}

module.exports = { handleEvent };
