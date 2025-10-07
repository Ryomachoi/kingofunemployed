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

// 수정된 incrementPostViewCount 함수와 동일한 로직 시뮬레이션
async function simulateUpdatedIncrementPostViewCount(postId) {
    const envVars = parseEnvFile();
    
    // 프론트엔드에서 사용하는 anon 클라이언트
    const supabase = createClient(
        envVars.NEXT_PUBLIC_SUPABASE_URL,
        envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    try {
        console.log('🔄 조회수 증가 시작 - RPC 함수 사용');
        
        // RPC 함수를 사용하여 조회수 증가 (RLS 정책 우회)
        const { data, error } = await supabase
            .rpc('increment_post_view_count', { post_id: postId });
        
        if (error) {
            console.error('❌ RPC 함수 호출 오류:', error);
            console.error('   오류 코드:', error.code);
            console.error('   오류 메시지:', error.message);
            
            // RPC 함수가 없는 경우 기존 방식으로 폴백
            if (error.code === '42883') { // function does not exist
                console.log('⚠️ RPC 함수가 없어 기존 방식으로 폴백');
                
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
                
                const newViewCount = (currentPost.view_count || 0) + 1;
                
                // 조회수 업데이트
                const { error: updateError } = await supabase
                    .from('posts')
                    .update({ view_count: newViewCount })
                    .eq('id', postId)
                    .eq('is_deleted', false);
                
                if (updateError) {
                    console.error('❌ 조회수 업데이트 오류:', updateError);
                    return currentPost.view_count || 0;
                }
                
                console.log(`✅ 폴백 방식으로 업데이트: ${newViewCount}`);
                return newViewCount;
            }
            
            return 0;
        }
        
        console.log(`✅ RPC 함수로 업데이트된 조회수: ${data}`);
        return data || 0;
    } catch (error) {
        console.error('❌ 조회수 증가 중 오류:', error);
        return 0;
    }
}

async function testUpdatedViewCount() {
    console.log('🧪 수정된 조회수 증가 로직 테스트\n');
    
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
    
    // 수정된 로직으로 조회수 증가 테스트
    const result = await simulateUpdatedIncrementPostViewCount(testPost.id);
    
    // 실제 업데이트 확인
    const { data: verifyPost, error: verifyError } = await supabase
        .from('posts')
        .select('view_count')
        .eq('id', testPost.id)
        .single();
        
    if (verifyError) {
        console.error('❌ 업데이트 확인 오류:', verifyError);
    } else {
        console.log(`📈 실제 조회수: ${verifyPost.view_count}`);
    }
    
    console.log('\n📋 테스트 결과 요약:');
    console.log(`   초기 조회수: ${testPost.view_count || 0}`);
    console.log(`   반환된 조회수: ${result}`);
    console.log(`   실제 조회수: ${verifyPost ? verifyPost.view_count : '확인 불가'}`);
    
    const success = result > (testPost.view_count || 0) && 
                   verifyPost && verifyPost.view_count > (testPost.view_count || 0);
    
    console.log(`   증가 여부: ${success ? '✅ 성공' : '❌ 실패'}`);
    
    if (success) {
        console.log('\n🎉 조회수 증가가 정상적으로 작동합니다!');
        console.log('   ✅ RPC 함수가 올바르게 실행됨');
        console.log('   ✅ RLS 정책이 우회됨');
        console.log('   ✅ 데이터베이스에 정상 반영됨');
    } else {
        console.log('\n🔍 문제가 여전히 존재합니다:');
        if (result === 0) {
            console.log('   ❌ RPC 함수 호출 실패');
            console.log('   💡 Supabase SQL Editor에서 RPC 함수 생성 확인 필요');
        } else if (!verifyPost || verifyPost.view_count === (testPost.view_count || 0)) {
            console.log('   ❌ 데이터베이스 업데이트 실패');
            console.log('   💡 RLS 정책 또는 권한 문제 가능성');
        }
    }
}

testUpdatedViewCount().catch(console.error);