const { AwesomeQR } = require('awesome-qr');

async function QRcodeGenerate(text, background, size=400) {
  let qr_config = {
    text: text,
    size,
    typeNumber: 3,
    colorDark: '#000000',
    colorLight: '#ffffff',
    backgroundImage: background,
    autoColor: false,
    dotScale: 0.3,
  };
  return await new AwesomeQR(qr_config).draw();
}

module.exports = { QRcodeGenerate };
