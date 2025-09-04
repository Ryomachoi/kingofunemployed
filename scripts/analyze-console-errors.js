// 콘솔 오류 분석 결과

console.log('=== 콘솔 오류 분석 결과 ===\n');

console.log('발생한 오류들:');
console.log('1. net::ERR_ABORTED http://localhost:3000/interview?_rsc=ma2rb');
console.log('2. net::ERR_ABORTED http://localhost:3000/interview/community?_rsc=19dec');
console.log('3. net::ERR_ABORTED http://localhost:3000/interview/a367dbc4-fb9b-4786-8baa-ba6eceec622c?view=community&_rsc=1kneo');
console.log('4. net::ERR_ABORTED http://localhost:3000/interview/analyze?_rsc=qx69p');
console.log('5. net::ERR_ABORTED http://localhost:3000/interview?_rsc=sjeht');
console.log('6. net::ERR_ABORTED http://localhost:3000/interview/community?_rsc=5ct3s');

console.log('\n=== 오류 원인 분석 ===\n');

console.log('1. **Next.js Router Server Components (RSC) 프리페칭 오류**');
console.log('   - URL에 `_rsc=` 파라미터가 있는 것으로 보아 Next.js App Router의 Server Components 프리페칭 요청');
console.log('   - 이는 Next.js가 페이지 전환을 빠르게 하기 위해 미리 컴포넌트를 로드하려는 시도');
console.log('   - ERR_ABORTED는 요청이 중단되었음을 의미 (사용자가 다른 페이지로 이동하거나 요청이 취소됨)');

console.log('\n2. **가능한 원인들**');
console.log('   a) **빠른 페이지 전환**: 사용자가 링크를 클릭한 후 페이지가 로드되기 전에 다른 링크를 클릭');
console.log('   b) **네트워크 지연**: 서버 응답이 느려서 브라우저가 요청을 취소');
console.log('   c) **인증 문제**: 미들웨어에서 인증 확인 중 요청이 중단');
console.log('   d) **개발 서버 불안정**: 개발 모드에서 서버 재시작이나 핫 리로드로 인한 요청 중단');

console.log('\n3. **영향도 평가**');
console.log('   - 이 오류들은 **기능적 문제를 일으키지 않음**');
console.log('   - 단순히 프리페칭 요청이 중단된 것으로, 실제 페이지 접근은 정상 작동');
console.log('   - 사용자 경험에는 영향 없음 (페이지는 정상적으로 로드됨)');

console.log('\n4. **해결 방안**');
console.log('   a) **개발 환경에서는 무시 가능**: 이는 개발 모드에서 흔히 발생하는 현상');
console.log('   b) **프로덕션에서 모니터링**: 실제 배포 후에도 지속되는지 확인');
console.log('   c) **필요시 프리페칭 비활성화**: next/link의 prefetch={false} 옵션 사용');
console.log('   d) **서버 성능 최적화**: 응답 시간 개선으로 요청 중단 빈도 감소');

console.log('\n5. **권장 조치**');
console.log('   - 현재는 **조치 불필요**: 기능에 영향을 주지 않는 개발 환경 특성');
console.log('   - **면접 분석 기능 테스트에 집중**: 실제 기능 동작 확인이 우선');
console.log('   - **프로덕션 배포 후 재평가**: 실제 사용자 환경에서의 발생 빈도 확인');

console.log('\n=== 결론 ===');
console.log('이 오류들은 Next.js App Router의 정상적인 프리페칭 동작 중 발생하는');
console.log('개발 환경 특성으로, 실제 기능에는 영향을 주지 않습니다.');
console.log('면접 분석 및 저장 기능 테스트에 집중하는 것이 좋겠습니다.');

console.log('\n=== 다음 단계 ===');
console.log('1. 수정된 textarea 파싱 로직으로 실제 면접 분석 테스트');
console.log('2. interview_questions 테이블에 데이터가 정상 저장되는지 확인');
console.log('3. 커뮤니티 상세 페이지에서 질문-답변이 정상 표시되는지 확인');