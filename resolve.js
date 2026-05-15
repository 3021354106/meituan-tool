const express = require('express');
const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// 测试端点：/test?url=商家页面链接
app.get('/test', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.send('请提供 url 参数');

  try {
    const response = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15' }
    });
    const html = await response.text();

    // 提取店名
    let shopName = null;
    let titleMatch = html.match(/<title>(.*?)<\/title>/);
    if (titleMatch) shopName = titleMatch[1].replace(/[-|]美团外卖.*/, '').trim();

    // 提取优惠券
    let coupon = null;
    let patterns = [/满(\d+)减(\d+)/, /券面额\s*(\d+(?:\.\d+)?)\s*元/, /(\d+(?:\.\d+)?)\s*元代金券/];
    for (let p of patterns) {
      let m = html.match(p);
      if (m) {
        if (p.toString().includes('满')) coupon = `满${m[1]}减${m[2]}`;
        else coupon = `${m[1]}元券`;
        break;
      }
    }
    if (!coupon) {
      let simpler = html.match(/(\d+(?:\.\d+)?)\s*元(?:券|优惠券)/);
      if (simpler) coupon = `${simpler[1]}元券`;
    }

    res.send(`
      <h3>测试结果</h3>
      <p><strong>店名：</strong> ${shopName || '未识别'}</p>
      <p><strong>优惠券：</strong> ${coupon || '未匹配到'}</p>
      <hr>
      <details>
        <summary>查看页面HTML前500个字符</summary>
        <pre>${html.substring(0, 500)}</pre>
      </details>
    `);
  } catch (err) {
    res.status(500).send(`抓取失败：${err.message}`);
  }
});

// 原有的解析接口保持不变
app.get('/api/resolve', async (req, res) => {
  const shortUrl = req.query.url;
  if (!shortUrl) return res.status(400).send('missing url');
  try {
    const response = await fetch(shortUrl, { redirect: 'follow' });
    const longUrl = response.url;
    let shopId = null;
    let match = longUrl.match(/\/external\/poi\/([^?]+)/);
    if (match) shopId = match[1];
    else {
      let poiMatch = longUrl.match(/poi_id_str=([^&]+)/);
      if (poiMatch) shopId = poiMatch[1];
    }
    res.json({ resolved_url: longUrl, shopId: shopId || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`Proxy running on port ${port}`));
