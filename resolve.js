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

// 短链接/长链接解析（你的原有代码保持不变）
// ...

// ========== 🆕 小程序链接解析 ==========
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

  try {
    const payload = {
      type: XCX_PARSE_CONFIG.type,
      key: XCX_PARSE_CONFIG.key,
      username: XCX_PARSE_CONFIG.username,
      appid: XCX_PARSE_CONFIG.appid,
      link: link
    };

    let data;
    try {
      const resp = await fetch(XCX_PARSE_CONFIG.api, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      data = await resp.json();
    } catch {
      // 主接口失败则切换到备用接口
      const resp = await fetch(XCX_PARSE_CONFIG.backup, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      data = await resp.json();
    }

    if (data.code !== 200) {
      return res.status(400).json({ error: data.msg || '解析失败' });
    }

    // 从返回的 page 字段提取参数
    const page = data.data?.page || '';
    const poiIdStr = page.match(/poi_id_str=([^&]+)/)?.[1] || null;

    res.json({
      success: true,
      appid: data.data?.appid || null,
      page: page,
      poiIdStr: poiIdStr
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`Server running on port ${port}`));
