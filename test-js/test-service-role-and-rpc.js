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

async function testServiceRoleAndRPC() {
    console.log('🔍 Service Role Key와 RPC 함수 종합 테스트 시작\n');
    
    const envVars = parseEnvFile();
    
    // 1. 환경 변수 확인
    console.log('📋 1. 환경 변수 확인:');
    console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${envVars.NEXT_PUBLIC_SUPABASE_URL ? '✅ 설정됨' : '❌ 없음'}`);
    console.log(`   NEXT_PUBLIC_SUPABASE_ANON_KEY: ${envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ 설정됨' : '❌ 없음'}`);
    console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${envVars.SUPABASE_SERVICE_ROLE_KEY ? '✅ 설정됨' : '❌ 없음'}`);
    
    if (!envVars.NEXT_PUBLIC_SUPABASE_URL || !envVars.SUPABASE_SERVICE_ROLE_KEY) {
        console.log('\n❌ 필수 환경 변수가 누락되었습니다.');
        return;
    }
    
    // 2. Service Role 클라이언트 생성 및 연결 테스트
    console.log('\n🔑 2. Service Role 클라이언트 연결 테스트:');
    try {
        const serviceClient = createClient(
            envVars.NEXT_PUBLIC_SUPABASE_URL,
            envVars.SUPABASE_SERVICE_ROLE_KEY
        );
        
        // 간단한 쿼리로 연결 테스트
        const { data, error } = await serviceClient
            .from('posts')
            .select('id, title, view_count')
            .limit(1);
            
        if (error) {
            console.log(`   ❌ Service Role 연결 실패: ${error.message}`);
        } else {
            console.log('   ✅ Service Role 연결 성공');
            console.log(`   📊 테스트 쿼리 결과: ${data?.length || 0}개 게시물 조회됨`);
        }
    } catch (error) {
        console.log(`   ❌ Service Role 클라이언트 생성 실패: ${error.message}`);
        return;
    }
    
    // 3. RPC 함수 존재 여부 확인
    console.log('\n🔧 3. RPC 함수 존재 여부 확인:');
    try {
        const serviceClient = createClient(
            envVars.NEXT_PUBLIC_SUPABASE_URL,
            envVars.SUPABASE_SERVICE_ROLE_KEY
        );
        
        // 더미 UUID로 RPC 함수 호출 테스트
        const testUuid = '00000000-0000-0000-0000-000000000000';
        const { data, error } = await serviceClient.rpc('increment_post_view_count', {
            post_id: testUuid
        });
        
        if (error) {
            if (error.message.includes('function increment_post_view_count') || 
                error.code === 'PGRST202') {
                console.log('   ❌ RPC 함수가 존재하지 않습니다');
                console.log('   💡 create-rpc-function.sql을 Supabase SQL Editor에서 실행해야 합니다');
            } else {
                console.log('   ✅ RPC 함수가 존재합니다 (더미 UUID로 인한 예상된 오류)');
                console.log(`   📝 오류 내용: ${error.message}`);
            }
        } else {
            console.log('   ✅ RPC 함수가 정상적으로 작동합니다');
            console.log(`   📊 반환값: ${data}`);
        }
    } catch (error) {
        console.log(`   ❌ RPC 함수 테스트 중 오류: ${error.message}`);
    }
    
    // 4. 실제 게시물로 RPC 함수 테스트
    console.log('\n🎯 4. 실제 게시물로 RPC 함수 테스트:');
    try {
        const serviceClient = createClient(
            envVars.NEXT_PUBLIC_SUPABASE_URL,
            envVars.SUPABASE_SERVICE_ROLE_KEY
        );
        
        // 실제 게시물 하나 가져오기
        const { data: posts, error: fetchError } = await serviceClient
            .from('posts')
            .select('id, title, view_count')
            .eq('is_deleted', false)
            .limit(1);
            
        if (fetchError || !posts || posts.length === 0) {
            console.log('   ❌ 테스트할 게시물을 찾을 수 없습니다');
            return;
        }
        
        const testPost = posts[0];
        console.log(`   📝 테스트 게시물: "${testPost.title}" (현재 조회수: ${testPost.view_count || 0})`);
        
        // RPC 함수로 조회수 증가 시도
        const { data: newViewCount, error: rpcError } = await serviceClient.rpc('increment_post_view_count', {
            post_id: testPost.id
        });
        
        if (rpcError) {
            console.log(`   ❌ RPC 함수 실행 실패: ${rpcError.message}`);
        } else {
            console.log(`   ✅ RPC 함수 실행 성공! 새로운 조회수: ${newViewCount}`);
            
            // 실제로 DB에 반영되었는지 확인
            const { data: updatedPost, error: checkError } = await serviceClient
                .from('posts')
                .select('view_count')
                .eq('id', testPost.id)
                .single();
                
            if (checkError) {
                console.log(`   ❌ 업데이트 확인 실패: ${checkError.message}`);
            } else {
                console.log(`   📊 DB 확인 결과: ${updatedPost.view_count} (${updatedPost.view_count > (testPost.view_count || 0) ? '✅ 증가됨' : '❌ 변화없음'})`);
            }
        }
    } catch (error) {
        console.log(`   ❌ 실제 테스트 중 오류: ${error.message}`);
    }
    
    // 5. 권한 테스트 (anon vs service_role)
    console.log('\n🔐 5. 권한 비교 테스트:');
    try {
        // Anon 클라이언트로 업데이트 시도
        const anonClient = createClient(
            envVars.NEXT_PUBLIC_SUPABASE_URL,
            envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
        
        const { data: posts } = await anonClient
            .from('posts')
            .select('id')
            .limit(1);
            
        if (posts && posts.length > 0) {
            const { error: anonError } = await anonClient
                .from('posts')
                .update({ view_count: 999 })
                .eq('id', posts[0].id);
                
            console.log(`   Anon Key 직접 업데이트: ${anonError ? '❌ 실패 (예상됨)' : '✅ 성공 (예상되지 않음)'}`);
            if (anonError) {
                console.log(`     오류: ${anonError.message}`);
            }
        }
        
        // Service Role로 업데이트 시도
        const serviceClient = createClient(
            envVars.NEXT_PUBLIC_SUPABASE_URL,
            envVars.SUPABASE_SERVICE_ROLE_KEY
        );
        
        if (posts && posts.length > 0) {
            const { error: serviceError } = await serviceClient
                .from('posts')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', posts[0].id);
                
            console.log(`   Service Role 직접 업데이트: ${serviceError ? '❌ 실패' : '✅ 성공'}`);
            if (serviceError) {
                console.log(`     오류: ${serviceError.message}`);
            }
        }
    } catch (error) {
        console.log(`   ❌ 권한 테스트 중 오류: ${error.message}`);
    }
    
    console.log('\n🏁 테스트 완료');
    console.log('\n💡 문제 해결 방안:');
    console.log('   1. RPC 함수가 없다면: create-rpc-function.sql을 Supabase SQL Editor에서 실행');
    console.log('   2. Service Role Key 문제라면: Supabase 대시보드에서 올바른 키 복사');
    console.log('   3. 권한 문제라면: RLS 정책 확인 또는 SECURITY DEFINER 함수 사용');
    console.log('   4. 서버 재시작: npm run dev 재실행');
}

testServiceRoleAndRPC().catch(console.error);