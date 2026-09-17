/**
 * Vercel Node function behind the `/r/:slug` rewrite (see vercel.json).
 *
 * Serves the real CRA shell (build/index.html) with Open Graph / Twitter tags,
 * a schema.org Recipe block and a JSON bootstrap payload injected, so shared
 * recipe links unfurl in iMessage / WhatsApp / Messenger. Humans, Googlebot
 * and facebookexternalhit all get byte-identical HTML — there is no
 * user-agent branching anywhere in this file. React then hydrates on top and
 * renders the page from the bootstrap without a second fetch.
 *
 * v1 pages are noindex (unlisted links). Plan:
 * trackabite-mobile/MD_files/PLAN_SHARERECIPE_SEPT12.md
 */
const fs = require('fs');
const path = require('path');
const {
  SITE_ORIGIN_DEFAULT, escAttr, escScript, buildShareMeta, buildJsonLd,
} = require('./_lib/recipeMeta');

const API_BASE = (process.env.SHARE_API_BASE_URL || 'https://api.trackabite.app/api').replace(/\/+$/, '');
const SITE_ORIGIN = (process.env.SHARE_SITE_ORIGIN || SITE_ORIGIN_DEFAULT).replace(/\/+$/, '');
const SLUG_RE = /^[a-z0-9-]{1,96}$/;
const TIMEOUT_MS = 3000;

// Short and with no stale-while-revalidate on purpose. Facebook, iMessage and
// WhatsApp each scrape within seconds of a link being sent, so a minute is
// enough to collapse that burst into one API call — while "Stop sharing" has
// to mean the page really stops being served, which a long window (or a stale
// window on top of it) would quietly break.
// max-age=0 + must-revalidate is for the browser; s-maxage is for the CDN.
// Without a browser directive, `public` alone invites heuristic caching and a
// reader keeps seeing yesterday's page long after it changed.
const CACHE_OK = 'public, max-age=0, must-revalidate, s-maxage=60';
// Never cache a miss: an unknown slug becomes a real page the moment someone
// shares, and unsharing then re-sharing brings the same slug back.
const CACHE_MISS = 'no-store';

// One shell per function instance == per deployment, so cached HTML can never
// reference bundles from a different build.
let shellCache = null;
let shellSource = null;

