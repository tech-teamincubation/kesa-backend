# KESA Backend API

Backend API for the KESA (Knowledge Enhancement & Skill Acquisition Program) platform.

## Features

- User authentication and authorization
- Session and course management
- Registration system
- Admin panel API
- Rate limiting and security
- Supabase database integration

## Tech Stack

- Node.js + Express.js
- Supabase (PostgreSQL)
- JWT Authentication
- bcryptjs for password hashing
- Express validation and security middleware

## Environment Variables

Required environment variables:

\`\`\`env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://kesalearn.com
JWT_SECRET=your_jwt_secret
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
\`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Dashboard
- `GET /api/dashboard/stats` - Get user dashboard statistics

### Sessions
- `GET /api/sessions` - Get all sessions
- `GET /api/sessions/:id` - Get single session

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get single course

### Registrations
- `POST /api/registrations/session/:sessionId` - Register for session
- `POST /api/registrations/course/:courseId` - Register for course

### Admin
- `POST /api/admin/auth/login` - Admin login

## Deployment

This backend is designed to be deployed on Railway.app with Supabase as the database.

## Health Check

The API includes a health check endpoint at `/health` for monitoring.
