# TaskFlow - A Smart Task & Project Manager

TaskFlow is a full-stack task and project management application built using the MERN stack (MongoDB, Express.js, React.js, and Node.js). It enables users to securely manage their projects and tasks through an intuitive dashboard with boards, status columns, priorities, due dates, and productivity-focused features.

Inspired by tools like Trello and Asana, TaskFlow allows users to create and organize tasks efficiently while keeping all data securely scoped to the authenticated user.

The application also includes a lightweight AI assistant powered by the Google Gemini API. The AI feature analyzes a task's description and suggests:
- Task title
- Priority level
- Effort estimate
- Recommended due date

Users can accept or override these suggestions, making task planning faster and more productive.

## Features

- 🔐 Secure Authentication (JWT + bcrypt)
- 📁 Create and manage projects/boards
- ✅ Full CRUD operations for tasks
- 📌 Task statuses: To Do, In Progress, Done
- 🚩 Priority management (Low, Medium, High)
- 📅 Due dates and effort estimation
- 🤖 AI-powered task suggestions using Google Gemini
- 🔥 Focus Tasks widget for high-priority tasks
- 👤 User profile with profile photo upload
- 🌙 Dark/Light mode support
- 📱 Fully responsive design for desktop and mobile
- 🔒 User-specific data isolation and protected routes

## Tech Stack

### Frontend
- React.js
- React Router
- Axios
- Tailwind CSS

### Backend
- Node.js
- Express.js
- JWT Authentication
- bcrypt

### Database
- MongoDB Atlas
- Mongoose

### AI Integration
- Google Gemini API (`gemini-2.5-flash`)

## Why Google Gemini?

Google Gemini provides a generous free tier, easy integration with Node.js, and fast responses, making it ideal for implementing lightweight AI features in a full-stack application without incurring additional costs.

## AI Feature Workflow

1. User enters a task description.
2. User clicks **AI Suggest**.
3. Backend sends the description to the Google Gemini API.
4. Gemini returns:
   - Suggested Title
   - Priority
   - Estimated Effort
   - Suggested Due Date
5. The user can accept or modify the suggestions before saving the task.

## Key Features

- Dashboard with project boards
- Kanban-style task management
- AI-powered productivity assistance
- Focus mode for high-priority tasks
- Responsive and modern UI