const express = require('express');
const app = express();
const { get_Sign } = require('./mtgsig_16.js');

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ========== 原有的短链接/长链接解析（不变） ==========
app.get('/api/resolve', async (req, res) => {
  const shortUrl = req.query.url;
  if (!shortUrl) return res.status(400).json({ error: '请提供 url 参数' });
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

// ========== 小程序链接解析（用签名获取商家信息） ==========
app.post('/api/xcx_resolve', async (req, res) => {
  const { url: xcxUrl } = req.body;
  if (!xcxUrl) return res.status(400).json({ error: '请提供小程序链接' });

  // 从小程序链接中提取最后一段作为 poi_id_str
  const match = xcxUrl.match(/\/\/[^\/]+\/([^\/?]+)/);
  const poiIdStr = match ? match[1] : xcxUrl.split('/').pop();
  if (!poiIdStr) return res.status(400).json({ error: '无法提取商家ID' });

  // 签名所需固定参数
  const a3id = 'xv605331y68x59yw1y9y0v1uxywy29w080v6y46608w97978z422049w';
  const wxstr = 'wx2c348cf579062e56';
  const apiUrl = 'https://wx.waimai.meituan.com/weapp/v1/poi/food';

  // 请求参数（模拟小程序环境）
  const params = {
    ui: '1856918819',
    region_id: '1000429006',
    region_version: '1779111775951',
    yodaReady: 'wx',
    csecappid: wxstr,
    csecplatform: '3',
    csecversionname: '9.99.2',
    csecversion: '1.4.0'
  };

  const dataBody = {
    wm_poi_id: '-100',
    poi_id_str: poiIdStr,
    user_id: '1856918819',
    userid: '1856918819',
    wm_actual_latitude: '32007042',
    wm_actual_longitude: '112128632',
    wm_latitude: '32007042',
    wm_longitude: '112128632',
    platform: '13',
    partner: '4',
    sdkVersion: '3.16.0',
    lch: '1000',
    foodlist_uniform_mode: '1',
    dynamic_mode: '1',
    whole_render_dynamic: 'true',
    campaign_type: '-1',
    role_type: '0'
  };

  const fullUrl = apiUrl + '?' + Object.entries(params).map(([k, v]) => k + '=' + encodeURIComponent(v)).join('&');

  try {
    // 生成签名并请求美团接口
    const mtgsig = get_Sign('POST', fullUrl, dataBody, a3id, wxstr);
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781',
        'mtgsig': mtgsig,
        'csecuuid': 'bca31650-f48a-4391-872a-5f3bbba29da9',
        'uuid': 'bca31650-f48a-4391-872a-5f3bbba29da9',
        'csecuserid': '1856918819',
        'xweb_xhr': '1',
        'R2X-Referer': 'https://servicewechat.com/wx2c348cf579062e56/0/page-frame.html',
        'Referer': 'https://servicewechat.com/wx2c348cf579062e56/1048/page-frame.html',
        'wm-ctype': 'wxapp',
        'Accept-Language': 'zh-CN,zh;q=0.9'
      },
      body: new URLSearchParams(dataBody).toString()
    });

    const result = await response.json();
    if (result.code === 0 && result.data?.poi_info) {
      res.json({
        shopId: result.data.poi_info.poi_id_str || poiIdStr,
        shopName: result.data.poi_info.name || null
      });
    } else {
      // 接口调通但没数据，返回 ID 无店名
      res.json({ shopId: poiIdStr, shopName: null });
    }
  } catch (e) {
    // 降级：直接返回提取的 ID
    res.json({ shopId: poiIdStr, shopName: null });
  }
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`Server running on port ${port}`));