async function getShell(req) {
  if (shellCache) return shellCache;

  // (a) build/index.html bundled via `functions.includeFiles` in vercel.json.
  //     Whether CRA's build output exists at bundle time is unverified, hence (b).
  for (const candidate of [
    path.join(process.cwd(), 'build', 'index.html'),
    path.join(__dirname, '..', 'build', 'index.html'),
  ]) {
    try {
      const html = fs.readFileSync(candidate, 'utf8');
      if (html.includes('id="root"')) {
        shellCache = html;
        shellSource = `file:${candidate}`;
        console.log('[share] shell source', shellSource);
        return shellCache;
      }
    } catch (_) { /* try next */ }
  }

  // (b) fetch our own index.html from the host the visitor used. Vercel's docs
  //     say to target the requested host (not VERCEL_URL) and forward cookies
  //     so this also works on protected preview deployments.
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const headers = { accept: 'text/html' };
    if (req.headers.cookie) headers.cookie = req.headers.cookie;
    const res = await fetch(`${proto}://${host}/index.html`, { signal: controller.signal, headers });
    if (!res.ok) return null;
    const html = await res.text();
    if (!html.includes('id="root"')) return null;
    shellCache = html;
    shellSource = `fetch:${proto}://${host}/index.html`;
    console.log('[share] shell source', shellSource);
    return shellCache;
  } catch (err) {
    console.error('[share] shell fetch failed', err && err.message);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchRecipe(slug) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}/saved-recipes/share/${encodeURIComponent(slug)}`, {
      signal: controller.signal,
      headers: { accept: 'application/json' },
    });
    if (res.status === 200) return { status: 200, recipe: await res.json() };
    if (res.status === 404 || res.status === 410) return { status: res.status, recipe: null };
    console.error('[share] api status', res.status, 'for', slug);
    return { status: 'error' };
  } catch (err) {
    console.error('[share] api fetch failed', err && err.message);
    return { status: 'error' };
  } finally {
    clearTimeout(timer);
  }
}

// CRA emits the built <title> and description on one line, self-closing, with
// attribute order preserved — both forms match. HTML comments are stripped by
// the build, so placeholder tokens were not an option.
const TITLE_RE = /<title>[^<]*<\/title>/i;
// When a platform won't use og:image it falls back to the page icon, which
// site-wide is the 3D app icon. Share pages point it at the flat Fridgy mascot.
const TOUCH_ICON_RE = /<link\s+rel="apple-touch-icon"\s+href="[^"]*"\s*\/?>/i;
const SHARE_ICON_TAG = '<link rel="apple-touch-icon" href="/share-icon.png"/>';
const DESC_RE = /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i;

// helmet-async reconciles head tags carrying data-rh: it keeps the ones equal
// to what React renders and removes the rest. <title> must NOT carry it
// (helmet treats data-rh on <title> as an attribute list).
function metaTag(attrs) {
  const body = Object.keys(attrs).map((k) => `${k}="${escAttr(attrs[k])}"`).join(' ');
  return `<meta data-rh="true" ${body}>`;
}

function injectHead(shell, { title, description, metas, links, scripts }) {
  let html = shell;
  html = html.replace(TITLE_RE, `<title>${escAttr(title)}</title>`);
  html = html.replace(TOUCH_ICON_RE, SHARE_ICON_TAG);
  if (DESC_RE.test(html)) {
    html = html.replace(DESC_RE, metaTag({ name: 'description', content: description }));
  } else {
    metas = [{ name: 'description', content: description }, ...metas];
  }
  const extra = metas.map(metaTag).concat(links, scripts).join('');
  return html.replace('</head>', `${extra}</head>`);
}

const bootstrapTag = (payload) =>
  `<script id="__shared_recipe__" type="application/json">${escScript(JSON.stringify(payload))}</script>`;

module.exports = async (req, res) => {
  const slug =
    (req.query && typeof req.query.slug === 'string' && req.query.slug) ||
    new URL(req.url || '/', 'http://x').searchParams.get('slug') ||
    '';

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-Robots-Tag', 'noindex');

  const shell = await getShell(req);
  if (!shell) {
    res.statusCode = 503;
    res.setHeader('Cache-Control', 'no-store');
    return res.end('<!doctype html><title>Trackabite</title><p>Temporarily unavailable. Please try again in a moment.</p>');
  }

  const noindex = [{ name: 'robots', content: 'noindex' }];
  // Pages with no recipe to show still get a preview image: the Fridgy card
  // rather than nothing, which platforms fill with the app icon.
  const fallbackImage = [
    { property: 'og:image', content: `${SITE_ORIGIN}/share-fallback.png` },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:image', content: `${SITE_ORIGIN}/share-fallback.png` },
  ];
  const result = SLUG_RE.test(slug) ? await fetchRecipe(slug) : { status: 404, recipe: null };

  if (result.status === 'error') {
    // Never hard-fail a human's page load because the API blipped: plain
    // shell, React fetches on its own and shows a retry.
    res.statusCode = 200;
    res.setHeader('Cache-Control', 'no-store');
    return res.end(injectHead(shell, {
      title: 'Trackabite',
      description: 'A recipe shared from Trackabite.',
      metas: [...noindex, ...fallbackImage],
      links: [],
      scripts: [],
    }));
  }

  if (result.status !== 200) {
    res.setHeader('Cache-Control', CACHE_MISS);
    res.statusCode = result.status;
    return res.end(injectHead(shell, {
      title: result.status === 410 ? 'This recipe is no longer shared | Trackabite' : 'Recipe not found | Trackabite',
      description: 'Trackabite recipe link.',
      metas: [...noindex, ...fallbackImage],
      links: [],
      scripts: [bootstrapTag({ slug, status: result.status })],
    }));
  }

  const recipe = result.recipe;
  const meta = buildShareMeta(recipe, slug, SITE_ORIGIN);
  const metas = [
    ...noindex,
    { property: 'og:type', content: 'article' },
    { property: 'og:site_name', content: 'Trackabite' },
    { property: 'og:title', content: meta.title },
    { property: 'og:description', content: meta.description },
    { property: 'og:url', content: meta.url },
    { property: 'og:image', content: meta.image },
  ];
  if (meta.imageWidth && meta.imageHeight) {
    metas.push({ property: 'og:image:width', content: String(meta.imageWidth) });
    metas.push({ property: 'og:image:height', content: String(meta.imageHeight) });
  }
  metas.push(
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: meta.title },
    { name: 'twitter:description', content: meta.description },
    { name: 'twitter:image', content: meta.image },
  );
  const links = [`<link data-rh="true" rel="canonical" href="${escAttr(meta.url)}">`];
  const scripts = [
    // No data-rh: React never renders a JSON-LD block, so helmet must not
    // manage (and therefore remove) this one.
    `<script type="application/ld+json">${escScript(JSON.stringify(buildJsonLd(recipe, meta, SITE_ORIGIN)))}</script>`,
    bootstrapTag({ slug, status: 200, recipe, meta }),
  ];

  res.setHeader('Cache-Control', CACHE_OK);
  res.statusCode = 200;
  return res.end(injectHead(shell, { title: meta.docTitle, description: meta.description, metas, links, scripts }));
};
