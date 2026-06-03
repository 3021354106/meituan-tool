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

const HONGBAO_H5_URL = 'https://click.meituan.com/t?t=1&c=2&p=y2Pp-bxzOzyq';
const JINTIE_XCX_LINK = '#小程序://美团外卖丨外卖美食奶茶咖啡水果/p1WPEHG7QEU14Hi';
const MEITUAN_APPID = 'wxde8ac0a21135c07d';

function getBeijingTime() { /* 略 */ }

async function logToProxy(record) { /* 略 */ }

// ========== 短链接/长链接解析 ==========
app.get('/api/resolve', async (req, res) => { /* 原有代码不变 */ });

// ========== 小程序链接解析 ==========
app.post('/api/xcx_parse', async (req, res) => { /* 原有代码不变 */ });

// ========== 公众号消息处理 ==========
function extractLink(text) { /* 原有代码不变 */ }
function buildTextReply(fromUser, toUser, content) { /* 原有代码不变 */ }

app.get('/wechat', (req, res) => { /* 原有代码不变 */ });

app.post('/wechat', async (req, res) => {
  try {
    const xml = req.body;
    const toUser = (xml.match(/<ToUserName><!\[CDATA\[(.*?)\]\]><\/ToUserName>/) || [])[1] || '';
    const fromUser = (xml.match(/<FromUserName><!\[CDATA\[(.*?)\]\]><\/FromUserName>/) || [])[1] || '';
    const content = (xml.match(/<Content><!\[CDATA\[(.*?)\]\]><\/Content>/) || [])[1] || '';

    const extracted = extractLink(content);
    if (!extracted) {
      const reply = buildTextReply(fromUser, toUser, '未识别到有效链接');
      return res.type('xml').send(reply);
    }

    let shopId = null;
    if (extracted.type === 'xcx') {
      const resp = await fetch('https://meituan-tool.onrender.com/api/xcx_parse', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
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

    const displayName = '该商家';
    const jumpUrl = SCHEME_TEMPLATE.replace('{SHOP_ID}', shopId);
    const match = jumpUrl.match(/url=([^&]*)/);
    const activityUrl = match ? decodeURIComponent(match[1]) : jumpUrl;

    const hongbaoLink = HONGBAO_H5_URL;
    const jintieLink = JINTIE_XCX_LINK;

    const replyText = `✔ 美团外卖商家券匹配成功 ✔

🎫 ${displayName}已为您匹配到商家券!!

🔥推荐按顺序领取，能叠加更省👇

① 先领通用红包
👉 <a href="${hongbaoLink}">点击领取通用红包</a>

② 再领商家隐藏券（可切号）
👉 <a href="${activityUrl}">点击领取内部商家券</a>

④ 最后领津贴
👉 <a href="${jintieLink}">点击领取津贴</a>

💡使用提示：
搜索对应店铺，能搜到就叠加津贴下单；搜不到就直接用红包+商家券下单。

⭐ <a href="weixin://bizmsgmenu?msgmenucontent=收藏%23${shopId}%23${encodeURIComponent(displayName)}&msgmenuid=1">收藏此店</a> | 📁 <a href="weixin://bizmsgmenu?msgmenucontent=我的收藏&msgmenuid=1">我的收藏夹</a>`;

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
