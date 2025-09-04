// 데이터베이스 타입 정의

export interface UserProfile {
  id: string
  nickname?: string
  display_name?: string
  created_at?: string
  updated_at?: string
}

export interface Post {
  id: string
  title: string
  content: string
  comment_count: number
  view_count: number
  created_at: string
  updated_at: string
  author_id: string
  board_id: string
  is_deleted: boolean
  tags?: string[]
  boards?: {
    name: string
  } | null
}

export interface Comment {
  id: string
  content: string
  created_at: string
  updated_at: string
  author_id: string
  post_id?: string
  parent_comment_id?: string | null
  is_deleted: boolean
}

export interface Board {
  id: string
  name: string
  description?: string
  category?: string
  industry?: string
  job_category?: string
  headquarters_location?: string
  website?: string
  tags?: string[]
  logo_image_url?: string
  logo_icon?: string
  banner_image_url?: string
  community_rules?: string
  created_at: string
  creator_id: string
  is_active: boolean
  post_count?: number
}

// 프로필 정보가 포함된 확장 타입들
export type PostWithProfile = Post & {
  user_profiles: UserProfile | null
}

export type CommentWithProfile = Comment & {
  user_profiles: UserProfile | null
  replies?: CommentWithProfile[]
}

// 대댓글 관련 타입
export type CommentWithReplies = CommentWithProfile & {
  replies: CommentWithProfile[]
}

// 면접 관련 타입 정의
export interface Interview {
  id: string
  user_id: string
  company_name: string
  position: string
  interview_date?: string
  interview_type?: '화상면접' | '대면면접' | '전화면접' | '기타' | 'video' | 'in_person' | 'phone' | 'other' | 'technical' | 'behavioral' | 'coding' | 'presentation' | 'case_study'
  difficulty_level?: 'easy' | 'medium' | 'hard' | 'very_hard'
  questions_and_answers?: string
  result?: 'pass' | 'fail' | 'pending' | 'in_progress'
  overall_rating?: number
  feedback_and_tips?: string
  ai_feedback?: any
  ai_analysis_metadata?: any
  created_at: string
  updated_at: string
  is_public?: boolean
  is_shared?: boolean
  user_profiles?: UserProfile | null
  question_count?: number
  first_question?: string | null
}

// 면접 질문-답변 타입
export interface InterviewQuestion {
  id: string
  interview_id: string
  question: string
  answer: string
  question_order: number
  created_at: string
}

// 프로필 정보가 포함된 면접 타입
export type InterviewWithProfile = Interview & {
  user_profiles: UserProfile | null
}