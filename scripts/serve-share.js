/**
 * Local stand-in for Vercel so api/share.js can be exercised without the CLI.
 *
 *   npm run build && node scripts/serve-share.js
 *   SHARE_API_BASE_URL=http://localhost:5000/api node scripts/serve-share.js   # local backend
 *
 * Then: curl -s http://localhost:3005/r/<slug> | grep -o 'property="og:title"' | wc -l   # 1
 */
const express = require('express');
const path = require('path');
const share = require('../api/share');

const BUILD = path.join(__dirname, '..', 'build');
const app = express();

app.get('/r/:slug', (req, res) => {
  req.query = { ...req.query, slug: req.params.slug };
  share(req, res);
});
app.use(express.static(BUILD));
app.get('*', (_req, res) => res.sendFile(path.join(BUILD, 'index.html')));

const port = process.env.PORT || 3005;
app.listen(port, () => console.log(`share dev server: http://localhost:${port}/r/<slug>`));
