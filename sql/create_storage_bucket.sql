-- 게시판 이미지 저장을 위한 Supabase Storage 버킷 생성
-- 이 스크립트는 Supabase Dashboard의 SQL Editor에서 실행하세요

-- 1. board-images 버킷 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('board-images', 'board-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. 인증된 사용자의 업로드 권한 설정
CREATE POLICY "Authenticated users can upload board images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'board-images' AND
  (storage.foldername(name))[1] = 'logos' OR (storage.foldername(name))[1] = 'banners'
);

-- 3. 모든 사용자의 읽기 권한 설정 (공개 접근)
CREATE POLICY "Anyone can view board images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'board-images');

-- 4. 업로드한 사용자의 삭제 권한 설정
CREATE POLICY "Users can delete their own board images" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'board-images' AND auth.uid()::text = (storage.foldername(name))[2]);

-- 완료 메시지
SELECT 'board-images 스토리지 버킷과 정책이 생성되었습니다.' as message;