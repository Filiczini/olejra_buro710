# AGENTS.md - Buro 710 Codebase Guide

## Project Overview

Buro 710 is a portfolio website for an architecture studio built with:
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS 4
- **Backend**: Node.js + Express + Supabase (PostgreSQL)
- **Auth**: JWT tokens
- **Language**: Ukrainian

## Build / Lint / Test Commands

```bash
# Development
npm run dev                    # Start both frontend (port 5173) and backend (port 3000)
npm run dev:frontend          # Frontend only
npm run dev:backend           # Backend only with tsx watch

# Build & Production
npm run build                 # TypeScript check + Vite build
npm run preview              # Preview production build

# Linting
npm run lint                 # Run ESLint

# Database Operations
npm run seed                 # Seed projects database
npm run seed:random          # Seed with random projects
npm run seed:clean           # Clear all projects
npm run migrate:projects      # Run project migrations

# Testing (Vitest)
cd backend && npm run test:run   # Backend tests
cd frontend && npm run test:run  # Frontend tests
cd shared && npm run test:run    # Shared package tests
```

## Code Structure

```
src/
├── api/                    # Axios client configuration
├── components/
│   ├── admin/              # Admin panel components
│   ├── layout/             # Layout components (Header, Footer)
│   ├── project/            # Project display components
│   ├── sections/           # Page sections (Hero, About, etc.)
│   └── ui/                # Reusable UI components (Button, Input)
├── contexts/               # React Context (Auth)
├── hooks/                  # Custom React hooks
├── layouts/                # Page layouts (AdminLayout, Layout)
├── pages/                  # Page components
├── server/                 # Backend code
│   ├── config/             # Supabase, JWT config
│   ├── middleware/         # Auth, multer middleware
│   ├── routes/             # API route handlers
│   └── services/           # Business logic services
├── services/               # Frontend API service layer
├── types/                  # TypeScript type definitions
└── main.tsx                # React entry point
```

## Import Conventions

```typescript
// React hooks - use named imports from 'react'
import { useState, useEffect, useRef } from 'react';

// React Router - use named imports
import { useNavigate, useParams, useLocation } from 'react-router-dom';

// Components - use default imports
import Button from '../components/ui/Button';
import ProjectPreview from '../components/admin/ProjectPreview';

// Types - use named imports
import type { Project, CreateProjectData } from '../types/project';

// Services - use named imports from service objects
import { portfolioService, authService } from '../services/api';
```

## Component Patterns

```typescript
// 1. Interface first, then component
interface ComponentNameProps {
  requiredProp: string;
  optionalProp?: string;
  children?: React.ReactNode;
}

// 2. Default export, not named export
export default function ComponentName({ requiredProp, optionalProp, children }: ComponentNameProps) {
  // ...
}

// 3. Destructure props at function signature
export default function ComponentName({ prop1, prop2 }: Props) {
  const [state, setState] = useState<Type>(initialValue);
  const navigate = useNavigate();

  return <div>...</div>;
}

// 4. File naming: PascalCase for components (ComponentName.tsx)
```

## Type Definitions

```typescript
// 1. Keep types in src/types/ directory
// 2. Use interfaces for object shapes, types for unions/primitives
interface Project {
  id: string;
  title: string;
  tags: string[];
  created_at: string;
}

type Status = 'pending' | 'completed' | 'failed';

// 3. Optional fields use ? for nullable
interface CreateProjectData {
  title: string;
  description: string;
  location?: string;  // Optional
}

// 4. Export types for reuse across files
export type { Project, CreateProjectData };
```

## Naming Conventions

```typescript
// Files and Components: PascalCase
// Button.tsx, ProjectCard.tsx, AdminLayout.tsx

// Hooks: camelCase starting with 'use'
// useAuth.ts

// Services: camelCase
// portfolioService, authService, projectService

// Variables and Functions: camelCase
// const userName = 'John';
// const handleSubmit = () => {};

// Constants: UPPER_SNAKE_CASE
// const API_URL = 'http://localhost:3000';
// const PLACEHOLDER_IMAGE = 'https://...';

// DB columns: snake_case (Supabase/PostgreSQL)
// created_at, photo_credits, hero_media

// API endpoints: lowercase, dash-separated or with params
// GET /portfolio, POST /admin/login, GET /portfolio/:id
```

## Error Handling

