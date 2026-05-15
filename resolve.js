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

// 核心解析接口
app.get('/api/resolve', async (req, res) => {
  const shortUrl = req.query.url;
  if (!shortUrl) {
    return res.status(400).send('missing url');
  }
  try {
    const response = await fetch(shortUrl, { redirect: 'follow' });
    const longUrl = response.url;
    // 提取商家ID
    let shopId = null;
    let match = longUrl.match(/\/external\/poi\/([^?]+)/);
    if (match) {
      shopId = match[1];
    } else {
      let poiMatch = longUrl.match(/poi_id_str=([^&]+)/);
      if (poiMatch) shopId = poiMatch[1];
    }
    // 返回 JSON
    res.json({
      resolved_url: longUrl,
      shopId: shopId || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`Proxy running on port ${port}`));
