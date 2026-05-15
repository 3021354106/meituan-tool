const express = require('express');
const app = express();

// 允许跨域
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// 根路径测试
app.get('/', (req, res) => {
  res.send('Proxy is running');
});

// 核心接口：注意路径是 /api/resolve
app.get('/api/resolve', async (req, res) => {
  const shortUrl = req.query.url;
  if (!shortUrl) {
    return res.status(400).send('missing url');
  }
  try {
    const response = await fetch(shortUrl, { redirect: 'follow' });
    res.send(response.url);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`Proxy running on port ${port}`);
});
