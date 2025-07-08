import fetch from 'node-fetch';

const GOOGLE_URL = 'https://translation.googleapis.com/language/translate/v2';
const GOOGLE_KEY = process.env.GOOGLE_TRANSLATE_KEY;

/**
 * Translate an array of texts into Korean using Google Translate API.
 *
 * @param {string[]} texts - Array of source texts.
 * @returns {Promise<string[]>} - Promise resolving to array of translated texts.
 */
export async function translateKo(texts) {
  if (!GOOGLE_KEY) throw new Error('GOOGLE_TRANSLATE_KEY not set');
  const url = `${GOOGLE_URL}?key=${GOOGLE_KEY}`;

  const jobs = texts.map(text =>
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, target: 'ko' })
    })
      .then(r => r.json())
      .then(j => j.data.translations[0].translatedText)
  );

  return Promise.all(jobs);
}
