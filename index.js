'use strict';

if (process.env.NODE_ENV != 'production') require('dotenv').config();

const formidable = require('formidable');
const { AwesomeQR } = require('awesome-qr');
const fs = require('fs');
const line = require('@line/bot-sdk');
const express = require('express');

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// event handler
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  // create a echoing text message
  const echo = { type: 'text', text: event.message.text };

  // use reply API
  return client.replyMessage(event.replyToken, echo);
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
    let config = {}
    if (imageType.includes(files.upload.mimetype)) {
      config = {
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
      config = {
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
    const buffer = await new AwesomeQR(config).draw();

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
  console.log(`listening on ${port}`);
});
