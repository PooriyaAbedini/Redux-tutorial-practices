import { useGetPostsByUserIdQuery } from "../posts/postsSlice"
import { selectUserById } from "./usersSlice"
import { useParams, Link } from "react-router-dom"
import { useSelector } from "react-redux"


const UserPage = () => {

  const { userId } = useParams();
  const user = useSelector(state => selectUserById(state, Number(userId)));

  const {
    data: postsForUser,
    isLoading,
    isError,
    isSuccess,
    error
  } = useGetPostsByUserIdQuery(userId)

  let content;
  if(isLoading) {
    content = <p>Loading...</p>
  } else if(isSuccess) {
      const { ids, entities } = postsForUser;
      content = ids.map(id => (
        <li key={id}>
          <Link to={`/post/${id}`}>{entities[id].title}</Link>
        </li>
      ))
    } else if(isError) {
        console.log(error);
        <p>{error.message}</p>
      }


  return (
    <section>
      <h2>{user?.name}</h2>
      <ol>{ content }</ol>
    </section>
  )
}

export default UserPage
