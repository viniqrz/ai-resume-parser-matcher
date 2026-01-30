import { NextResponse } from 'next/server';
import { extractTextFromPDF } from '@/lib/pdf-parser';
import { analyzeMatch, MatchResult } from '@/lib/ai-service';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const resumeFile = formData.get('resume') as File | null;
    const jobDescription = (formData.get('jobDescription') as string | null) || '';
    
    let resumeText = 'No resume provided (Mock Mode)';

    if (resumeFile && resumeFile.size > 0) {
      // Validate PDF file type
      if (resumeFile.type !== 'application/pdf') {
        return NextResponse.json(
          { error: 'Only PDF files are accepted' },
          { status: 400 }
        );
      }
      
      // Check file size (max 10MB)
      if (resumeFile.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File size must be less than 10MB' },
          { status: 400 }
        );
      }
      
      // Extract text from resume PDF
      const resumeBuffer = Buffer.from(await resumeFile.arrayBuffer());
      const parsedPDF = await extractTextFromPDF(resumeBuffer);
      resumeText = parsedPDF.text || 'Empty PDF content';
    }
    
    // Analyze with selected AI Service (falls back to mock if no keys provided)
    const result: MatchResult = await analyzeMatch(
      resumeText,
      jobDescription.trim()
    );
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Match API error:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
