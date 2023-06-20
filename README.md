# JobQuest PH Backend API

This repository contains a Job Backend API developed using Node.js, Express.js, TypeScript, Mongoose, MongoDB, and Zod. It provides a set of routes to manage jobs, user authentication, user profiles, job applications, bookmarks, and employer-specific operations. This README.md file provides an overview of the API and explains how to set it up and use it effectively.

## Table of Contents

- [Requirements](#requirements)
- [Back-End Data Architecture](#back-end-data-architecture)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the API](#running-the-api)
- [API Routes](#api-routes)
  - [Public Routes](#public-routes)
  - [Authenticated Routes](#authenticated-routes)
  - [User Routes](#user-routes)
  - [Employer Routes](#employer-routes)
  - [Admin Routes](#admin-routes)
- [Building the Project](#building-the-project)

## Requirements

To run this API, you need to have the following software installed on your system:

- Node.js (v14 or higher)
- MongoDB (v4 or higher)

## Back-End Data Architecture

This is the back-end data architecture showcasing the design and structure of data models used in this project.

![Back-end Data Architecture](/jobquest-backend-architecture.png)

## Getting Started

### Installation

1. Clone this repository to your local machine:

```bash
git clone https://github.com/seancaleb/jobquest-backend-api.git
```

2. Navigate to the project's directory:

```bash
cd jobquest-backend-api
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
5. Add the following configuration to the `default.ts` file:

```bash
export default {
  PORT: <your-port-here>, // example -> 8000
  mongoPath: <your-local-mongo-uri>,
  saltWorkFactor: 10,
  accessToken: <your-access-token-here>,
  refreshToken: <your-refresh-token-here>,
  accessTokenExpiresIn: "15m",
  refreshTokenExpiresIn: "7d",
}
```

- `PORT` represents the port number on which the API server will run.
- `MONGODB_URI` should be set to your MongoDB connection URI.
- `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` are used for signing JSON Web Tokens (JWT) for authentication. Generate unique secret keys for each to enhance security.

### Running the API

6. Start the API Server:

```bash
npm dev
```

    or

```bash
yarn dev
```

- The API will be available at http://localhost:8000.

7. You can now use tools like Postman or any API development environment to interact with the API endpoints.

#### Note

1. When using Postman, upon calling the `/api/auth/login` endpoint, make sure to store the token on the **Authorization** tab then **Bearer Token** type.

2. By default, the token is set to work like this:

- `accessToken` expires in 15 minutes
- `refreshToken` expires in 7 days
- `httpCookie` expires in 7 days (which matches the refreshToken)

3. You can change the default expiration of token in the `config/default.ts` file.

## API Routes

### Public Routes

- **GET** - `api/jobs` - Retrieves a list of all jobs.

### Authenticated Routes

- **POST** - `/api/auth/register` - Registers a new user.
- **POST** - `api/auth/login` - Logs in a user.
- **GET** - `api/auth/refresh` - Generates a new access token using the refresh token.
- **POST** - `api/auth/logout` - Logs out a user and clears cookies.

### User Routes

- **GET** - `/api/users/profile` - Retrieves the profile of the authenticated user.
- **PATCH** - `api/users/profile` - Updates the profile of the authenticated user.
- **DELETE** - `api/users/profile` - Deletes the profile of the authenticated user.
- **POST** - `api/users/jobs/:jobId/apply` - Submits an application for a job.
- **POST** - `/api/users/jobs/:jobId/bookmark` - Bookmarks a job post for the authenticated user.
- **PATCH** - `/api/users/update-password` - Updates the user's password.
- **DELETE** - `/api/users/applications/:applicationId` - Deletes a specific job application of the authenticated user.
- **GET** - `/api/users/applications` - Retrieves all job applications of the authenticated user.
- **GET** - `/api/users/bookmarked-jobs` - Retrieves all bookmarked jobs of the authenticated user.

### Employer Routes

- **POST** - `/api/employers/jobs` - Creates a new job post.
- **PUT** - `/api/employers/jobs/:jobId` - Updates a job post with the given ID.
- **DELETE** - `/api/employers/jobs/:jobId` - Deletes a job post with the given ID.
- **GET** - `/api/employers/jobs/:jobId/applications` - Retrieves the list of applications for a specific job post.
- **PATCH** - `/api/employers/jobs/:jobId/applications/:applicationId/review` - Reviews an application for a specific job post.
- **GET** - `/api/employers/jobs` - Retrieves the list of job postings created by the employer.

### Admin Routes

- **POST** - `/api/admin/users/:userId/suspend` - Suspends the account of a user with the given user ID.
- **GET** - `/api/admin/users` - Retrieves a list of all users.
- **GET** - `/api/admin/applications` - Retrieves all job applications of all users.

## Building the Project

1. To build the project just run the following:

```bash
yarn build
```

2. Start the project in production mode:

```bash
yarn start
```
