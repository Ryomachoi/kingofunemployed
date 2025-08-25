import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    const { content, analysisType, interviewData } = await request.json();
    
    // 사용자 인증 확인
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('sb-localhost-auth-token');
    
    if (!authCookie) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }
    
    // 사용자 정보 가져오기
    const { data: { user }, error: userError } = await supabase.auth.getUser(authCookie.value);
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: '사용자 인증에 실패했습니다.' },
        { status: 401 }
      );
    }
    
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
    let hasParseError = false;
    try {
      parsedData = JSON.parse(aiAnalysis);
    } catch (parseError: any) {
      hasParseError = true;
      parsedData = {
        rawAnalysis: aiAnalysis,
        parseError: true,
        message: '구조화된 분석 실패 - 원본 텍스트로 제공',
      };
    }

    // 데이터베이스에 면접 정보 저장
    const interviewRecord = {
      user_id: user.id,
      company_name: interviewData?.company_name || null,
      position: interviewData?.position || null,
      interview_date: interviewData?.interview_date || null,
      interview_type: interviewData?.interview_type || null,
      difficulty_level: interviewData?.difficulty_level || null,
      result: interviewData?.result || null,
      overall_rating: interviewData?.overall_rating || null,
      feedback_and_tips: interviewData?.feedback_and_tips || null,
      questions_and_answers: interviewData?.questions_and_answers || [],
      ai_feedback: hasParseError ? aiAnalysis : parsedData,
      ai_analysis_metadata: {
        analysisType,
        timestamp: new Date().toISOString(),
        promptId,
        promptVersion,
        hasParseError,
        userInput: userInput.substring(0, 1000) // 처음 1000자만 저장
      },
      analysis_timestamp: new Date().toISOString(),
      ai_analysis_status: 'completed',
      is_public: interviewData?.is_public || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: savedInterview, error: saveError } = await supabase
      .from('interviews')
      .insert([interviewRecord])
      .select('id')
      .single();

    if (saveError) {
      console.error('데이터베이스 저장 오류:', saveError);
      // AI 분석은 성공했지만 저장에 실패한 경우에도 결과는 반환
      return NextResponse.json({
        success: true,
        data: parsedData,
        warning: '분석은 완료되었지만 저장 중 오류가 발생했습니다.',
        metadata: {
          analysisType,
          timestamp: new Date().toISOString(),
          promptId,
          hasParseError,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: parsedData,
      interviewId: savedInterview.id,
      metadata: {
        analysisType,
        timestamp: new Date().toISOString(),
        promptId,
        hasParseError,
        saved: true
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