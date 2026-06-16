
// --- 服务器逻辑 ---
const server = http.createServer(async (req, res) => {
    const requestId = get_ip(req)
    const { method, url: reqUrl } = req;

    // 1. 跨域与基础头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (method === 'OPTIONS') return res.end();

    // 2. 路由与方法校验
    const { pathname } = new URL(reqUrl, `http://${req.headers.host}`);
    if (method !== 'POST' || pathname !== '/api/get_16_mtgsig') {
        return sendRes(res, 404, { success: false, error: '接口不存在' });
    }

    try {
        // 3. 解析请求数据
        const rawBody = await getBody(req);
        let params;
        try {
            params = JSON.parse(rawBody);
        } catch (e) {
            return sendRes(res, 400, { success: false, error: 'JSON格式错误' });
        }
        logger(requestId, `入参: ${JSON.stringify(params)}`);
        const { method: Method, url, data, a3id: a3id, wxstr} = params;
        if (!Method || !url) {
            return sendRes(res, 400, { success: false, error: '缺少必要参数(method/url)' });
        }

        // 4. 执行签名逻辑
        logger(requestId, `开始处理: ${Method} ${url}`);
        const start = Date.now();

        // 调用签名函数
        const sigResult = get_Sign(Method, url, data, a3id, wxstr);

        const cost = Date.now() - start;
        logger(requestId, `处理成功: 耗时 ${cost}ms`);
        logger(requestId, `加密参: ${JSON.stringify(sigResult)}`);
        // 5. 返回结果
        sendRes(res, 200, {
            mtgsig: sigResult,
            requestId,
            time: `${cost}ms`
        });

    } catch (error) {
        logger(requestId, `服务器异常:`, error.message);
        sendRes(res, 500, { success: false, error: '服务器内部错误' });
    }
});

// --- 启动与生命周期管理 ---

const PORT = process.env.PORT || 3005;
server.listen(PORT, () => {
    console.log(`
=========================================
   服务启动成功 | 端口: ${PORT}
   接口地址: /api/get_16_mtgsig
=========================================`);
});

// 优雅关闭
const handleExit = (sig) => {
    console.log(`收到 ${sig} 信号，关闭服务...`);
    server.close(() => process.exit(0));
};
process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);
process.on('uncaughtException', (err) => console.error('未捕获异常:', err));

function get_Sign(method, url, data, dfpid, wxstr) {
    return Mtgsig_init(dfpid, wxstr)(method, url, data)
}

module.exports = { get_Sign };
