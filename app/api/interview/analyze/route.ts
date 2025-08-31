import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { content, analysisType, interviewData } = await request.json();
    
    // 사용자 인증 확인
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다.' },
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
    // 모든 분석 결과를 데이터베이스에 저장 (마이페이지 조회를 위해)
    // is_shared로 커뮤니티 공유 여부 구분 (is_public 컬럼은 존재하지 않음)
    const interviewRecord = {
      user_id: user.id,
      company_name: interviewData?.company_name || '회사명 없음',
      position: interviewData?.position || '직무 없음',
      interview_date: interviewData?.interview_date || new Date().toISOString().split('T')[0], // 오늘 날짜를 기본값으로
      interview_type: interviewData?.interview_type || 'other',
      difficulty_level: interviewData?.difficulty_level || 'medium',
      result: interviewData?.result || null,
      overall_rating: interviewData?.overall_rating || null,
      feedback_and_tips: interviewData?.feedback_and_tips || null,
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
      // questions_and_answers 필드는 별도 테이블로 분리됨
      // is_public 컬럼은 존재하지 않으므로 제거
      is_shared: analysisType === "익명 후기 공유", // 커뮤니티 공유 여부
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: savedInterview, error: saveError } = await supabase
      .from('interviews')
      .insert([interviewRecord])
      .select('id')
      .single();

    // 질문과 답변을 interview_questions 테이블에 저장 (새로운 스키마)
    if (savedInterview?.id && interviewData?.questions_and_answers && Array.isArray(interviewData.questions_and_answers)) {
      const questionsData = interviewData.questions_and_answers.map((qa: any, index: number) => ({
        interview_id: savedInterview.id,
        question_order: index + 1,
        question: qa.question || '',
        answer: qa.answer || ''
      })).filter((qa: any) => qa.question.trim() && qa.answer.trim())

      if (questionsData.length > 0) {
        const { error: questionsError } = await supabase
          .from('interview_questions')
          .insert(questionsData)

        if (questionsError) {
          console.error('Error saving interview questions:', questionsError)
          // 질문 저장 실패해도 분석 결과는 반환
        }
      }
    }

    if (saveError) {
      console.error('=== 데이터베이스 저장 오류 ===');
      console.error('Error Code:', saveError.code);
      console.error('Error Message:', saveError.message);
      console.error('Error Details:', saveError.details);
      console.error('Interview Record:', JSON.stringify(interviewRecord, null, 2));
      console.error('================================');
      // AI 분석은 성공했지만 저장에 실패한 경우에도 결과는 반환
      // 하지만 interviewId는 null로 설정하여 공유 기능을 비활성화
      return NextResponse.json({
        success: true,
        data: parsedData,
        interviewId: null,
        warning: '분석은 완료되었지만 저장 중 오류가 발생했습니다. 데이터베이스 제약조건을 확인해주세요.',
        metadata: {
          analysisType,
          timestamp: new Date().toISOString(),
          promptId,
          hasParseError,
          saved: false,
          saveError: saveError.message,
          errorCode: saveError.code,
          errorDetails: saveError.details
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