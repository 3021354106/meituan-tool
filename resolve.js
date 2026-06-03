const express = require('express');
const app = express();
const crypto = require('crypto');

app.use(express.json());
app.use(express.text({ type: 'text/xml' }));
app.use(express.raw({ type: 'application/xml' }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const WECHAT_TOKEN = 'yichen2026';

const SCHEME_TEMPLATE = 'imeituan://www.meituan.com/web?url=https%3A%2F%2Foffsiteact.meituan.com%2Fweb%2Fhoae%2Fcollection_waimai_v8%2Findex.html%3FrecallBizId%3DcpsH5Coupon%26bizId%3D0c3bfd35279b4140b3bd8ecbc41301d6%26mediumSrc1%3D0c3bfd35279b4140b3bd8ecbc41301d6%26scene%3DCPS_SELF_SRC%26pageSrc1%3DCPS_SELF_OUT_SRC_H5_LINK%26pageSrc2%3D0c3bfd35279b4140b3bd8ecbc41301d6%26pageSrc3%3Dcf43b6387dd545a58222aba9ae1d7a2d%26activityId%3D6%26mediaPvId%3Ddafkdsajffjafdfs%26mediaUserId%3D10086%26outActivityId%3D6%26hoaePageV%3D8%26p%3D554c02ac6c2a4108b162afc11bb6e6c6%26poi_id_str%3D{SHOP_ID}';

function getBeijingTime() {
  const now = new Date();
  const beijingTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return beijingTime.toISOString().replace('T', ' ').substring(0, 19);
}

// 记录日志到 proxy
async function logToProxy(record) {
  try {
    await fetch('https://proxy.yc22.cn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'log', ...record })
    });
  } catch (e) {
    console.error('[LOG] 写入日志失败:', e.message);
  }
}

// ========== 短链接/长链接解析 ==========
app.get('/api/resolve', async (req, res) => {
  const shortUrl = req.query.url;
  if (!shortUrl) return res.status(400).json({ error: '请提供 url 参数' });

  // 保活请求跳过日志记录
  if (shortUrl.includes('dpurl.cn/test')) {
    return res.json({ resolved_url: '', shopId: 'keepalive' });
  }

  const startTime = getBeijingTime();

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

    // 记录成功日志
    logToProxy({
      time: startTime,
      link: shortUrl,
      shop_id: shopId || '未获取',
      status: shopId ? '成功' : '失败',
      error: shopId ? '' : '未找到商家ID',
      balance: '',
      code: shopId ? 200 : 400
    });

    res.json({ resolved_url: longUrl, shopId: shopId || null });
  } catch (err) {
    // 记录失败日志
    logToProxy({
      time: startTime,
      link: shortUrl,
      shop_id: '未获取',
      status: '失败',
      error: err.message,
      detail: err.stack || err.message,
      balance: '',
      code: 0
    });

    res.status(500).json({ error: err.message });
  }
});

