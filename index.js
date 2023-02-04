
const http = require('http');
const formidable = require('formidable');
const { AwesomeQR } = require("awesome-qr");
const fs = require("fs");

http.createServer(function (req, res) {
  if (req.url == '/upload') {
    var form = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {
      const background = fs.readFileSync(files.upload.filepath);
      const buffer = await new AwesomeQR({
        text: fields.url,
        width: 800,
        height: 800,
        typeNumber: 3,
        colorDark: "#000000",
        colorLight: "#ffffff",
        backgroundImage: background,
        autoColor: true,
        dotScale:0.35
      }).draw();
      
      // Local testing.
      // fs.writeFileSync("qrcode.png", buffer);
      const b64 = Buffer.from(buffer).toString('base64');
      // CHANGE THIS IF THE IMAGE YOU ARE WORKING WITH IS .jpg OR WHATEVER
      const mimeType = 'image/png'; // e.g., image/png

      // Use base64 to show img.
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(`<img src="data:${mimeType};base64,${b64}" />`);
      res.end();
    });
  } else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<h3>Default is 800*800</h3><br>');
    res.write('<form action="upload" method="post" enctype="multipart/form-data">');
    res.write('<input type="file" name="upload"><br><br>');
    res.write('<input type="text" name="url" placeholder="http://aaa.com" required/><br><br>');
    res.write('<input type="submit">');
    res.write('</form>');
    return res.end();
  }
}).listen(parseInt(process.env.PORT) || 8080);