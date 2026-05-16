const express = require('express');
const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/api/resolve', async (req, res) => {
  const shortUrl = req.query.url;
  if (!shortUrl) return res.status(400).json({ error: '请提供 url 参数' });

  try {
    // 第一步：跟随重定向拿到长链接
    const response = await fetch(shortUrl, { redirect: 'follow' });
    const longUrl = response.url;

    // 第二步：提取 shopId
    let shopId = null;
    let match = longUrl.match(/\/external\/poi\/([^?]+)/);
    if (match) {
      shopId = match[1];
    } else {
      let poiMatch = longUrl.match(/poi_id_str=([^&]+)/);
      if (poiMatch) shopId = poiMatch[1];
    }

    // 第三步：如果有 shopId 和长链接，尝试从长链接页面抓取店名和券额
    let shopName = null;
    let couponAmount = null;
    let couponLimit = null;

    if (shopId && longUrl.includes('meituan.com')) {
      try {
        const pageResp = await fetch(longUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
          }
        });
        const html = await pageResp.text();

        // 尝试匹配常见的 JSON 数据块
        let dataObj = null;

        // 格式1: window.__INITIAL_STATE__ = {...}
        let stateMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*({.*?});/s);
        if (stateMatch) {
          try { dataObj = JSON.parse(stateMatch[1]); } catch(e) {}
        }

        // 格式2: <script id="__NEXT_DATA__" type="application/json">
        if (!dataObj) {
          let nextDataMatch = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*type="application\/json"[^>]*>(.*?)<\/script>/s);
          if (nextDataMatch) {
            try { dataObj = JSON.parse(nextDataMatch[1]); } catch(e) {}
          }
        }

        // 格式3: 直接在文本中搜 poiBaseInfo 和 giftInfo
        if (!dataObj) {
          let poiMatch = html.match(/"poiBaseInfo"\s*:\s*\{[^}]*"name"\s*:\s*"([^"]+)"/);
          if (poiMatch) shopName = poiMatch[1];
          let couponMatch = html.match(/"coupon_amount"\s*:\s*(\d+)/);
          if (couponMatch) couponAmount = parseInt(couponMatch[1]);
          let limitMatch = html.match(/"order_amount_limit"\s*:\s*(\d+)/);
          if (limitMatch) couponLimit = parseInt(limitMatch[1]);
        }

        // 如果有 JSON 对象，递归提取
        if (dataObj && !shopName) {
          function findPoi(obj) {
            if (!obj || typeof obj !== 'object') return;
            if (obj.poiBaseInfo && obj.poiBaseInfo.name) {
              shopName = obj.poiBaseInfo.name;
            }
            if (obj.giftInfo && obj.giftInfo.coupon_amount) {
              couponAmount = obj.giftInfo.coupon_amount;
              couponLimit = obj.giftInfo.order_amount_limit || null;
            }
            if (shopName && couponAmount) return;
            for (let key in obj) {
              findPoi(obj[key]);
              if (shopName && couponAmount) return;
            }
          }
          findPoi(dataObj);
        }
      } catch(e) {
        console.log('抓取店名券额失败:', e.message);
      }
    }

    res.json({
      resolved_url: longUrl,
      shopId: shopId || null,
      shopName: shopName || null,
      couponAmount: couponAmount || null,
      couponLimit: couponLimit || null
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`Proxy running on port ${port}`));