```typescript
// Frontend - try/catch in async functions
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await portfolioService.create(data);
    navigate('/dashboard');
  } catch {
    setErrors({ submit: 'Помилка створення проєкту' });
  }
};

// Backend - try/catch with proper error responses
router.get('/:id', async (req, res) => {
  try {
    const result = await projectService.getById(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// API client - axios interceptors handle 401 globally
// (See src/api/client.ts)
```

## State Management

```typescript
// Use React built-in hooks (no Redux/MobX)
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// Form state - use object with typed interface
const [formData, setFormData] = useState<CreateProjectData>({});

// Loading states - boolean flags
const [loading, setLoading] = useState(false);

// Error states - object with field names
const [errors, setErrors] = useState<Record<string, string>>({});

// Derived state - useMemo for expensive calculations
const filteredProjects = useMemo(() => {
  return projects.filter(p => p.category === filter);
}, [projects, filter]);

// Event handlers - useCallback when passed to children
const handleDelete = useCallback((id: string) => {
  // ...
}, []);
```

## API Patterns

```typescript
// Service layer in src/services/api.ts
export const portfolioService = {
  getAll: async (params?: PaginationParams) => {
    const queryParams = new URLSearchParams();
    // Build query params...
    const response = await api.get(`/portfolio?${queryParams.toString()}`);
    return response.data as PaginatedResponse<Project>;
  },
  create: async (formData: FormData) => {
    const response = await api.post('/portfolio', formData);
    return response.data;
  },
};

// Axios client in src/api/client.ts has:
// - Base URL from env
// - JWT token interceptor
// - FormData Content-Type handling
// - 401 auto-redirect to login
```

## Backend Patterns

```typescript
// Route structure - Express Router pattern
const router = Router();

router.get('/', async (req, res) => { ... });
router.get('/:id', async (req, res) => { ... });
router.post('/', authMiddleware, uploadProjectMedia, async (req, res) => { ... });
router.put('/:id', authMiddleware, uploadProjectMedia, async (req, res) => { ... });
router.delete('/:id', authMiddleware, async (req, res) => { ... });

// Service layer - separate business logic
export const projectService = {
  getAll: async (params) => { ... },
  getById: async (id) => { ... },
  create: async (data) => { ... },
};

// Use Supabase client from config/supabase.ts
import { supabase } from '../config/supabase';
const { data, error } = await supabase.from('projects').select('*');
if (error) throw error;
```

## Styling (Tailwind CSS)

```typescript
// Use Tailwind utility classes, no CSS modules
// Color palette: zinc (grayscale) as primary
className="bg-white text-zinc-900"

// Layout utilities: flex, grid
className="flex flex-col md:flex-row gap-8"

// Spacing: p-4, py-8, gap-4
// Typography: text-sm, text-lg, font-medium, tracking-tight
// Borders: border-zinc-200, rounded-xl, shadow-lg

// Responsive: md:, lg:
className="grid-cols-1 md:grid-cols-3"

// Use @iconify-icon/react for icons
import { Icon } from '@iconify-icon/react';
<Icon icon="solar:arrow-right-linear" width={24} />
```

## File Uploads

```typescript
// Use FormData for multipart uploads
const formDataToSend = new FormData();
formDataToSend.append('title', title);
formDataToSend.append('heroMedia', fileObject);

// Backend: use multer middleware
import { uploadProjectMedia } from '../middleware/multer';
router.post('/', uploadProjectMedia, async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
});

// Use Supabase storage for image uploads
// See src/server/services/storageService.ts
```

## Environment Variables

```bash
# Frontend (.env or .env.local)
VITE_API_URL=http://localhost:3000/api

# Backend (.env)
DATABASE_URL=supabase_connection_string
JWT_SECRET=your_secret_here
```

## Best Practices

1. **Type Safety**: Use TypeScript types everywhere, avoid `any`
2. **Props Destructuring**: Always destructure props at function signature
3. **Async Functions**: Use try/catch blocks, set loading/error states
4. **Code Organization**: Group imports by type (react, third-party, local)
5. **Component Size**: Keep components under 200-300 lines, split if larger
6. **Constants**: Define constants at file level, don't hardcode strings
7. **Comments**: Ukrainian and English comments acceptable, keep them concise
8. **Console Logs**: Use console.error for errors, avoid console.log in production
9. **Route Params**: Use useParams() hook for route parameters
10. **File Names**: Use PascalCase for components, camelCase for others

## Known Issues & TODOs

- JSON parsing for media IDs needs robust handling (single string vs array)
- Consider adding TypeScript strict mode in tsconfig
