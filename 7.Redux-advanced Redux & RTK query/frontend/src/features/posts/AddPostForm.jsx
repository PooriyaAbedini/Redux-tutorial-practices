import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectAllUsers } from '../users/usersSlice';
import { useNavigate } from 'react-router-dom';
import { useAddNewPostMutation } from './postsSlice';

const AddPostForm = () => {

    const [addNewPost, { isLoading }] = useAddNewPostMutation();
    const navigate = useNavigate();
    const users = useSelector(selectAllUsers);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
    });
    const [userId, setUserId] = useState('');

    const { title, content } = formData;
   

    const onChange = (e) => {
        setFormData(prevValue => ({
            ...prevValue,
            [e.target.name]: e.target.value
        }))
    }
    const onAuthorChange = (e) => {
        setUserId(e.target.value);
    }

    const canSave = [title, userId, content].every(Boolean) && !isLoading;

    const onSavePostClicked = async(e) => {
        e.preventDefault();
        if(canSave) {
            try {
                await addNewPost({title, body: content, userId}).unwrap();
                setFormData({
                    title: '',
                    content: ''
                })
                navigate('/');
            } catch (err) {
                console.error('Failed to save the post', err)
            } 
        }
    }

    const usersOptions = users.map((user) => {
        return  <option 
                    key={user.id} 
                    value={user.id}
                >
                    {user.name}
                </option>
    })

    

  return (
    <section>
            <h2>Add a New Post</h2>
            <form>
                <label htmlFor="postTitle">Post Title:</label>
                <input
                    type="text"
                    id="postTitle"
                    name="title"
                    value={title}
                    onChange={onChange}
                />
                <label htmlFor="postAuthor">Author:</label>
                <select id="postAuthor" value={userId} onChange={onAuthorChange}>
                    {usersOptions}
                </select>
                <label htmlFor="postContent">Content:</label>
                <textarea
                    id="postContent"
                    name="content"
                    value={content}
                    onChange={onChange}
                />
                <button
                    type="button"
                    onClick={onSavePostClicked}
                    disabled={!canSave}
                >Save Post</button>
            </form>
        </section>
  )
}

export default AddPostForm
