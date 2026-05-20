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

// ========== 短链接/长链接解析（原有功能保持不变） ==========
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

// ========== 🆕 小程序链接解析 ==========
const XCX_PARSE_CONFIG = {
  api: 'https://qnwapi.bcwkds.cn/miniapp/api/',
  backup: 'http://qnwapi.577520.xyz/miniapp/api/',
  type: 'idpath',
  key: 'c2938447eca9399a2e4c27df50438bb9',
  username: 'lyp1014520@163.com',
  appid: 'wxde8ac0a21135c07d'   // 美团外卖小程序 AppID
};

app.post('/api/xcx_parse', async (req, res) => {
  const { link } = req.body;
  if (!link) return res.status(400).json({ error: '请提供小程序链接' });

  // 确保链接格式正确
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

  try {
    // 先尝试主接口
    console.log('[XCX_PARSE] 尝试主接口:', XCX_PARSE_CONFIG.api);
    let resp = await fetch(XCX_PARSE_CONFIG.api, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log('[XCX_PARSE] 主接口 HTTP 状态:', resp.status);

    let data = await resp.json();
    console.log('[XCX_PARSE] 主接口返回数据:', JSON.stringify(data));

    // 主接口失败则尝试备用接口
    if (data.code !== 200) {
      console.log('[XCX_PARSE] 主接口失败，尝试备用接口');
      resp = await fetch(XCX_PARSE_CONFIG.backup, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      console.log('[XCX_PARSE] 备用接口 HTTP 状态:', resp.status);
      data = await resp.json();
      console.log('[XCX_PARSE] 备用接口返回数据:', JSON.stringify(data));
    }

    if (data.code !== 200) {
      return res.status(400).json({
        error: data.msg || '解析失败',
        detail: data
      });
    }

    // 从返回的 page 字段提取 poi_id_str
    const page = data.data?.page || '';
    const poiIdStr = page.match(/poi_id_str=([^&]+)/)?.[1] || null;
    console.log('[XCX_PARSE] 提取到的 poi_id_str:', poiIdStr);

    res.json({
      success: true,
      appid: data.data?.appid || null,
      page: page,
      poiIdStr: poiIdStr
    });
  } catch (e) {
    console.error('[XCX_PARSE] 异常:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ========== 启动服务器 ==========
const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`Server running on port ${port}`));
