export const DESCRIPT_HEAD_LAST_POSTS = 'Get recent public posts';
export const DESCRIPT_SUCCESS_LAST_POSTS = 'Successfully retrieved the list of recent posts';
export const DESCRIPT_BAD_REQUEST_LAST_POSTS = 'Invalid request for fetching recent posts';

export const DESCRIPT_HEAD_MY_POSTS = 'Get my posts with infinite scroll';
export const DESCRIPT_DESC_MY_POSTS = 'Returns user publications with cursor-based infinite pagination. ' + 'On the first request, omit the cursor to get the first page. ' + 'For the next page, pass the cursor returned in pageInfo.nextCursor.';
export const DESCRIPT_SUCCESS_MY_POSTS = 'Successfully retrieved user publications page.';
export const DESCRIPT_BAD_REQUEST_MY_POSTS = 'Invalid cursor or request parameters.';
export const DESCRIPT_UNAUTHORIZED_MY_POSTS = 'JWT token is missing or invalid.';
export const DESCRIPT_CURSOR_MY_POSTS = 'ID of the last post from the previous page. ' + 'This post is used only as a cursor and is not included in the next page. ' + 'If omitted, the first page (first 8 posts) is returned.';

export const DESCRIPT_HEAD_UPDATE_POST = 'Update post description and location by id';

export const DESCRIPT_DESC_UPDATE_POST = 'Updates only description and location of the post. ' + 'Available only for the owner of the post.';

export const DESCRIPT_SUCCESS_UPDATE_POST = 'Post was successfully updated (no content in response body).';

export const DESCRIPT_BAD_REQUEST_UPDATE_POST = 'Invalid post id or body data.';

export const DESCRIPT_UNAUTHORIZED_UPDATE_POST = 'JWT token is missing or invalid.';

export const DESCRIPT_FORBIDDEN_UPDATE_POST = 'User is not the owner of the post.';

export const DESCRIPT_NOT_FOUND_UPDATE_POST = 'Post with the given id was not found.';

export const DESCRIPT_HEAD_CREATE_POST = 'Create new post';

export const DESCRIPT_DESC_CREATE_POST = 'Creates a new post for the current user. ' + 'Description and location are optional; filesId is required and must contain only files owned by the user.';

export const DESCRIPT_SUCCESS_CREATE_POST = 'Post was successfully created and returned in the response body.';

export const DESCRIPT_BAD_REQUEST_CREATE_POST = 'Invalid body data or user is not an owner of provided files.';

export const DESCRIPT_UNAUTHORIZED_CREATE_POST = 'JWT token is missing or invalid.';

export const DESCRIPT_HEAD_DELETE_POST = 'Delete post by id';

export const DESCRIPT_DESC_DELETE_POST = 'Soft-deletes all files of the post via FILES_API microservice and removes the post. ' + 'Available only for the owner of the post.';

export const DESCRIPT_SUCCESS_DELETE_POST = 'Post was successfully deleted (no content in response body).';

export const DESCRIPT_BAD_REQUEST_DELETE_POST = 'Files for this post were not found or could not be deleted.';

export const DESCRIPT_UNAUTHORIZED_DELETE_POST = 'JWT token is missing or invalid.';

export const DESCRIPT_FORBIDDEN_DELETE_POST = 'User is not the owner of the post.';

export const DESCRIPT_NOT_FOUND_DELETE_POST = 'Post with the given id was not found.';

export const DESCRIPT_HEAD_GET_USER_POSTS_PUBLIC = 'Get public posts by user id';

export const DESCRIPT_DESC_GET_USER_POSTS_PUBLIC = 'Returns all public posts of the specified user with attached files.';

export const DESCRIPT_SUCCESS_GET_USER_POSTS_PUBLIC = 'Successfully retrieved list of public posts for the user.';

export const DESCRIPT_NOT_FOUND_GET_USER_POSTS_PUBLIC = 'User posts not found.';

export const DESCRIPT_BAD_REQUEST_GET_USER_POSTS_PUBLIC = 'Invalid userId path parameter.';

export const DESCRIPT_HEAD_GET_POST_BY_ID_PUBLIC = 'Get public post by id';

export const DESCRIPT_DESC_GET_POST_BY_ID_PUBLIC = 'Returns public post with author info, images and like info by post id.';

export const DESCRIPT_SUCCESS_GET_POST_BY_ID_PUBLIC = 'Successfully retrieved public post.';

export const DESCRIPT_NOT_FOUND_GET_POST_BY_ID_PUBLIC = 'Post with the given id was not found.';

export const DESCRIPT_BAD_REQUEST_GET_POST_BY_ID_PUBLIC = 'Invalid postId path parameter.';
