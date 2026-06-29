# BookManager — Book & Author Management System

BookManager is a full-stack web application developed as part of the **RedComm Full Stack Developer Intern Technical Assessment**.

The application allows administrators to manage **Authors** and **Books** through a modern Nuxt.js frontend and a Laravel REST API backend. It demonstrates RESTful API development, relational database design, modern frontend architecture, and responsive user interface implementation.

---

# Overview

BookManager is designed to provide a simple yet scalable administration panel for managing books and authors.

The project emphasizes:

- Clean REST API architecture
- Relational database design
- Modern frontend development
- Responsive user interface
- Reusable components
- Maintainable codebase

---

# Features

## Author Management

- Create Author
- Edit Author
- Delete Author
- View Author Details
- Search Authors
- Pagination
- Automatic Book Count
- Cascade Delete

## Book Management

- Create Book
- Edit Book
- Delete Book
- Search Books
- Filter Books by Author
- Pagination
- Book Status Management
- ISBN Validation

## Technical Features

- RESTful API
- Form Request Validation
- API Resources
- Eager Loading
- Responsive Layout
- Debounced Search
- Toast Notifications
- Skeleton Loading
- Reusable Vue Components

---

# Architecture

```
+------------------------+
|     Nuxt 4 Frontend    |
+------------------------+
            |
            | REST API
            |
            ▼
+------------------------+
|   Laravel Backend API  |
+------------------------+
            |
            ▼
+------------------------+
|        MySQL DB        |
+------------------------+
```

---

# Tech Stack

## Frontend

- Nuxt 4
- Vue 3
- TypeScript
- Tailwind CSS
- Pinia
- Axios

## Backend

- Laravel
- PHP
- Eloquent ORM
- Laravel API Resources
- Form Request Validation

## Database

- MySQL

---

# Project Structure

```
books-management-test/

├── backend/
│   ├── app/
│   ├── database/
│   ├── routes/
│   └── ...
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── composables/
│   ├── stores/
│   └── ...
│
├── README.md
├── EXPLANATION.md
├── AI_USAGE.md
└── .gitignore
```

---

# Prerequisites

Make sure the following software is installed:

- PHP 8.4+
- Composer
- Node.js 22+
- npm
- MySQL 8+
- Git

---

# Backend Setup (Laravel)

## 1. Go to backend directory

```bash
cd backend
```

## 2. Install dependencies

```bash
composer install
```

## 3. Copy environment file

```bash
cp .env.example .env
```

## 4. Generate application key

```bash
php artisan key:generate
```

## 5. Configure database

Edit `.env`

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=bookmanager
DB_USERNAME=root
DB_PASSWORD=
```

## 6. Create database

```sql
CREATE DATABASE bookmanager;
```

## 7. Run migration and seed

```bash
php artisan migrate --seed
```

## 8. Start backend server

```bash
php artisan serve
```

Backend:

```
http://localhost:8000
```

---

# Frontend Setup (Nuxt)

## 1. Go to frontend directory

```bash
cd frontend
```

## 2. Install dependencies

```bash
npm install
```

## 3. Copy environment

```bash
cp .env.example .env
```

## 4. Configure API URL

```env
NUXT_PUBLIC_API_BASE=http://localhost:8000/api/v1
```

## 5. Start frontend

```bash
npm run dev
```

Frontend:

```
http://localhost:3000
```

---

# Application Routes

| Page      | URL                           |
| --------- | ----------------------------- |
| Dashboard | http://localhost:3000         |
| Authors   | http://localhost:3000/authors |
| Books     | http://localhost:3000/books   |

---

# API Endpoints

Base URL

```
http://localhost:8000/api/v1
```

## Authors

| Method | Endpoint      | Description           |
| ------ | ------------- | --------------------- |
| GET    | /authors      | Get paginated authors |
| GET    | /authors/{id} | Get author details    |
| POST   | /authors      | Create author         |
| PUT    | /authors/{id} | Update author         |
| DELETE | /authors/{id} | Delete author         |

## Books

| Method | Endpoint    | Description         |
| ------ | ----------- | ------------------- |
| GET    | /books      | Get paginated books |
| GET    | /books/{id} | Get book details    |
| POST   | /books      | Create book         |
| PUT    | /books/{id} | Update book         |
| DELETE | /books/{id} | Delete book         |

---

# Query Parameters

## Authors

```
GET /authors?page=1&per_page=10&search=garcia
```

## Books

```
GET /books?page=1&per_page=10&author_id=1&search=silent
```

---

# Database Relationship

```
Author (1)
    │
    │ hasMany
    ▼
Book (N)

Foreign Key:
books.author_id
```

Cascade Delete is enabled.

Deleting an Author automatically deletes all associated Books.

---

# Screenshots

Add screenshots after completing the project.

Suggested screenshots:

- Dashboard
- Authors List
- Books List
- Create Author
- Edit Book
- Delete Confirmation
- Responsive Mobile View

---

# Documentation

| File           | Description                       |
| -------------- | --------------------------------- |
| README.md      | Project setup and usage           |
| PRD.md         | Product Requirements Document     |
| EXPLANATION.md | Design decisions and architecture |
| AI_USAGE.md    | AI-assisted development process   |

---

# Live Demo

Frontend

```
https://bookmanagementtest.vercel.app/
```

Backend API

```
https://merry-unity-production-eae9.up.railway.app/api/v1
```

---

# Future Improvements

- Authentication & Authorization
- Unit Testing
- Feature Testing
- Docker Support
- CI/CD Pipeline
- API Documentation (Swagger / Scribe)
- CSV Export
- Image Upload
- Dark Mode

---

# Notes

This project was developed solely for the **RedComm Full Stack Developer Intern Technical Assessment**.

The application focuses on delivering a clean, maintainable, and stable implementation of the required features rather than introducing unnecessary complexity.