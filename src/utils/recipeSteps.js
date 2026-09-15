/**
 * Client twin of api/_lib/recipeMeta.js (keep the two in sync).
 *
 * CRA's ModuleScopePlugin forbids importing from outside src/, and the Vercel
 * function can't consume this ESM file, so the shared logic is duplicated.
 * Used by OpenRecipePage for share pages (/r/<slug>).
 */

export const SITE_ORIGIN = 'https://www.trackabite.app';
const FALLBACK_IMAGE_PATH = '/share-fallback.png';
const FALLBACK_IMAGE_W = 1200;
const FALLBACK_IMAGE_H = 630;

/** Every step across every instruction block, as trimmed strings. */
export function getStepTexts(recipe) {
  const blocks = Array.isArray(recipe?.analyzedInstructions) ? recipe.analyzedInstructions : [];
  const out = [];
  for (const block of blocks) {
    const steps = Array.isArray(block?.steps) ? block.steps : [];
    for (const s of steps) {
      const text = typeof s?.step === 'string' ? s.step.trim() : '';
      if (text) out.push(text);
    }
  }
  return out;
}

export function cleanSummary(summary, max = 200) {
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
const isExpiringCdn = (u) => /cdninstagram\.com|fbcdn\.net|instagram\.|tiktokcdn/i.test(String(u || ''));

export function buildShareMeta(recipe, slug, origin = SITE_ORIGIN) {
  const siteOrigin = origin.replace(/\/+$/, '');
  const title = recipe?.title || 'Shared recipe';
  const docTitle = `${title} | Trackabite`;

  const bits = [];
  if (recipe?.readyInMinutes) bits.push(`Ready in ${recipe.readyInMinutes} min`);
  if (recipe?.servings) bits.push(`${recipe.servings} servings`);
  const description = cleanSummary(recipe?.summary) || bits.join(' · ') || 'A recipe shared from Trackabite.';

  const url = `${siteOrigin}/r/${slug}`;

  let image = null;
  let imageWidth = null;
  let imageHeight = null;
  let isFallbackImage = false;

  if (isHttps(recipe?.ogImage)) {
    image = recipe.ogImage;
    const w = Number(recipe.ogImageWidth);
    const h = Number(recipe.ogImageHeight);
    if (Number.isInteger(w) && Number.isInteger(h) && w > 0 && h > 0) {
      imageWidth = w;
      imageHeight = h;
    }
  } else {
    const candidate = recipe?.image || (Array.isArray(recipe?.image_urls) ? recipe.image_urls[0] : null);
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