// ========== 小程序链接解析 ==========
app.post('/api/xcx_parse', async (req, res) => {
  const { link } = req.body;
  if (!link) return res.status(400).json({ error: '请提供小程序链接' });

  const fullLink = link.startsWith('#小程序://') ? link : `#小程序://${link}`;

  const payload = {
    type: 'idpath',
    key: 'c2938447eca9399a2e4c27df50438bb9',
    username: 'lyp1014520@163.com',
    appid: 'wxde8ac0a21135c07d',
    link: fullLink
  };

  try {
    const resp = await fetch('https://proxy.yc22.cn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await resp.json();

    if (data.code !== 200) {
      return res.status(400).json({ error: data.msg || '解析失败', detail: data });
    }

    const page = data.data?.page || '';
    const poiIdStr = page.match(/poi_id_str=([^&]+)/)?.[1] || null;

    res.json({ success: true, poiIdStr, page });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ========== 公众号消息处理 ==========
function extractLink(text) {
  let m = text.match(/#小程序:\/\/[^\s]*/);
  if (m) return { type: 'xcx', url: m[0] };
  m = text.match(/https?:\/\/dpurl\.cn\/[a-zA-Z0-9]+/);
  if (m) return { type: 'short', url: m[0] };
  m = text.match(/dpurl\.cn\/[a-zA-Z0-9]+/);
  if (m) return { type: 'short', url: 'http://' + m[0] };
  m = text.match(/https?:\/\/[^\s]*meituan\.com[^\s]*/);
  if (m) return { type: 'long', url: m[0] };
  m = text.match(/meituan\.com[^\s]*/);
  if (m) return { type: 'long', url: 'https://' + m[0] };
  return null;
}

function buildTextReply(fromUser, toUser, content) {
  return `<xml>
    <ToUserName><![CDATA[${fromUser}]]></ToUserName>
    <FromUserName><![CDATA[${toUser}]]></FromUserName>
    <CreateTime>${Math.floor(Date.now() / 1000)}</CreateTime>
    <MsgType><![CDATA[text]]></MsgType>
    <Content><![CDATA[${content}]]></Content>
  </xml>`;
}

app.get('/wechat', (req, res) => {
  const { signature, timestamp, nonce, echostr } = req.query;
  const arr = [WECHAT_TOKEN, timestamp, nonce].sort();
  const sha1 = crypto.createHash('sha1').update(arr.join('')).digest('hex');

  if (sha1 === signature) {
    res.send(echostr);
  } else {
    res.send('fail');
  }
});

app.post('/wechat', async (req, res) => {
  try {
    const xml = req.body;
    const toUser = (xml.match(/<ToUserName><!\[CDATA\[(.*?)\]\]><\/ToUserName>/) || [])[1] || '';
    const fromUser = (xml.match(/<FromUserName><!\[CDATA\[(.*?)\]\]><\/FromUserName>/) || [])[1] || '';
    const content = (xml.match(/<Content><!\[CDATA\[(.*?)\]\]><\/Content>/) || [])[1] || '';

    const extracted = extractLink(content);

    if (!extracted) {
      const reply = buildTextReply(fromUser, toUser, '未识别到有效链接，请发送：\ndpurl.cn 短链接\n或 #小程序://... 小程序链接\n或 meituan.com 长链接');
      return res.type('xml').send(reply);
    }

    let shopId = null;

    if (extracted.type === 'xcx') {
      const resp = await fetch('https://meituan-tool.onrender.com/api/xcx_parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link: extracted.url })
      });
      const data = await resp.json();
      shopId = data.poiIdStr || null;
    } else {
      const resp = await fetch(`https://meituan-tool.onrender.com/api/resolve?url=${encodeURIComponent(extracted.url)}`);
      const data = await resp.json();
      shopId = data.shopId || null;
    }

    if (!shopId) {
      const reply = buildTextReply(fromUser, toUser, '解析失败，请确认链接正确且未过期。');
      return res.type('xml').send(reply);
    }

    const jumpUrl = SCHEME_TEMPLATE.replace('{SHOP_ID}', shopId);
    // 🆕 从 imeituan:// 链接里提取活动页 URL，适配微信环境
    const match = jumpUrl.match(/url=([^&]*)/);
    const activityUrl = match ? decodeURIComponent(match[1]) : jumpUrl;
    
    const replyText = `✅ 解析成功！\n\n<a href="${activityUrl}">🚀 点击跳转领券</a>\n\n📎 若未唤起App，请复制链接到浏览器打开。`;

    const reply = buildTextReply(fromUser, toUser, replyText);
    res.type('xml').send(reply);

  } catch (e) {
    const toUser = (req.body?.match(/<ToUserName><!\[CDATA\[(.*?)\]\]><\/ToUserName>/) || [])[1] || '';
    const fromUser = (req.body?.match(/<FromUserName><!\[CDATA\[(.*?)\]\]><\/FromUserName>/) || [])[1] || '';
    if (fromUser && toUser) {
      const reply = buildTextReply(fromUser, toUser, '服务暂时异常，请稍后重试。');
      return res.type('xml').send(reply);
    }
    res.send('success');
  }
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`Server running on port ${port}`));
