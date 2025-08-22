import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { content, analysisType } = await request.json();
    
    const normalizedContent = content?.trim();
    if (!normalizedContent) {
      return NextResponse.json(
        { success: false, error: '면접 내용을 입력해주세요.' },
        { status: 400 }
      );
    }

    const promptId = process.env.OPENAI_PROMPT_ID;
    const promptVersion = process.env.OPENAI_PROMPT_VERSION || "8";
    
    if (!promptId) {
      return NextResponse.json(
        { success: false, error: 'OpenAI 프롬프트 ID가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    // 사용자 입력을 user_input 변수로 전달
    const userInput = `분석 타입: ${analysisType || '기본'}\n\n${normalizedContent}`;

    const response = await openai.responses.create({
      prompt: {
        "id": promptId,
        "version": promptVersion,
        "variables": {
          "user_input": userInput
        }
      }
    });

    const aiAnalysis = response.output_text;

    if (!aiAnalysis) {
      throw new Error('OpenAI 응답을 받지 못했습니다.');
    }

    let parsedData;
    try {
      parsedData = JSON.parse(aiAnalysis);
    } catch (parseError) {
      parsedData = {
        rawAnalysis: aiAnalysis,
        parseError: true,
        message: '구조화된 분석 실패 - 원본 텍스트로 제공',
      };
    }

    return NextResponse.json({
      success: true,
      data: parsedData,
      metadata: {
        analysisType,
        timestamp: new Date().toISOString(),
        promptId,
        hasParseError: parsedData.parseError || false,
      },
    });

  } catch (error) {
    console.error('API 오류:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: '분석 중 오류가 발생했습니다.',
        details: {
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}