import { useState } from 'react'
import { useSelector } from 'react-redux'
import { selectPostById } from './postsSlice'
import { useParams, useNavigate } from 'react-router-dom'
import { selectAllUsers } from '../users/usersSlice'
import { useUpdatePostMutation, useDeletePostMutation } from './postsSlice'

const EditPostForm = () => {

    const [updatePost, { isLoading }] = useUpdatePostMutation();
    const [deletePost] = useDeletePostMutation();
    const navigate = useNavigate();
    const { postId } = useParams();

    const users = useSelector(selectAllUsers);
    const post = useSelector(state => selectPostById(state, Number(postId)));
    
    const [title, setTitle] = useState(post?.title);
    const [content, setContent] = useState(post?.body);    
    const [userId, setUserId] = useState(post?.userId);

    if(!post) {
        return <h2>Post Not Found!</h2>
    }
    const onTitleChange = (e) => { setTitle(e.target.value) };
    const onContentChange = (e) => { setContent(e.target.value) };
    const onAuthorChanged = (e) => { setUserId(Number(e.target.value)) }

    const usersOptions = users.map((user) => {
        return (
            <option
                key={user.id}
                value={user.id}
            >
                {user.name}
            </option>
        )
    })

    const canSave = [title, content, userId].every(Boolean) && !isLoading;

    const onSavePostClicked = async() => {
        if (canSave) {
            try {
                await updatePost({
                    id: post.id, 
                    title, 
                    body: content, 
                    userId, 
                    reactions: post.reactions}).unwrap();
                    
                    setTitle('');
                    setContent('');
                    setUserId('');
                    navigate(`/post/${post.id}`)
            } catch (error) {
                console.log(error)
            }
        }
    }

    const onDeletePostClicked = async() => {
        const id = post.id;
        try {
            await deletePost(id).unwrap();
                setTitle('');
                setContent('');
                setUserId('');
                navigate('/');
        } catch (error) {
            console.log(error)
        }
    }

  return (
    <>
      <section>
            <h2>Edit Post</h2>
            <form>
                <label htmlFor="postTitle">Post Title:</label>
                <input
                    type="text"
                    id="postTitle"
                    name="postTitle"
                    value={title}
                    onChange={onTitleChange}
                />
                <label htmlFor="postAuthor">Author:</label>
                <select id="postAuthor" defaultValue={userId} onChange={onAuthorChanged}>
                    {usersOptions}
                </select>
                <label htmlFor="postContent">Content:</label>
                <textarea
                    id="postContent"
                    name="postContent"
                    value={content}
                    onChange={onContentChange}
                />
                <button
                    type="button"
                    onClick={onSavePostClicked}
                    disabled={!canSave}
                >
                    Save Post
                </button>
                <button className="deleteButton"
                    type="button"
                    onClick={onDeletePostClicked}
                >
                    Delete Post
                </button>
            </form>
        </section>
    </>
  )
}

export default EditPostForm
