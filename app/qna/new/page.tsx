import { createPost } from '../actions'

export default function NewPostPage() {
  return (
    <form action={createPost}>
      <label htmlFor="title">제목:</label>
      <input id="title" name="title" type="text" required />
      <label htmlFor="content">내용:</label>
      <textarea id="content" name="content" required />
      <button type="submit">작성하기</button>
    </form>
  )
}