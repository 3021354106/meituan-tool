const express = require('express');
const app = express();

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
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

    res.json({
      resolved_url: longUrl,
      shopId: shopId || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== 小程序链接解析 ==========
const XCX_PARSE_CONFIG = {
  api: 'https://qnwapi.bcwkds.cn/miniapp/api/',
  backup: 'http://qnwapi.577520.xyz/miniapp/api/',
  type: 'idpath',
  key: 'c2938447eca9399a2e4c27df50438bb9',
  username: 'lyp1014520@163.com',
  appid: 'wxde8ac0a21135c07d'
};

app.post('/api/xcx_parse', async (req, res) => {
  const { link } = req.body;
  if (!link) return res.status(400).json({ error: '请提供小程序链接' });

  const fullLink = link.startsWith('#小程序://') ? link : `#小程序://${link}`;
  console.log('[XCX_PARSE] 收到链接:', fullLink);

  const payload = {
    type: XCX_PARSE_CONFIG.type,
    key: XCX_PARSE_CONFIG.key,
    username: XCX_PARSE_CONFIG.username,
    appid: XCX_PARSE_CONFIG.appid,
    link: fullLink
  };
  console.log('[XCX_PARSE] 请求参数:', JSON.stringify(payload));

  let responseData = null;

  // 1. 尝试主接口
  try {
    console.log('[XCX_PARSE] 尝试主接口:', XCX_PARSE_CONFIG.api);
    const resp = await fetch(XCX_PARSE_CONFIG.api, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log('[XCX_PARSE] 主接口 HTTP 状态:', resp.status);
    const text = await resp.text();
    if (text) {
      responseData = JSON.parse(text);
    }
  } catch (e) {
    console.log('[XCX_PARSE] 主接口失败:', e.message);
  }

  // 2. 主接口失败，尝试备用接口
  if (!responseData || responseData.code !== 200) {
    try {
      console.log('[XCX_PARSE] 尝试备用接口:', XCX_PARSE_CONFIG.backup);
      const resp = await fetch(XCX_PARSE_CONFIG.backup, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      console.log('[XCX_PARSE] 备用接口 HTTP 状态:', resp.status);
      const text = await resp.text();
      if (text) {
        responseData = JSON.parse(text);
      }
    } catch (e) {
      console.log('[XCX_PARSE] 备用接口失败:', e.message);
    }
  }

  // 3. 处理结果
  if (!responseData) {
    return res.status(500).json({ error: '两个接口均无响应，请稍后重试' });
  }

  if (responseData.code !== 200) {
    return res.status(400).json({ error: responseData.msg || '解析失败', detail: responseData });
  }

  const page = responseData.data?.page || '';
  const poiIdStr = page.match(/poi_id_str=([^&]+)/)?.[1] || null;
  console.log('[XCX_PARSE] 提取到的 poi_id_str:', poiIdStr);

  res.json({ success: true, appid: responseData.data?.appid || null, page, poiIdStr });
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`Server running on port ${port}`));
