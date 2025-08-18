import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { content, analysisType } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: '면접 내용을 입력해주세요.' },
        { status: 400 }
      );
    }

    console.log('🔍 요청 정보:');
    console.log('- Content:', content.substring(0, 100) + '...');
    console.log('- Analysis Type:', analysisType);
    console.log('- Prompt ID:', process.env.OPENAI_PROMPT_ID);

    // 1) 프롬프트 ID가 있으면 우선 저장된 프롬프트(o3 포함)로 호출
    const promptId = process.env.OPENAI_PROMPT_ID;
    const promptVersion = process.env.OPENAI_PROMPT_VERSION || '6';

    if (promptId) {
      try {
        console.log('- Using Prompt ID:', promptId, '(version:', promptVersion, ')');

        // ✅ 저장된 프롬프트 호출
        const resp = await openai.responses.create({
          prompt: {
            id: promptId,
            version: promptVersion,
            variables: {
              user_input:
                `분석 타입: ${analysisType || '기본'}\n\n아래 면접 내용을 분석해주세요. ` +
                `결과는 새로운 JSON 스키마에 맞춰 반환해주세요.\n\n${content}`,
            },
          },
        });

        console.log('✅ OpenAI 응답 받음 (Prompt via Responses API)');

        // ✅ 먼저 aiAnalysis를 추출한 후 로깅
        const aiAnalysis =
          (resp as any).output_text ??
          (resp as any).output?.[0]?.content?.[0]?.text?.value ??
          (resp as any).choices?.[0]?.message?.content;

        // 안전 로깅: aiAnalysis가 없을 수 있으니 널-가드 처리
        console.log('📝 원본 AI 응답:', (aiAnalysis ?? '').substring(0, 200) + '...');
        console.log('응답 길이:', aiAnalysis?.length || 0);

        let parsedData;
        try {
          if (!aiAnalysis || aiAnalysis.trim() === '') {
            throw new Error('AI 응답이 비어있습니다');
          }
          parsedData = JSON.parse(aiAnalysis);
          console.log('✅ JSON 파싱 성공');
          console.log('📊 파싱된 데이터 구조:', Object.keys(parsedData));
          
          // 새로운 스키마 필수 필드 검증
          const requiredFields = ['total_score', 'areas', 'general_advice'];
          const missingFields = requiredFields.filter(field => !(field in parsedData));
          if (missingFields.length > 0) {
            console.warn('⚠️ 누락된 필수 필드:', missingFields);
          }
          
          // areas 객체 내 필수 영역 검증
          if (parsedData.areas) {
            const expectedAreas = ['논리적 구조', '커뮤니케이션', '전문성', '자신감'];
            const actualAreas = Object.keys(parsedData.areas);
            const missingAreas = expectedAreas.filter(area => !actualAreas.includes(area));
            if (missingAreas.length > 0) {
              console.warn('⚠️ 누락된 분석 영역:', missingAreas);
            }
          }
          
        } catch (parseError) {
          console.error('❌ JSON 파싱 실패:', parseError);
          console.error('❌ 파싱 시도한 원본 텍스트:', aiAnalysis);
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
            model: 'via_prompt',
            hasParseError: parsedData.parseError || false,
            schema_version: 'v2_areas'
          },
        });
      } catch (e) {
        console.error('❌ Prompt 호출 실패. 모델 직접 호출로 폴백합니다:', e);
        // 프롬프트 호출 실패 시 아래 폴백 경로로 계속 진행
      }
    }

    // 2) (폴백) 환경 변수 기반 모델 직접 호출 경로
    const model = process.env.OPENAI_MODEL || 'gpt-4o';

    const defaultSystemPrompt = `면접 내용을 분석하여 다음 JSON 스키마에 맞춘 상세한 결과를 제공합니다:

{
  "total_score": 10~100 사이의 엄격한 점수 (평균 50~65점),
  "areas": {
    "논리적 구조": {
      "score": 10~100 점수,
      "negative_points": ["구체적 개선점1", "구체적 개선점2", "구체적 개선점3"],
      "practical_advice": "실용적 조언",
      "interviewer_impression": "면접관이 받을 인상"
    },
    "커뮤니케이션": { /* 같은 구조 */ },
    "전문성": { /* 같은 구조 */ },
    "자신감": { /* 같은 구조 */ }
  },
  "general_advice": "총체적이고 현실적인 개선 방향"
}

반드시 위 스키마에 정확히 맞춰 JSON만 반환하세요.`;

    const rawSystemPrompt =
      process.env.OPENAI_SYSTEM_PROMPT ||
      process.env.OPENAI_PROMPT ||
      defaultSystemPrompt;

    let systemPrompt = rawSystemPrompt;
    if (!/json/i.test(systemPrompt)) {
      systemPrompt += '\n\n반드시 유효한 JSON 객체로만 응답하세요. 오직 JSON만 출력하세요.';
    }

    console.log('- Model:', model);
    console.log(
      '- Using system prompt from env:',
      !!(process.env.OPENAI_SYSTEM_PROMPT || process.env.OPENAI_PROMPT)
    );

    // reasoning(o3/o1 등)은 Responses API, 그 외는 Chat Completions API
    const isReasoningModel = /^o\d/i.test(model) || /^o[1-9]/i.test(model);

    let aiAnalysis: string | undefined;

    if (isReasoningModel) {
      const response = await openai.responses.create({
        model,
        input: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content:
              `분석 타입: ${analysisType || '기본'}\n\n아래 면접 내용을 분석해주세요. 새로운 JSON 스키마에 맞춰 결과를 반환해주세요.\n\n${content}`,
          },
        ],
        temperature: process.env.OPENAI_TEMPERATURE ? Number(process.env.OPENAI_TEMPERATURE) : 0.2,
        max_output_tokens: process.env.OPENAI_MAX_TOKENS ? Number(process.env.OPENAI_MAX_TOKENS) : 4000,
      });

      console.log('✅ OpenAI 응답 받음 (Responses API)');
      aiAnalysis =
        (response as any).output_text ??
        (response as any).output?.[0]?.content?.[0]?.text?.value ??
        (response as any).choices?.[0]?.message?.content;
    } else {
      const response = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content:
              `분석 타입: ${analysisType || '기본'}\n\n아제 면접 내용을 분석해주세요. 새로운 JSON 스키마에 맞춰 결과를 반환해주세요.\n\n${content}`,
          },
        ],
        temperature: process.env.OPENAI_TEMPERATURE ? Number(process.env.OPENAI_TEMPERATURE) : 0.2,
        max_tokens: process.env.OPENAI_MAX_TOKENS ? Number(process.env.OPENAI_MAX_TOKENS) : 4000,
        response_format: { type: 'json_object' },
      });

      console.log('✅ OpenAI 응답 받음 (Chat Completions API)');
      aiAnalysis = response.choices[0]?.message?.content;
    }

    console.log('응답 길이:', aiAnalysis?.length || 0);

    let parsedData;
    try {
      parsedData = aiAnalysis ? JSON.parse(aiAnalysis) : {};
      console.log('✅ JSON 파싱 성공');
      console.log('📊 파싱된 데이터 구조:', Object.keys(parsedData));
      
      // 새로운 스키마 필수 필드 검증
      const requiredFields = ['total_score', 'areas', 'general_advice'];
      const missingFields = requiredFields.filter(field => !(field in parsedData));
      if (missingFields.length > 0) {
        console.warn('⚠️ 누락된 필수 필드:', missingFields);
      }
      
    } catch (parseError) {
      console.error('❌ JSON 파싱 실패:', parseError);
      console.error('❌ 파싱 시도한 원본 텍스트:', aiAnalysis);
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
        promptId: process.env.OPENAI_PROMPT_ID,
        model,
        hasParseError: parsedData.parseError || false,
        schema_version: 'v2_areas'
      },
    });
  } catch (error) {
    console.error('🚨 API 오류:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5) : 'No stack'
    });
    
    return NextResponse.json(
      { 
        success: false,
        error: '분석 중 오류가 발생했습니다.',
        details: {
          errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}