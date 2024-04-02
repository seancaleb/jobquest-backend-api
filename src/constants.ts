/**
 * @status  403 - FORBIDDEN
 */
export const FORBIDDEN =
  "Access Denied: You do not have permission to access this resource.";
export const ACCESS_DENIED_ADMIN =
  "Access Denied: This route is restricted to administrators only.";
export const ACCESS_DENIED_EMPLOYER =
  "Acess Denied: This route is restricted to employers only.";
export const ACCESS_DENIED_APPLICANT =
  "Acess Denied: This route is restricted to user applicants only.";
export const ACCESS_DENIED_UPDATE_JOB =
  "Access Denied: Only the job creator is allowed to update this job listing.";
export const ACCESS_DENIED_JOB_POST =
  "Access Denied: Only the job creator is allowed to request this job listing.";

/**
 * @status  401 - UNAUTHORIZED
 */
export const UNAUTHORIZED =
  "Unauthorized: Please authenticate to access this resource.";
export const INVALID_PASSWORD =
  "Invalid Credentials: The provided password is incorrect. Please verify your password and try again.";

/**
 * @status  404 - NOT FOUND
 */
export const ACCOUNT_NOT_FOUND = "Account Not Found: Account doesn't exist.";
export const JOB_NOT_FOUND = "Job Not Found: The requested job doesn't exist.";
export const JOB_APPLICATION_NOT_FOUND =
  "Job Application Not Found: The requested job application doesn't exist.";

/**
 * @status  409 - CONFLICT
 */
export const EMAIL_EXISTS =
  "Email Already Exists: The provided email is already associated with an existing account.";
export const JOB_ALREADY_APPLIED =
  "Job Already Applied: You have already submitted an application for this job.";

/**
 * @status  201 - CREATED
 */
export const ACCOUNT_CREATED =
  "Account Created: Account has been successfully created.";
export const JOB_CREATED =
  "Job Created: The job has been successfully created.";
export const APPLICATION_CREATED =
  "Application Submitted: The job application has been successfully submitted.";

/**
 * @status  400 - BAD REQUEST
 */
export const BAD_REQUEST =
  "Bad Request: The server could not understand your request.";

/**
 * @status  200 - SUCCESS
 */
export const JOB_POST_DELETED =
  "Job Post Deleted: The job post has been successfully deleted.";
export const JOB_POST_BOOKMARKED =
  "Job Bookmarked: The job has been successfully bookmarked.";
export const PASSWORD_UPDATED =
  "Password Updated: Password has been successfully updated.";
export const JOB_UNBOOKMARKED =
  "Job Unbookmarked: The job post has been removed from your bookmarks.";
export const JOB_POST_UPDATED =
  "Job Post Updated: The job post has been successfully updated.";
export const JOB_APPLICATION_STATUS_UPDATED =
  "Application Status Updated: The application status has been successfully updated.";
export const ACCOUNT_DELETED =
  "Account Deleted: Account has been successfully deleted.";
export const PROFILE_AVATAR_UPDATED =
  "Profile Avatar Updated: Profile avatar has been updated.";

/**
 * @status  204 - NO CONTENT
 */
