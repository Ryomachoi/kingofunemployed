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
  like_count: number
  comment_count: number
  view_count: number
  created_at: string
  updated_at: string
  author_id: string
  board_id: string
  is_deleted: boolean
  boards?: {
    name: string
  } | null
}

export interface Comment {
  id: string
  content: string
  like_count: number
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