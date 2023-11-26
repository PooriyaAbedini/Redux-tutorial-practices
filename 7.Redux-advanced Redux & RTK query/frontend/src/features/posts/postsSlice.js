import { 
         createSelector, 
         createEntityAdapter 
} from '@reduxjs/toolkit'
import { apiSlice } from '../api/apiSlice'
import { sub } from 'date-fns'




const postsAdapter = createEntityAdapter({
    selectId: post => post.id,
    // sortComparer: (a, b) => b.date.localeCompare(a.date)
})

const initialState = postsAdapter.getInitialState({
    status: 'idle', // 'idle' | 'loading' | 'success' | 'faild'
    error: null,
    count: 0
});

export const extendedApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getPosts: builder.query({
            query: () => '/posts',
            transformResponse: responseData => {
                let min = 1;
                const loadedPosts = responseData.map(post => {
                    if(!post?.date) post.date = sub(new Date(), { minutes: min++ }).toISOString();
                    if(!post?.reactions) post.reactions = {
                        thumbsUp: 0,
                        wow: 0,
                        heart: 0,
                        rocket: 0,
                        coffee: 0
                    }
                    return post;
                })
                return postsAdapter.setAll(initialState, loadedPosts);
            },
            providesTags: (result, err, arg) => [
                {type: 'Post', id: 'List'},
                ...result.ids.map(id => ({type: 'Post', id}))
            ]
        }),
        getPostsByUserId: builder.query({
            query: id => `/posts/?userId=${id}`,
            transformResponse: responseData => {
                const loadedPosts = responseData.map(post => {
                    let min = 1;
                    if(!post.date) post.date = sub(new Date(), { minutes: min++ }).toISOString;
                    if(!post.reactions) post.reactions = {
                        thumbsUp: 0,
                        wow: 0,
                        heart: 0,
                        rocket: 0,
                        coffee: 0
                    }
                    return post;
                })
                return postsAdapter.setAll(initialState, loadedPosts);
            },
            providesTags: (result, error, arg) => 
                [
                    ...result.ids.map(id => ({type: 'Post', id}))
                ]
        }),
        addNewPost: builder.mutation({
            query: initialPost => ({
               url: '/posts',
               method: 'POST',
               body: {
                ...initialPost,
                userId: Number(initialPost.userId),
                date: new Date().toISOString(),
                reactions: {
                    thumbsUp: 0,
                    wow: 0,
                    heart: 0,
                    rocket: 0,
                    coffee: 0
                }
               } 
            }),
            invalidatesTags: (result, error, arg) => {
                return [{type: 'Post', id: arg.id}]
            }
        }),
        updatePost: builder.mutation({
            query: initialPost => ({
                url: `/posts/${initialPost.id}`,
                method: 'PUT',
                body: {
                    ...initialPost,
                    date: new Date().toISOString()
                }
            }),
            invalidatesTags: (result, error, arg) => [
                {type: 'Post', id: arg.id}
            ]
        }),
        deletePost: builder.mutation({
            query: id => ({
                url: `/posts/${id}`,
                method: 'DELETE',
                body: { id }
            }),
            invalidatesTags: (result, error, arg) => [
                {type: 'Post', id: arg.id}
            ]
        }),
        addReaction: builder.mutation({
            query: ({ postId, reactions }) => ({
                url: `/posts/${postId}`,
                method: 'PATCH',
                // In real app we would probably base this on user ID somhow.
                // So that a user can not post more than one reaction.
                body: { reactions }
            }),
            async onQueryStarted({ postId, reactions }, { dispatch, queryFulfilled}) {
                // `updateQueryData` requires endpoint name and catche key arguments.
                // So that it will know which piece of chache state to update. 
                const patchResult = dispatch(
                    extendedApiSlice.util.updateQueryData('getPosts', undefined, draft => {
                        // 'draft' is immer-wraped and it can be 'mutated' like in createSlice  
                        const post = draft.entities[postId];
                        if(post) post.reactions = reactions
                    })
                )
                try {
                    await queryFulfilled
                } catch  {
                    patchResult.undo();
                }
            }
        })

    })
})

export const {
    useGetPostsQuery,
    useGetPostsByUserIdQuery,
    useAddNewPostMutation,
    useDeletePostMutation,
    useUpdatePostMutation,
    useAddReactionMutation
} = extendedApiSlice;

// Returns the query result object
export const selectPostsResults = extendedApiSlice.endpoints.getPosts.select();

// Create memoized selector
export const selectPostsDate = createSelector(
    selectPostsResults, 
    postResults => postResults.data // Normalized state object with ids & entities
) 

export const {
    selectAll: selectAllPosts,
    selectById: selectPostById,
    selectIds: selectPostIds
} = postsAdapter.getSelectors(state => selectPostsDate(state) ?? initialState)
