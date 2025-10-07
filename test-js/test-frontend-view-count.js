const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// .env.local 파일 파싱
function parseEnvFile() {
    try {
        const envContent = fs.readFileSync('.env.local', 'utf8');
        const envVars = {};
        
        envContent.split('\n').forEach(line => {
            line = line.trim();
            if (line && !line.startsWith('#')) {
                const [key, ...valueParts] = line.split('=');
                if (key && valueParts.length > 0) {
                    envVars[key.trim()] = valueParts.join('=').trim();
                }
            }
        });
        
        return envVars;
    } catch (error) {
        console.error('❌ .env.local 파일을 읽을 수 없습니다:', error.message);
        return {};
    }
}

// actions.ts의 incrementPostViewCount 함수와 동일한 로직 시뮬레이션
async function simulateIncrementPostViewCount(postId) {
    const envVars = parseEnvFile();
    
    // 프론트엔드에서 사용하는 anon 클라이언트 (실제 코드와 동일)
    const supabase = createClient(
        envVars.NEXT_PUBLIC_SUPABASE_URL,
        envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    try {
        console.log('🔄 조회수 증가 시작 (프론트엔드 로직 시뮬레이션)');
        
        // 현재 조회수 조회
        const { data: currentPost, error: fetchError } = await supabase
            .from('posts')
            .select('view_count')
            .eq('id', postId)
            .eq('is_deleted', false)
            .single();
        
        if (fetchError || !currentPost) {
            console.error('❌ 게시물 조회 오류:', fetchError);
            return 0;
        }
        
        console.log(`📊 현재 조회수: ${currentPost.view_count}`);
        const newViewCount = (currentPost.view_count || 0) + 1;
        console.log(`🎯 시도할 조회수: ${newViewCount}`);
        
        // 조회수 업데이트 (actions.ts와 동일한 방식)
        const { error: updateError } = await supabase
            .from('posts')
            .update({ view_count: newViewCount })
            .eq('id', postId)
            .eq('is_deleted', false);
        
        if (updateError) {
            console.error('❌ 조회수 업데이트 오류:', updateError);
            console.error('   오류 코드:', updateError.code);
            console.error('   오류 메시지:', updateError.message);
            console.error('   오류 세부사항:', updateError.details);
            return currentPost.view_count || 0;
        }
        
        console.log('✅ 업데이트 성공');
        
        // 실제 업데이트 확인
        const { data: verifyPost, error: verifyError } = await supabase
            .from('posts')
            .select('view_count')
            .eq('id', postId)
            .single();
            
        if (verifyError) {
            console.error('❌ 업데이트 확인 오류:', verifyError);
        } else {
            console.log(`📈 실제 업데이트된 조회수: ${verifyPost.view_count}`);
            console.log(`🔍 예상과 일치: ${verifyPost.view_count === newViewCount ? '✅' : '❌'}`);
        }
        
        return newViewCount;
    } catch (error) {
        console.error('❌ 조회수 증가 중 오류:', error);
        return 0;
    }
}

// ViewCounter 컴포넌트 로직 시뮬레이션
async function simulateViewCounter(postId, initialViewCount) {
    console.log('\n🖥️ ViewCounter 컴포넌트 로직 시뮬레이션');
    console.log(`   postId: ${postId}`);
    console.log(`   initialViewCount: ${initialViewCount}`);
    
    // 1. 낙관적 업데이트 (UI에서 먼저 증가)
    const optimisticViewCount = initialViewCount + 1;
    console.log(`🚀 낙관적 업데이트: ${initialViewCount} → ${optimisticViewCount}`);
    
    // 2. 백엔드에 조회수 증가 요청
    console.log('📡 백엔드 요청 시작...');
    const result = await simulateIncrementPostViewCount(postId);
    
    if (result > 0) {
        console.log(`✅ 서버 응답: ${result}`);
        console.log(`🔄 UI 업데이트: ${optimisticViewCount} → ${result}`);
        return result;
    } else {
        console.log('❌ 서버 요청 실패');
        console.log(`🔄 롤백: ${optimisticViewCount} → ${initialViewCount}`);
        return initialViewCount;
    }
}

async function testFrontendViewCount() {
    console.log('🧪 프론트엔드 조회수 증가 로직 테스트\n');
    
    const envVars = parseEnvFile();
    const supabase = createClient(
        envVars.NEXT_PUBLIC_SUPABASE_URL,
        envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    // 테스트할 게시물 찾기
    const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('id, title, view_count')
        .eq('is_deleted', false)
        .limit(1);
        
    if (postsError || !posts || posts.length === 0) {
        console.error('❌ 테스트할 게시물을 찾을 수 없습니다:', postsError);
        return;
    }
    
    const testPost = posts[0];
    console.log(`📝 테스트 게시물: "${testPost.title}"`);
    console.log(`📊 현재 조회수: ${testPost.view_count || 0}`);
    
    // ViewCounter 컴포넌트 시뮬레이션
    const finalViewCount = await simulateViewCounter(testPost.id, testPost.view_count || 0);
    
    console.log('\n📋 테스트 결과 요약:');
    console.log(`   초기 조회수: ${testPost.view_count || 0}`);
    console.log(`   최종 조회수: ${finalViewCount}`);
    console.log(`   증가 여부: ${finalViewCount > (testPost.view_count || 0) ? '✅ 성공' : '❌ 실패'}`);
    
    // 문제 진단
    if (finalViewCount === (testPost.view_count || 0)) {
        console.log('\n🔍 문제 진단:');
        console.log('   조회수가 증가하지 않았습니다.');
        console.log('   가능한 원인:');
        console.log('   1. ❌ RLS 정책이 anon 사용자의 UPDATE를 차단');
        console.log('   2. ❌ Service Role Key가 프론트엔드 코드에서 사용되지 않음');
        console.log('   3. ❌ 테이블 권한 설정 문제');
        console.log('\n💡 해결 방안:');
        console.log('   1. actions.ts에서 Service Role 클라이언트 사용');
        console.log('   2. RPC 함수 사용으로 변경');
        console.log('   3. RLS 정책 수정');
    } else {
        console.log('\n✅ 조회수 증가가 정상적으로 작동합니다!');
    }
}

testFrontendViewCount().catch(console.error);