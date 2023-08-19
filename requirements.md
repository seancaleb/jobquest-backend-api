# Requirements

---

## API Routes

### Public Routes

1. [x] **GET** - /api/jobs - (List all jobs)

### Authenticated Routes

1. [x] **POST** - /api/auth/register - (Register a user)
2. [x] **POST** - /api/auth/login - (Login a User)
3. [x] **GET** - /api/auth/refresh - (Generate a new access token via the refresh endpoint)
4. [x] **POST** - /api/auth/logout - (Logout a user and clear cookies)

### User Routes

1. [x] **GET** - /api/users/profile - (Get the profile of authenticated user)
2. [x] **PATCH** - /api/users/profile - (Update the profile of authenticated user)
3. [x] **DELETE** - /api/users/profile - (Delete the profile of authenticated user)
4. [x] **POST** - /api/users/jobs/:jobId/apply - (Apply to a job by submitting an application)
5. [x] **POST** - /api/users/jobs/:jobId/bookmark - (Bookmark a job post for the authenticated user)
6. [x] **PATCH** - /api/users/update-password - (Update user password)
7. [x] **DELETE** - /api/users/applications/:applicationId - (Delete a specific job application of authenticated user)
8. [x] **GET** - /api/users/applications - (Get all job applications of authenticated user)
9. [x] **GET** - /api/users/bookmarked-jobs - (Get all bookmarked jobs of authenticated user)

### Employer Routes

1. [x] **POST** - /api/employers/jobs - (Create a new job post)
2. [x] **PUT** - /api/employers/jobs/:jobId - (Update a job post with the given ID)
3. [x] **DELETE** - /api/employers/jobs/:jobId - (Delete a job post with the given ID)
4. [x] **GET** - /api/employers/jobs/:jobId/applications - (Get the list of applications for a specific job post)
5. [x] **PATCH** - /api/employers/jobs/:jobId/applications/:applicationId/review - (Review an application for a specific job post)
6. [ ] **GET** - /api/employers/jobs - (Get the list of job postings created by the employer)

### Admin Routes

1. [ ] **POST** - /api/admin/users/:userId/suspend - (Suspend the account of a user with the given user ID)
2. [x] **GET** - /api/admin/users - (Get list of users)
3. [x] **GET** - /api/admin/applications - (Get all job application list of all users)
