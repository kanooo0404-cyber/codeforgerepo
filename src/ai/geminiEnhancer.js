import { isGeminiConfigured } from '../config/firebase.js';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash';

/**
 * Optional semantic description comparison using Gemini API when configured.
 * Falls back safely to null so the local deterministic algorithm always works.
 */
export async function getGeminiSemanticSimilarity(lostReport, foundReport) {
  if (!isGeminiConfigured || !GEMINI_API_KEY) {
    return null;
  }

  try {
    const prompt = [
      'Compare these two campus lost-and-found item descriptions for semantic similarity.',
      'Return ONLY valid JSON: {"score": number between 0 and 1, "reason": "short 1-sentence reason"}.',
      `Lost item: "${lostReport.itemName}" (${lostReport.colour || 'unknown colour'}) - ${lostReport.description}`,
      `Found item: "${foundReport.itemName}" (${foundReport.colour || 'unknown colour'}) - ${foundReport.description}`,
    ].join('\n');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 120,
          },
        }),
      }
    );

    if (!response.ok) return null;
    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    if (typeof parsed.score !== 'number') return null;

    return {
      score: Math.max(0, Math.min(1, parsed.score)),
      reason: typeof parsed.reason === 'string' ? parsed.reason.slice(0, 140) : '',
    };
  } catch {
    return null;
  }
}
