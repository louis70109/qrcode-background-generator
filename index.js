const express = require('express');

if (process.env.NODE_ENV != 'production') require('dotenv').config();

const formidable = require('formidable');
const { AwesomeQR } = require('awesome-qr');
const fs = require('fs');
const path = require('path');
const ngrok = require('ngrok');
const line = require('@line/bot-sdk');

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};
let baseURL = process.env.BASE_URL;

const client = new line.Client(config);

const app = express();
app.use('/download', express.static('download'));

app.post('/webhooks/line', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

function downloadContent(messageId, downloadPath) {
  return client.getMessageContent(messageId)
    .then((stream) => new Promise((resolve, reject) => {
      const writable = fs.createWriteStream(downloadPath);
      stream.pipe(writable);
      stream.on('end', () => resolve(downloadPath));
      stream.on('error', reject);
    }));
}

function handleImage(message, replyToken) {
  let getContent;
  if (message.contentProvider.type === "line") {
    const downloadPath = path.join(__dirname, 'download', `${message.id}.jpg`);
    const previewPath = path.join(__dirname, 'download', `${message.id}-preview.jpg`);

    getContent = downloadContent(message.id, downloadPath)
      .then((downloadPath) => {
        // Upload to github repo

        return {
          originalContentUrl: baseURL + '/download/' + path.basename(downloadPath),
          previewImageUrl: baseURL + '/download/' + path.basename(previewPath),
        };
      });
  } else if (message.contentProvider.type === "external") {
    getContent = Promise.resolve(message.contentProvider);
  }
  
  return getContent
    .then(({ originalContentUrl, previewImageUrl }) => {
      console.log("_______________________");
      console.log(originalContentUrl);
      console.log("_______________________");
      return client.replyMessage(
        replyToken,
        {
          type: 'image',
          originalContentUrl,
          previewImageUrl,
        }
      );
    });
}

// event handler
function handleEvent(event) {
  console.log(event);
  if (event.type !== 'message' || event.message.type !== 'image') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }
  handleImage(event.message, event.replyToken)
}
app.post('/upload', (req, res) => {
  const form = new formidable.IncomingForm();

  if (form.maxFileSize > 1 * 1024 * 1024) {
    // max 4MB
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end();
    throw 'error';
  }
  form.parse(req, async function (err, fields, files) {
    console.log(files.upload);
    const background = fs.readFileSync(files.upload.filepath);
    const imageType = ['image/jpeg', 'image/png'];
    let qr_config = {}
    if (imageType.includes(files.upload.mimetype)) {
      qr_config = {
        text: fields.url,
        width: 800,
        height: 800,
        typeNumber: 3,
        colorDark: '#000000',
        colorLight: '#ffffff',
        backgroundImage: background,
        autoColor: false,
        dotScale: 0.35,
      };
    } else if (files.upload.mimetype === 'image/gif') {
      qr_config = {
        text: fields.url,
        width: 800,
        height: 800,
        typeNumber: 3,
        colorDark: '#000000',
        colorLight: '#ffffff',
        gifBackground: background,
        autoColor: false,
        dotScale: 0.35,
      };
    }
    const buffer = await new AwesomeQR(qr_config).draw();

    // Local testing.
    // fs.writeFileSync("qrcode.png", buffer);
    const b64 = Buffer.from(buffer).toString('base64');
    // CHANGE THIS IF THE IMAGE YOU ARE WORKING WITH IS .jpg OR WHATEVER
    const mimeType = 'image/png'; // e.g., image/png

    // Use base64 to show img.
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(`<img src="data:${mimeType};base64,${b64}" />`);
    res.end();
  });
});
app.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<h3>Default is 800*800</h3><br>');
  res.write(
    '<form action="upload" method="post" enctype="multipart/form-data">'
  );
  res.write('<input type="file" name="upload"><br><br>');
  res.write(
    '<input type="text" name="url" placeholder="http://aaa.com" required/><br><br>'
  );
  res.write('<input type="submit">');
  res.write('</form>');
  return res.end();
});

// listen on port
const port = process.env.PORT || 8080;
app.listen(port, () => {
  if (baseURL) {
    console.log(`listening on ${baseURL}:${port}/webhooks/lin`);
  } else {
    console.log("It seems that BASE_URL is not set. Connecting to ngrok...")
    const token = process.env.NGROK_TOKEN
    ngrok.connect({
      proto: 'http', // http|tcp|tls, defaults to http
      addr: port, // port or network address, defaults to 80
      authtoken: token, // your authtoken from ngrok.com
      region: 'us', // one of ngrok regions (us, eu, au, ap, sa, jp, in), defaults to us
      }).then(url => {
      baseURL = url;
      console.log(`listening on ${baseURL}/webhooks/line`);
    }).catch(console.error);
  }
});
