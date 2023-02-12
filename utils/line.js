const { uploadGithub } = require('./github');

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
          console.log(imagedata);
          resolve(await uploadGithub(messageId, imagedata));
        });

        stream.on('error', reject);
      })
  );
}

async function handleImage(message, replyToken) {
  if (message.contentProvider.type === 'line') {
    const githubContent = await downloadContent(message.id);
    console.log(githubContent.download_url);
    return client.replyMessage(replyToken, {
      type: 'image',
      originalContentUrl: githubContent.download_url,
      previewImageUrl: githubContent.download_url,
    });
  }
}

// event handler
function handleEvent(event) {
  console.log(event);
  if (event.type !== 'message' || event.message.type !== 'image') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }
  handleImage(event.message, event.replyToken);
}

module.exports = { handleEvent };
