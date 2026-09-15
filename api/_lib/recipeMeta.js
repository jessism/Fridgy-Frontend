/**
 * Server-side helpers for /r/<slug> share pages (CommonJS, used by api/share.js).
 *
 * Keep in sync with src/utils/recipeSteps.js — CRA's ModuleScopePlugin forbids
 * src/ importing from outside src/, and the Vercel function can't consume
 * CRA's ESM, so the ~40 shared lines are duplicated on purpose.
 */

const SITE_ORIGIN_DEFAULT = 'https://www.trackabite.app';
const FALLBACK_IMAGE_PATH = '/share-fallback.png';
const FALLBACK_IMAGE_W = 1200;
const FALLBACK_IMAGE_H = 630;

function escAttr(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Make a JSON string safe inside a <script> body. These are valid JSON
 * escapes, so JSON.parse and JSON-LD parsers read the original text; they
 * only stop a title containing "</script>" from breaking out of the block.
 */
function escScript(json) {
  return String(json)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/** Every step across every instruction block, as trimmed strings. */
function getStepTexts(recipe) {
  const blocks = Array.isArray(recipe && recipe.analyzedInstructions) ? recipe.analyzedInstructions : [];
  const out = [];
  for (const block of blocks) {
    const steps = Array.isArray(block && block.steps) ? block.steps : [];
    for (const s of steps) {
      const text = s && typeof s.step === 'string' ? s.step.trim() : '';
      if (text) out.push(text);
    }
  }
  return out;
}

function cleanSummary(summary, max = 200) {
  if (!summary || typeof summary !== 'string') return '';
  const text = summary
    .replace(/<[^>]*>/g, '')
    .replace(/&[^;\s]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return '';
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut) + '…';
}

const isHttps = (u) => typeof u === 'string' && /^https:\/\//.test(u);
const isExpiringCdn = (u) =>
  /cdninstagram\.com|fbcdn\.net|instagram\.|tiktokcdn/i.test(String(u || ''));

/**
 * One object the server injects and the client re-renders in Helmet, so the
 * two sets of tags are byte-for-byte equal and helmet-async keeps the
 * server's nodes instead of replacing them.
 */
function buildShareMeta(recipe, slug, origin) {
  const siteOrigin = (origin || SITE_ORIGIN_DEFAULT).replace(/\/+$/, '');
  const title = (recipe && recipe.title) || 'Shared recipe';
  const docTitle = `${title} | Trackabite`;

  const bits = [];
  if (recipe && recipe.readyInMinutes) bits.push(`Ready in ${recipe.readyInMinutes} min`);
  if (recipe && recipe.servings) bits.push(`${recipe.servings} servings`);
  const description =
    cleanSummary(recipe && recipe.summary) ||
    bits.join(' · ') ||
    'A recipe shared from Trackabite.';

  const url = `${siteOrigin}/r/${slug}`;

  let image = null;
  let imageWidth = null;
  let imageHeight = null;
  let isFallbackImage = false;

  if (recipe && isHttps(recipe.ogImage)) {
    image = recipe.ogImage;
    const w = Number(recipe.ogImageWidth);
    const h = Number(recipe.ogImageHeight);
    if (Number.isInteger(w) && Number.isInteger(h) && w > 0 && h > 0) {
      imageWidth = w;
      imageHeight = h;
    }
  } else {
    const candidate = recipe && (recipe.image || (Array.isArray(recipe.image_urls) ? recipe.image_urls[0] : null));
    if (isHttps(candidate) && !isExpiringCdn(candidate)) image = candidate;
  }

  if (!image) {
    image = `${siteOrigin}${FALLBACK_IMAGE_PATH}`;
    imageWidth = FALLBACK_IMAGE_W;
    imageHeight = FALLBACK_IMAGE_H;
    isFallbackImage = true;
  }

  return { title, docTitle, description, url, image, imageWidth, imageHeight, isFallbackImage };
}

function ingredientText(i) {
  if (!i) return '';
  if (typeof i === 'string') return i.trim();
  if (typeof i.original === 'string' && i.original.trim()) return i.original.trim();
  return [i.amount, i.unit, i.name].filter((x) => x !== undefined && x !== null && x !== '').join(' ').trim();
}

/**
 * schema.org Recipe. Authorship: Trackabite never authored a user's recipe,
 * and an import wasn't authored by the user either — so the original creator
 * when we know one, the sharer otherwise, and Trackabite only as publisher.
 * No aggregateRating: there is no review data.
 */
function buildJsonLd(recipe, meta, origin) {
  const siteOrigin = (origin || SITE_ORIGIN_DEFAULT).replace(/\/+$/, '');
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    description: meta.description,
    url: meta.url,
    recipeYield: recipe.servings ? `${recipe.servings} servings` : undefined,
    totalTime: recipe.readyInMinutes ? `PT${recipe.readyInMinutes}M` : undefined,
    recipeIngredient: (Array.isArray(recipe.extendedIngredients) ? recipe.extendedIngredients : [])
      .map(ingredientText)
      .filter(Boolean),
    recipeInstructions: getStepTexts(recipe).map((text, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      text,
    })),
    recipeCuisine: Array.isArray(recipe.cuisines) ? recipe.cuisines[0] : undefined,
    recipeCategory: Array.isArray(recipe.dishTypes) ? recipe.dishTypes[0] : undefined,
    datePublished: recipe.shared_at || undefined,
    publisher: { '@type': 'Organization', name: 'Trackabite', url: siteOrigin },
  };
  if (!meta.isFallbackImage) ld.image = meta.image;
  if (recipe.source_url) {
    ld.isBasedOn = recipe.source_url;
    if (recipe.source_author) ld.author = { '@type': 'Person', name: recipe.source_author };
  } else if (recipe.owner && recipe.owner.displayName) {
    ld.author = { '@type': 'Person', name: recipe.owner.displayName };
  }
  return JSON.parse(JSON.stringify(ld)); // drop undefineds
}

module.exports = {
  SITE_ORIGIN_DEFAULT,
  escAttr,
  escScript,
  getStepTexts,
  cleanSummary,
  buildShareMeta,
  buildJsonLd,
};
