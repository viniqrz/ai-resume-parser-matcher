import { MatchResult } from './workers-ai';

export async function analyzeMatchWithGoogle(
  resumeText: string,
  jobText: string
): Promise<MatchResult> {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error('Missing Google API Key. Please set GOOGLE_API_KEY environment variable.');
  }

  const GOOGLE_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(GOOGLE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `You are a professional resume matching expert. Your task is to compare a resume against a job description and provide a detailed analysis.

You MUST respond with ONLY valid JSON in this exact format, no other text:
{
  "score": <number between 0-100>,
  "summary": "<brief 1-2 sentence summary of the match>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "gaps": ["<gap 1>", "<gap 2>", ...],
  "suggestions": ["<suggestion 1>", "<suggestion 2>", ...]
}

Be specific and actionable. Reference specific requirements from the job description and skills from the resume.

Analyze how well this resume matches the job description.

=== RESUME ===
${resumeText}

=== JOB DESCRIPTION ===
${jobText}

Respond with ONLY the JSON object, no additional text.`
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Google AI API error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  
  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error('Invalid response from Google AI');
  }

  try {
    const jsonString = data.candidates[0].content.parts[0].text.trim();
    const result = JSON.parse(jsonString);
    
    return {
      score: typeof result.score === 'number' ? Math.min(100, Math.max(0, result.score)) : 50,
      summary: result.summary || 'Analysis completed.',
      strengths: Array.isArray(result.strengths) ? result.strengths : [],
      gaps: Array.isArray(result.gaps) ? result.gaps : [],
      suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
    };
  } catch (parseError) {
    console.error('Failed to parse Google AI response:', data.candidates[0].content.parts[0].text);
    throw new Error('Failed to parse AI response. Please try again.');
  }
}
