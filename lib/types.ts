// 게시판 및 게시물 관련 타입 정의

export type Forum = {
  id: string;
  name: string;
  description: string;
  created_at: string;
  user_id: string;
  post_count?: number;
};

export type Post = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  forum_id: string;
  vote_count?: number;
  comment_count?: number;
};

export type Comment = {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  post_id: string;
  parent_id?: string;
};

export type Vote = {
  id: string;
  user_id: string;
  post_id: string;
  value: number; // 1 for upvote, -1 for downvote
};

export type User = {
  id: string;
  email: string;
  username?: string;
  created_at: string;
};