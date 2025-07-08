import { supabase } from './supabaseClient';

/**
 * Fetch new rows from social_raw table after the given sinceId
 * and return an array of text fields.
 * @param {number} sinceId - last processed id
 * @returns {Promise<string[]>}
 */
export async function fetchNewSocialTexts(sinceId) {
  try {
    let query = supabase
      .from('social_raw')
      .select('text, id')
      .order('id');

    if (sinceId !== undefined && sinceId !== null) {
      query = query.gt('id', sinceId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(row => row.text);
  } catch (err) {
    console.error('Error fetching social_raw rows:', err.message);
    return [];
  }
}
