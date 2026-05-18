const express = require('express');
const app = express();

// 引入签名函数
const { get_Sign } = require('./mtgsig_16.js');

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ========== 原有解析接口（短链接 / 长链接） ==========
app.get('/api/resolve', async (req, res) => {
  const shortUrl = req.query.url;
  if (!shortUrl) return res.status(400).json({ error: '请提供 url 参数' });

  try {
    const response = await fetch(shortUrl, { redirect: 'follow' });
    const longUrl = response.url;

    let shopId = null;
    let match = longUrl.match(/\/external\/poi\/([^?]+)/);
    if (match) {
      shopId = match[1];
    } else {
      let poiMatch = longUrl.match(/poi_id_str=([^&]+)/);
      if (poiMatch) shopId = poiMatch[1];
    }

    res.json({
      resolved_url: longUrl,
      shopId: shopId || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== 新增签名接口 ==========
app.post('/api/get_sign', async (req, res) => {
  const { method, url, data, a3id, wxstr } = req.body;
  if (!method || !url) {
    return res.status(400).json({ error: '缺少 method 或 url 参数' });
  }
  try {
    const mtgsig = get_Sign(method, url, data || {}, a3id || '', wxstr || '');
    res.json({ mtgsig });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`Server running on port ${port}`));
