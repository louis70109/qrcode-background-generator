const axios = require('axios');

async function uploadGithub(name, chunk) {
  const config = {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${process.env.GITHUB}`,
    },
  };

  const data = {
    message: `✨ Upload ${name}`,
    committer: { name: 'NiJia Lin', email: 'louis70109@gmail.com' },
    content: Buffer.from(chunk).toString('base64').toString('ascii'),
    branch: 'master',
  };
  const url = `https://api.github.com/repos/louis70109/ideas-tree/contents/images/${name}`;
  const result = await axios.put(url, data, config);
  const imageUrl = result.data.content;
  return imageUrl;
}

module.exports = { uploadGithub };
