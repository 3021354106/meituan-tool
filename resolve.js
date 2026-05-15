const express = require('express');
const app = express();

app.get('/api/resolve', async (req, res) => {
  const shortUrl = req.query.url;
  if (!shortUrl) return res.status(400).send('missing url');
  try {
    const response = await fetch(shortUrl, { redirect: 'follow' });
    res.send(response.url);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`Proxy running on port ${port}`));