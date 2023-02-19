const { AwesomeQR } = require('awesome-qr');

async function QRcodeGenerate(text, background) {
  let qr_config = {
    text: text,
    width: 800,
    height: 800,
    typeNumber: 3,
    colorDark: '#000000',
    colorLight: '#ffffff',
    backgroundImage: background,
    autoColor: false,
    dotScale: 0.35,
  };
  return await new AwesomeQR(qr_config).draw();
}

module.exports = { QRcodeGenerate };
