import { useSelector } from 'react-redux'
import  { selectAllPosts } from './postsSlice'
import PostExcerpt from './PostExcerpt'
import { useGetPostsQuery } from './postsSlice'

const PostsList = () => {

  const {
    isLoading,
    isSuccess,
    isError,
    error
  } = useGetPostsQuery();

  const posts = useSelector(selectAllPosts);
  const orderedPosts = posts.slice().sort((a, b) => b.date.localeCompare(a.date));

  let content;
  if (isLoading) {
    content = <p>is loading...</p>
  } else if(isSuccess){
      content = orderedPosts?.map( post => { 
        return <PostExcerpt key={post.id} postId={post.id} />
      })
  } else if (isError) {
      content = <p>{ error }</p>
  }

  return (
    <section>
        <h2>Posts</h2>
        {content}
    </section>
  )
}

export default PostsList
