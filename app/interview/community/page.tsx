import { createClient } from '@/lib/supabase/server'
import CommunityClient from './CommunityClient'

export default async function InterviewCommunityPage() {
  const supabase = await createClient()
  
  // 현재 사용자 정보 가져오기
  const { data: { user } } = await supabase.auth.getUser()
  const currentUserId = user?.id

  // 공유된 면접 후기 목록 조회 (is_shared가 true인 것만)
  const { data: interviews, error } = await supabase
    .from('interviews')
    .select('*')
    .eq('is_shared', true)
    .order('created_at', { ascending: false })

  // 각 면접 후기에 대해 사용자 프로필 정보와 첫 번째 질문을 별도로 조회
  let interviewsWithProfiles = []
  if (interviews) {
    interviewsWithProfiles = await Promise.all(
      interviews.map(async (interview) => {
        // 사용자 프로필 조회
        let profile = null
        if (interview.user_id) {
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('nickname, display_name')
            .eq('user_id', interview.user_id)
            .single()
          profile = profileData
        }

        // 첫 번째 질문 조회 (새로운 스키마)
        const { data: firstQuestion } = await supabase
          .from('interview_questions')
          .select('question')
          .eq('interview_id', interview.id)
          .eq('question_order', 1)
          .single()

        return { 
          ...interview, 
          user_profiles: profile,
          first_question: firstQuestion?.question || null
        }
      })
    )
  }

  if (error) {
    console.error('면접 후기 조회 오류:', error)
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            데이터를 불러오는 중 오류가 발생했습니다
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            잠시 후 다시 시도해주세요.
          </p>
        </div>
      </div>
    )
  }

  return <CommunityClient interviews={interviewsWithProfiles || []} currentUserId={currentUserId} />
}