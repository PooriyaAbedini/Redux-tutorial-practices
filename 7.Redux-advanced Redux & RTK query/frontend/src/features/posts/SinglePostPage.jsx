import { useSelector } from 'react-redux'
import { selectPostById } from './postsSlice'
import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'

import TimeAgo from './TimeAgo'
import ReactionButtons from './ReactionButtons'
import PostAuthor from './PostAuthor'

const SinglePostPage = () => {
    const { postId } = useParams();
    const post = useSelector(state => selectPostById(state, Number(postId)));

    if(!post) {
        return (
            <section>
                <h2>Post Not Found!</h2>
            </section>
        )
    }

  return (
    <article>
        <h2>{post.title}</h2>
        <p>{post.body}</p>
        <p className='postCredit'>
            <Link to={`/post/edit/${post.id}`}>Edit</Link>
            <PostAuthor userId = {post.userId} />
            <TimeAgo timestamp={post.date} />
        </p>
        <ReactionButtons post={post} />
    </article>
  )
}

export default SinglePostPage
