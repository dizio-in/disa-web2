# Messenger Application

## Overview

This is a full-stack real-time messaging application built with React, TypeScript, Express.js, and PostgreSQL. The application provides a modern Facebook Messenger-like chat interface with three responsive sections: left sidebar for chat listing, center for chat content, and right sidebar for chat settings. Features include real-time messaging, user management, file sharing, chat settings, mobile responsiveness, and a modern UI design with proper colors and animations.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**August 17, 2025**: Integrated Disa API authentication system, chat fetching, and message display
- Converted React Native login code to web version using OTP-based authentication
- Implemented two-step login process: email → OTP → access token
- Added AuthContext for user authentication state management with proper loading states
- Created new chat creation page based on React Native "Skills" component
- Integrated with Disa API endpoint: https://mtrytz6yai.execute-api.eu-north-1.amazonaws.com
- Added proper form validation using Zod and React Hook Form
- Implemented logout functionality and authentication guards
- Created Textarea UI component for better form experience
- Added navigation between login, messenger, and new chat pages
- Stored user data and access tokens in localStorage (web equivalent of AsyncStorage)
- **Latest Update**: Removed all PostgreSQL/database dependencies and converted to frontend-only application using Disa API exclusively
- Added search functionality to filter chats by creator name and skills
- Implemented proper loading and error states for API calls
- Added empty state with "Create Chat" button when no chats exist
- Transformed Disa chat data structure to match application's Chat interface
- Added centralized API configuration in constants/api.ts
- Fixed authentication timing issues with callback-based redirect system
- Application now fetches real chats from Disa API instead of mock data

**August 2, 2025**: Successfully built complete Facebook Messenger-like UI
- Implemented three-section responsive layout (left sidebar, chat content, right sidebar)
- Added real-time messaging functionality with message input and send capabilities
- Created user profiles with avatars, online status indicators, and user information
- Built chat list with recent conversations, timestamps, and message previews
- Implemented shared files section with different file types, icons and thumbnails
- Added chat settings with toggle switches for notifications, starred messages, and task links
- Made mobile-responsive design with slide-in sidebar overlay
- Applied modern messenger-style UI with proper colors, gradients, and hover effects
- Added channels section and "Add Friends" button as requested
- Fixed TypeScript errors and date handling issues for stable functionality
- User confirmed the application looks good and functions properly

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **UI Components**: Radix UI primitives with shadcn/ui components for consistent, accessible design
- **Styling**: Tailwind CSS with custom CSS variables for theming and responsive design
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### API Integration
- **External API**: Integrates directly with Disa API endpoints for all data operations
- **Authentication**: Cookie-based access token storage from Disa API signin
- **Real-time Data**: Fetches chats, messages, and user data from Disa API endpoints
- **No Backend**: Pure frontend application with no local database or server dependencies

### Data Management
- **API Endpoints**: Uses Disa API endpoints (/signin, /allchats, /chats/{id}/messages, etc.)
- **Client-side State**: TanStack React Query for caching and synchronizing API data
- **Authentication Storage**: Secure cookie-based token storage for API authentication
- **Type Safety**: TypeScript interfaces matching Disa API response structures

### External Dependencies
- **API Integration**: Direct integration with Disa API (https://mtrytz6yai.execute-api.eu-north-1.amazonaws.com)
- **UI Framework**: Radix UI components for accessible, unstyled UI primitives
- **Validation**: Zod for runtime type validation and form handling
- **Development Tools**: Replit integration with cartographer and runtime error overlay
- **Styling**: Tailwind CSS with PostCSS for utility-first styling approach
- **Date Handling**: date-fns for date manipulation and formatting utilities
- **State Management**: TanStack React Query for API state management and caching

### Key Features
- **Real-time Messaging**: Send and receive text messages with timestamps and read status
- **User Presence**: Online/offline status indicators and last seen timestamps
- **File Sharing**: Upload and share files with type and size tracking
- **Chat Settings**: Customizable notifications, themes, and privacy settings per conversation
- **Responsive Design**: Mobile-first design with collapsible sidebars and touch-friendly interface
- **Search Functionality**: Filter chats and users with real-time search capabilities