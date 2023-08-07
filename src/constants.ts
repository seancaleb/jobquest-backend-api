/**
 * @status  403 - Forbidden
 */
export const FORBIDDEN = "Access Denied: You do not have permission to access this resource.";

/**
 * @status  401 - Unauthorized
 */
export const UNAUTHORIZED = "Unauthorized: Please authenticate to access this resource.";
export const UNAUTHORIZED_ADMIN =
  "Unauthorized Access: This route is restricted to administrators only.";
export const UNAUTHORIZED_EMPLOYER =
  "Unauthorized Access: This route is restricted to employers only.";
export const UNAUTHORIZED_APPLICANT =
  "Unauthorized Access: This route is restricted to user applicants only.";
export const UNAUTHORIZED_UPDATE_JOB =
  "Unauthorized: Only the job creator is allowed to update this job listing.";
export const INVALID_PASSWORD =
  "Invalid Credentials: The provided password is incorrect. Please verify your password and try again.";
export const UNAUTHORIZED_JOB_POST =
  "Unauthorized Access: Only the job creator is allowed to request this job listing.";
export const UNAUTHORIZED_TOKEN_INVALIDATED =
  "Unauthorized: Your token has been invalidated. Please authenticate again to access this resource.";

/**
 * @status  404 - Not Found
 */
export const USER_NOT_FOUND = "User Not Found: The requested user does not exist.";
export const JOB_NOT_FOUND = "Job Not Found: The requested job does not exist.";
export const JOB_APPLICATION_NOT_FOUND =
  "Job Application Not Found: The requested job application does not exist.";

/**
 * @status  409 - Conflict
 */
export const EMAIL_EXISTS =
  "Email Already Exists: The provided email is already associated with an existing account.";
export const JOB_ALREADY_APPLIED =
  "Job Already Applied: You have already submitted an application for this job.";

/**
 * @status  201 - CREATED
 */
export const USER_CREATED = "User Created: The user has been successfully created.";
export const JOB_CREATED = "Job Created: The job has been successfully created.";
export const APPLICATION_CREATED =
  "Application Submitted: The job application has been successfully submitted.";

/**
 * @status  400 - Bad Request
 */
export const BAD_REQUEST = "Bad Request: The server could not understand your request.";

/**
 * @status  200 - SUCCESSS
 */
export const JOB_POST_DELETED = "Job Post Deleted: The job post has been successfully deleted.";
export const JOB_POST_BOOKMARKED = "Job Bookmarked: The job has been successfully bookmarked.";
export const USER_DELETED = "User Deleted: User has been successfully deleted.";
export const PASSWORD_UPDATED = "Password Updated: Password has been successfully updated.";
export const JOB_UNBOOKMARKED =
  "Job Unbookmarked: The job post has been removed from your bookmarks.";

/**
 * @status  204 - No Content
 */
