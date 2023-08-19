# SNJOBS Back-End API (Built with Node.js, Express, TypeScript, Mongoose, MongoDB, JWT and Zod)

This repository contains a Job Backend API developed using Node.js, Express.js, TypeScript, Mongoose, MongoDB, and Zod. It provides a set of routes to manage jobs, user authentication, user profiles, job applications, bookmarks, and employer-specific operations. This README.md file provides an overview of the API and explains how to set it up and use it effectively.

## Table of Contents

- [High-level Features](#high-level-features)
- [Technical Features](#technical-features)
- [Requirements](#requirements)
- [Back-End Data Architecture](#back-end-data-architecture)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the API](#running-the-api)
- [API Routes](#api-routes)
  - [Public Routes](#public-routes)
  - [Auth Routes](#auth-routes)
  - [User Routes](#user-routes)
  - [Employer Routes](#employer-routes)
  - [Admin Routes](#admin-routes)
- [Building the Project](#building-the-project)

## High-level Features

1. #### User Authentication and Authorization
   - Differentiates between job seekers, employers, and administrators.
   - Provides role-based access control.
2. #### Job Application
   - Enables job seekers to easily apply for desired positions.
3. #### User Account Management
   - Users can update their account.
4. #### Bookmarking Job Posts
   - Allows users to bookmark job posts for future reference.
5. #### Employer-Specific Features
   - Employers can create, update, and delete job posts.
   - Facilitates review of job applications.
6. #### Administrative Functionality
   - Administrators have access to tools for user and application management.

## Technical Features

1. #### JWT-Based Authentication and Token Refreshing
   - Implements JSON Web Tokens (JWT) for secure user authentication.
   - Includes a token refreshing mechanism to extend user sessions.
2. #### Role-Based Access Control
   - Enforces different access levels based on user roles.
3. #### Secure Refresh Token Handling
   - Implements secure methods for handling refresh tokens.
4. #### CRUD Operations
   - Features CRUD operations on job posts and user profiles.
5. #### Validation
   - Implements data validation using Zod to maintain data integrity.
6. #### Pagination
   - Includes server-side pagination for job-listings.

## Requirements

To run this API, you need to have the following software installed on your system:

- Node.js (v14 or higher)
- MongoDB (v4 or higher)

## Back-End Data Architecture

This is the back-end data architecture showcasing the design and structure of data models used in this project.

![Back-end Data Architecture](/snjobs-backend-architecture.png)

## Getting Started

### Installation

1. Clone this repository to your local machine:

```bash
git clone https://github.com/seancaleb/snjobs-backend-api.git
```

2. Navigate to the project's directory:

```bash
cd snjobs-backend-api
```

3. Install the required dependencies using **npm** or **yarn**:

```bash
npm install
```

or

```bash
yarn install
```

### Configuration

4. Create a folder called **config** on the root directory same level as the **src** folder and create a `default.ts` file
5. Add the following default setup:

- `PORT` represents the port number on which the API server will run.
- `mongoPath` should be set to your MongoDB connection URI.
- `accessToken` and `refreshToken` are used for signing JSON Web Tokens (JWT) for authentication. Generate unique secret keys for each to enhance security.

```bash
export default {
  PORT: "",
  saltWorkFactor: "",
  mongoPath: "",
  accessToken: "",
  refreshToken: "",
  accessTokenExpiresIn: "",
  refreshTokenExpiresIn: "",
}
```

6. Create a `development.ts` and `production.ts` file inside of **config** folder and add the following setup:

```bash
import defaultConfig from "./default";

export default {
  ...defaultConfig,
};
```

7. Create a `custom-environment-variables.ts` file inside of **config** folder and add the following setup:

- This will define a mapping between the application's configuration variables and environment variables.

```bash
export default {
  PORT: {
    __name: "PORT",
    __format: "number",
  },
  saltWorkFactor: {
    __name: "SALT_WORK_FACTOR",
    __format: "number",
  },
  mongoPath: "MONGO_PATH",
  accessToken: "ACCESS_TOKEN",
  refreshToken: "REFRESH_TOKEN",
  accessTokenExpiresIn: "ACCESS_TOKEN_EXPIRES_IN",
  refreshTokenExpiresIn: "REFRESH_TOKEN_EXPIRES_IN",
};
```

8. Create a `.env.development` and `.env.production`file:

```bash
PORT=                          // <app-port-number>
SALT_WORK_FACTOR=              // <bcrypt-work-factor>
MONGO_PATH=                    // <your-mongo-uri-path>
ACCESS_TOKEN=                  // <your-access-token>
REFRESH_TOKEN=                 // <your-refresh-token>
ACCESS_TOKEN_EXPIRES_IN=       // <access-token-expiration>
REFRESH_TOKEN_EXPIRES_IN=      // <refresh-token-expiration>
```

### Running the API

6. Start the API Server:

```bash
npm run dev
```

or

```bash
yarn dev
```

7. You can now use tools like Postman or any API development environment to interact with the API endpoints.

## API Routes

#### Public Routes

- GET - `api/jobs` - Retrieves a list of all jobs.
- GET - `api/jobs/:jobId` - Retrieves a specific job by ID.

#### Auth Routes

- POST - `/api/auth/register` - Registers a new user.
- POST - `api/auth/login` - Logs in a user.
- GET - `api/auth/refresh` - Generates a new access token using the refresh token.
- POST - `api/auth/logout` - Logs out a user and clears cookies.

#### User Routes

- GET - `/api/users/profile` - Retrieves the profile of the authenticated user.
- PATCH - `api/users/profile` - Updates the profile of the authenticated user.
- DELETE - `api/users/profile` - Deletes the profile of the authenticated user.
- POST - `api/users/jobs/:jobId/apply` - Submits an application for a job.
- POST - `/api/users/jobs/:jobId/bookmark` - Bookmarks a job post for the authenticated user.
- PATCH - `/api/users/update-password` - Updates the user's password.
- DELETE - `/api/users/applications/:applicationId` - Deletes a specific job application of the authenticated user.
- GET - `/api/users/applications` - Retrieves all job applications of the authenticated user.
- GET - `/api/users/bookmarked-jobs` - Retrieves all bookmarked jobs of the authenticated user.

#### Employer Routes

- POST - `/api/employers/jobs` - Creates a new job post.
- PATCH - `/api/employers/jobs/:jobId` - Updates a job post with the given ID.
- DELETE - `/api/employers/jobs/:jobId` - Deletes a job post with the given ID.
- GET - `/api/employers/jobs/:jobId/applications` - Retrieves the list of applications for a specific job post.
- PATCH - `/api/employers/jobs/:jobId/applications/:applicationId/review` - Reviews an application for a specific job post.
- GET - `/api/employers/jobs` - Retrieves the list of job postings created by the employer.

#### Admin Routes

- GET - `/api/admin/users` - Retrieves a list of all users.
- GET - `/api/admin/applications` - Retrieves all job applications of all users.

## Building the project

1. To build the project just run the following:

```bash
npm run build
```

or

```bash
yarn build
```

2. Start the project in production mode:

```bash
npm run start
```

or

```bash
yarn start
```
