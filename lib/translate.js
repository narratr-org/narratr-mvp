import fetch from 'node-fetch';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const DEEPL_URL = 'https://api-free.deepl.com/v2/translate';
const DEEPL_KEY = process.env.DEEPL_API_KEY;

/**
 * Generate concise summaries with OpenAI then translate them to Korean via
 * DeepL Free API.
 *
 * @param {string[]} texts - Array of source texts.
 * @returns {Promise<string[]>} - Promise resolving to array of Korean summaries.
 */
export async function summarizeAndTranslateKo(texts) {
  if (!OPENAI_KEY) throw new Error('OPENAI_API_KEY not set');
  if (!DEEPL_KEY) throw new Error('DEEPL_API_KEY not set');

  // Step 1: Summarize each text using OpenAI ChatCompletion
  const summaryJobs = texts.map(text =>
    fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: `Summarize the following text in 2-3 concise sentences:\n\n${text}`
          }
        ],
        temperature: 0.3
      })
    })
      .then(r => r.json())
      .then(j => j.choices[0].message.content.trim())
  );

  const summaries = await Promise.all(summaryJobs);

  // Step 2: Translate summaries into Korean using DeepL Free API
  const translateJobs = summaries.map(text =>
    fetch(DEEPL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        auth_key: DEEPL_KEY,
        text,
        target_lang: 'KO'
      })
    })
      .then(r => r.json())
      .then(j => j.translations[0].text)
  );

  return Promise.all(translateJobs);
}
