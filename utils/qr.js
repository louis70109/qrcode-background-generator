const { AwesomeQR } = require('awesome-qr');
const imagesize = require('imagesize');

async function QRcodeGenerate(text, background, size = 400, mimeType) {
  let qr_config = {
    text,
    size,
    typeNumber: 3,
    colorDark: '#000000',
    colorLight: '#ffffff',
    backgroundImage: background,
    autoColor: true,
    dotScale: 0.2,
  };

  if (mimeType == 'image/gif') {
    qr_config = {
      text,
      size,
      typeNumber: 3,
      colorDark: '#000000',
      colorLight: '#ffffff',
      gifBackground: background,
      autoColor: false,
      dotScale: 0.35,
    };
  }

  return await new AwesomeQR(qr_config).draw();
}

function imageSize(stream) {
  return new Promise((resolve, reject) => {
    imagesize(stream, function (err, result) {
      if (!err) {
        // console.log(result); // {type, width, height}
        return resolve(result);
      }
    });
  });
}

function selectImageSize(imageSize) {
  let size = imageSize.width;
  if (imageSize.width < imageSize.height) size = imageSize.height;
  console.log('Size...:' + size);
  return size;
}
module.exports = { QRcodeGenerate, imageSize, selectImageSize };
