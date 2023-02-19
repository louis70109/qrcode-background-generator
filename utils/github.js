const axios = require('axios');
const {QRcodeGenerate} = require('./qr')

async function uploadGithub(name, chunk) {
  const config = {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${process.env.GITHUB}`,
    },
  };

  const content = await QRcodeGenerate('https://google.com', chunk)
  const data = {
    message: '✨ Commit',
    committer: { name: 'NiJia Lin', email: 'louis70109@gmail.com' },
    content: Buffer.from(content).toString('base64').toString('ascii'),
    branch: 'master',
  };
  const url = `https://api.github.com/repos/louis70109/ideas-tree/contents/images/${name}.png`;
  const result = await axios.put(url, data, config);
  const imageUrl = result.data.content;
  return imageUrl;
}

module.exports = { uploadGithub };
