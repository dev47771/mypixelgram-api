export const DESCRIPT_HEAD_UPLOAD_FILES = 'Upload images for post or avatar';

export const DESCRIPT_DESC_UPLOAD_FILES =
  'Uploads images, validates size and compresses them before sending to FILES_API microservice. ' + 'For type="post" you can upload up to 10 images at once. ' + 'For type="avatar" only the first image is used; if the user already has an avatar, it will be deleted and replaced. ' + 'Requires JWT.';

export const DESCRIPT_SUCCESS_UPLOAD_FILES = 'Files were successfully uploaded and processed. ' + 'For type="avatar" response contains the new avatar file as the first (and only) element of the array.';

export const DESCRIPT_BAD_REQUEST_UPLOAD_FILES = 'Invalid files (too large, invalid format) or invalid type.';

export const DESCRIPT_UNAUTHORIZED_UPLOAD_FILES = 'JWT token is missing or invalid.';
