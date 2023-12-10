const express = require('express');

if (process.env.NODE_ENV != 'production') require('dotenv').config();

const formidable = require('formidable');
const { AwesomeQR } = require('awesome-qr');
const fs = require('fs');
const ngrok = require('ngrok');
const line = require('@line/bot-sdk');
const { handleEvent } = require('./utils/line');
const axios = require('axios');
const { QRcodeGenerate, imageSize, selectImageSize } = require('./utils/qr');

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};
let baseURL = process.env.BASE_URL;

const app = express();

app.get('/health', (req, res) => {
  res.status(200).end();
});

app.post('/webhooks/line', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

app.post('/upload', (req, res) => {
  const form = new formidable.IncomingForm();

  if (form.maxFileSize > 1 * 1024 * 1024) {
    // max 4MB
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end();
    throw 'error';
  }
  form.parse(req, async function (err, fields, files) {
    // console.log(files.upload.filepath);
    const background = fs.readFileSync(files.upload.filepath);
    const imageType = ['image/jpeg', 'image/png'];
    let size = await imageSize(fs.createReadStream(files.upload.filepath));
    size = selectImageSize(size);

    let buffer = '';
    if (imageType.includes(files.upload.mimetype)) {
      buffer = await QRcodeGenerate(fields.url, background, size);
    }
    if (files.upload.mimetype === 'image/gif') {
      buffer = await QRcodeGenerate(
        fields.url,
        background,
        size,
        files.upload.mimetype
      );
    }

    // Local testing.
    // fs.writeFileSync("qrcode.png", buffer);
    const b64 = Buffer.from(buffer).toString('base64');
    const mimeType = `image/${size.format}`;

    // Use base64 to show image.
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(`<h3>Right click to save it.</h3>`);
    res.write(`<a download="${files.upload.originalFilename}" href="data:${mimeType};base64,${b64}" alt="download image" />Download link</a><br>`);
    res.write(`<img width="250" height="250" src="data:${mimeType};base64,${b64}" alt="download image" />`);
    res.end();
  });
});
app.get('/', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/html',
  });
  fs.readFile('./index.html', null, function (error, data) {
    if (error) {
      res.writeHead(404);
      res.write('Whoops! File not found!');
    } else {
      res.write(data);
    }
    res.end();
  });
});

// Listen on port
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`listening on ${baseURL}:${port}/webhooks/line`);
});
