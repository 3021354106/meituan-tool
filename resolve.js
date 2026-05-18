const express = require('express');
const app = express();

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// ========== 短链接/长链接解析 ==========
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

    let shopName = null;
    let couponAmount = null;

    res.json({
      resolved_url: longUrl,
      shopId: shopId || null,
      shopName: shopName || null,
      couponAmount: couponAmount || null
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== 小程序链接解析 ==========
app.post('/api/xcx_resolve', async (req, res) => {
  const { c } = req.body;
  if (!c) return res.status(400).json({ error: '请提供小程序链接' });

  try {
    const response = await fetch('https://aj9.cn/api/_q/cq', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({ c })
    });

    const data = await response.json();

    if (!data.ok || !data.poi) {
      return res.status(400).json({ error: '解析失败，请确认链接正确' });
    }

    res.json({
      shopId: data.poi,
      shopName: data.first_poi?.name || null,
      couponAmount: data.first_poi?.coupon_amount || null,
      couponAmountYuan: data.first_poi?.coupon_amount_yuan || null
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`Proxy running on port ${port}`));
