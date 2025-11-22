export const DESCRIPT_HEAD_LAST_POSTS = 'Get recent public posts';
export const DESCRIPT_SUCCESS_LAST_POSTS = 'Successfully retrieved the list of recent posts';
export const DESCRIPT_BAD_REQUEST_LAST_POSTS = 'Invalid request for fetching recent posts';

export const DESCRIPT_HEAD_MY_POSTS =
  'Get my posts with infinite scroll';
export const DESCRIPT_DESC_MY_POSTS =
  'Returns user publications with cursor-based infinite pagination. ' +
  'On the first request, omit the cursor to get the first page. ' +
  'For the next page, pass the cursor returned in pageInfo.nextCursor.';
export const DESCRIPT_SUCCESS_MY_POSTS =
  'Successfully retrieved user publications page.';
export const DESCRIPT_BAD_REQUEST_MY_POSTS =
  'Invalid cursor or request parameters.';
export const DESCRIPT_UNAUTHORIZED_MY_POSTS =
  'JWT token is missing or invalid.';
export const DESCRIPT_CURSOR_MY_POSTS =
  'ID of the last post from the previous page. ' +
  'This post is used only as a cursor and is not included in the next page. ' +
  'If omitted, the first page (first 8 posts) is returned.';
