const express = require('express');
const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// 领券活动页模板（你的联盟链接，{SHOP_ID} 会被替换）
const COUPON_PAGE_TEMPLATE = 'https://offsiteact.meituan.com/web/hoae/collection_waimai_v8/index.html?recallBizId=cpsH5Coupon&bizId=0c3bfd35279b4140b3bd8ecbc41301d6&mediumSrc1=0c3bfd35279b4140b3bd8ecbc41301d6&scene=CPS_SELF_SRC&pageSrc1=CPS_SELF_OUT_SRC_H5_LINK&pageSrc2=0c3bfd35279b4140b3bd8ecbc41301d6&pageSrc3=cf43b6387dd545a58222aba9ae1d7a2d&activityId=6&mediaPvId=dafkdsajffjafdfs&mediaUserId=10086&outActivityId=6&hoaePageV=8&p=554c02ac6c2a4108b162afc11bb6e6c6&poi_id_str={SHOP_ID}';

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

    // 第三步：如果有 shopId，请求领券活动页抓取店名和券额
    let shopName = null;
    let couponAmount = null;
    let couponLimit = null;

    if (shopId) {
      try {
        const couponPageUrl = COUPON_PAGE_TEMPLATE.replace('{SHOP_ID}', shopId);
        const pageResp = await fetch(couponPageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
          }
        });
        const html = await pageResp.text();

        // 尝试从 HTML 中提取 JSON 数据（美团常见两种格式）
        let dataObj = null;

        // 格式1: window.__INITIAL_STATE__ = {...}
        let stateMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*({.*?});/s);
        if (stateMatch) {
          try { dataObj = JSON.parse(stateMatch[1]); } catch(e) {}
        }

        // 格式2: 内嵌在 <script id="__NEXT_DATA__" type="application/json"> 里
        if (!dataObj) {
          let nextDataMatch = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*type="application\/json"[^>]*>(.*?)<\/script>/s);
          if (nextDataMatch) {
            try { dataObj = JSON.parse(nextDataMatch[1]); } catch(e) {}
          }
        }

        // 格式3: 直接搜 "poiBaseInfo"
        if (!dataObj) {
          let poiMatch = html.match(/"poiBaseInfo"\s*:\s*\{[^}]*"name"\s*:\s*"([^"]+)"/);
          if (poiMatch) shopName = poiMatch[1];
          let couponMatch = html.match(/"coupon_amount"\s*:\s*(\d+)/);
          if (couponMatch) couponAmount = parseInt(couponMatch[1]);
          let limitMatch = html.match(/"order_amount_limit"\s*:\s*(\d+)/);
          if (limitMatch) couponLimit = parseInt(limitMatch[1]);
        }

        // 如果从 JSON 对象中提取
        if (dataObj && !shopName) {
          // 递归找第一个 poiBaseInfo
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
        // 抓取失败不影响主流程，只记录
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
