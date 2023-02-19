const express = require('express');

if (process.env.NODE_ENV != 'production') require('dotenv').config();

const formidable = require('formidable');
const { AwesomeQR } = require('awesome-qr');
const fs = require('fs');
const ngrok = require('ngrok');
const line = require('@line/bot-sdk');
const { handleEvent } = require('./utils/line');
const axios = require('axios');

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};
let baseURL = process.env.BASE_URL;

const app = express();

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
    let qr_config = {};
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
    console.log(`listening on ${baseURL}:${port}/webhooks/line`);
  } else {
    console.log('It seems that BASE_URL is not set. Connecting to ngrok...');
    const token = process.env.NGROK_TOKEN;
    ngrok
      .connect({
        proto: 'http',
        addr: port,
        authtoken: token,
        region: 'jp', 
      })
      .then((url) => {
        baseURL = url;
        console.log(`listening on ${baseURL}/webhooks/line`);
        axios
          .put(
            'https://api.line.me/v2/bot/channel/webhook/endpoint',
            { endpoint: `${url}/webhooks/line` },
            {
              headers: {
                Authorization: `Bearer ${config.channelAccessToken}`,
                'Content-Type': 'application/json',
              },
            }
          )
          .then((line) => {
            console.log('Update LINE webhook...: '+line.status);
          });
      })
      .catch(console.error);
  }
});
