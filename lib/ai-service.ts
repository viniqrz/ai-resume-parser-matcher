import { analyzeMatch as analyzeWithCloudflare, MatchResult } from './workers-ai';
import { analyzeMatchWithGoogle } from './google-ai';

const MOCK_RESULT: MatchResult = {
  score: 85,
  summary: "This is a mock analysis for UI testing purposes. No real AI was harmed in the making of this result.",
  strengths: [
    "Demonstrates excellent mock experience",
    "Great at showing up in the UI",
    "Consistent performance across all tests"
  ],
  gaps: [
    "Lacks real AI connectivity in this mode",
    "Missing actual resume data to analyze"
  ],
  suggestions: [
    "Configure GOOGLE_API_KEY for real analysis",
    "Try uploading a real PDF to see text extraction"
  ]
};

export async function analyzeMatch(
  resumeText: string,
  jobText: string
): Promise<MatchResult> {
  const aiProvider = process.env.AI_PROVIDER?.toLowerCase();
  const hasGoogleKey = !!process.env.GOOGLE_API_KEY;
  const hasCloudflare = !!(process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN);

  if (aiProvider === 'mock') {
    console.log('Using Mock Provider for analysis');
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate latency
    return MOCK_RESULT;
  }

  if (aiProvider === 'google' || (hasGoogleKey && !aiProvider)) {
    console.log('Using Google Gemini for analysis');
    return analyzeMatchWithGoogle(resumeText, jobText);
  }

  if (aiProvider === 'cloudflare' || (hasCloudflare && !aiProvider)) {
    console.log('Using Cloudflare Workers AI for analysis');
    return analyzeWithCloudflare(resumeText, jobText);
  }

  console.log('No AI credentials found. Falling back to Mock Provider.');
  await new Promise(resolve => setTimeout(resolve, 1500));
  return MOCK_RESULT;
}

export type { MatchResult };
