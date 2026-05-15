export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).send('missing url');
  try {
    const response = await fetch(url, { redirect: 'follow' });
    res.status(200).send(response.url);
  } catch (err) {
    res.status(500).send(err.message);
  }
}