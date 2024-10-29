# TRACK: AI-Powered Commit & PR Summarizer for Changelogs

TRACK is a Next.js application designed to help developers quickly and easily generate changelogs from their Git commits and pull requests (PRs) using Llama 3.1 AI. It allows developers to focus on building by automating the tedious process of summarizing multiple commits and PRs into human-readable changelogs.

This project was built to solve the following challenges:
1. Scanning multiple commits over several days to find relevant changes.
2. Summarizing those changes concisely for end-users (developers) in changelogs.

TRACK simplifies this process using LLM technology to generate summaries, titles, and tags for changelogs, which can be published to a public-facing website for users to see.

## Why TRACK?
Maintaining developer tools often requires frequent updates, and writing changelogs is time-consuming. With TRACK, I automate that process using Llama 3.1 to generate concise, relevant changelogs from multiple commits. This streamlines the workflow for developers by reducing manual work and allowing more focus on development.

## Current Features

- **AI-Generated Changelogs**: Summarizes multiple Git commits and PRs into developer-friendly changelogs.
- **GitHub Integration**: After authorizing with GitHub, TRACK can fetch your repositories and generate changelogs from your commits.
- **Public Changelog Page**: A simple, public-facing website where generated changelogs can be published for end-users to see.
- **AI Summarization**: Powered by **Llama 3.1-70B-Versatile** (via GROQ Cloud) to summarize changes into clear, concise bullet points.
- **Backend Caching**: Redis is used for caching to improve API performance when fetching data from GitHub.

## Planned Features

- **Pull Request Summarization**: Add the ability to generate changelogs directly from closed PRs in your repositories.
- **Branch-Specific Summaries**: Support for generating changelogs based on specific branches.
- **Linked PRs and Commits**: Changelogs will include links directly to relevant PRs and commits for easier reference.

## Development Challenges

To improve the performance of API fetching, I plan to implement parallel processing, allowing multiple requests to be handled simultaneously. This will help reduce the overall latency when generating changelogs and enhance the user experience.

## Tech Stack

- **Frontend**: Next.js (React + TypeScript)
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL, GitHub API, Llama 3.1 AI
- **AI Model**: Llama 3.1-70B-Versatile (using GROQ Cloud)
- **Database**: PostgreSQL
- **Caching**: Redis for API performance optimization.
- **Styling**: Tailwind CSS, Shadcn Ui, Acternity Ui

## Architecture and Technical Decisions

### Why Llama 3.1-70B-Versatile?
I chose **Llama 3.1-70B-Versatile** because it provides a balance between power and efficiency for summarizing technical changelogs. By using GROQ Cloud for deployment, I offload AI-heavy tasks to a specialized cloud service, ensuring performance and scalability.

### Redis Caching
To handle frequent GitHub API requests, I implemented Redis caching in the backend. This helps improve response times when fetching multiple commits and PRs, reducing the overall latency when generating changelogs.

### Prisma + PostgreSQL
I chose Prisma for database management due to its powerful type-safe ORM capabilities, making it easy to work with PostgreSQL and ensuring seamless integration between the Next.js frontend and the backend.

## File Structure

```bash
.
├── app
│   ├── actions
│   │   └── backend.ts
│   ├── aisum.ts
│   ├── api
│   │   ├── auth
│   │   │   └── route.ts
│   │   ├── dashboard
│   │   │   ├── commits
│   │   │   │   └── route.ts
│   │   │   ├── route.ts
│   │   │   └── summarize
│   │   │       └── route.ts
│   │   ├── oauth-callback
│   │   │   └── route.ts
│   │   └── repos
│   │       ├── [owner]
│   │       │   └── [repo]
│   │       │       └── changelogs
│   │       │           └── route.ts
│   │       └── route.ts
│   ├── changelogs
│   │   └── page.tsx
│   ├── components
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── Text.tsx
│   │   └── ui
│   │       ├── badge.tsx
│   │       ├── card.tsx
│   │       ├── compare.tsx
│   │       ├── dialog.tsx
│   │       └── sparkles.tsx
│   ├── dashboard
│   │   ├── devlogs
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── developer
│   │   └── page.tsx
│   ├── favicon.ico
│   ├── fonts
│   │   ├── GeistMonoVF.woff
│   │   └── GeistVF.woff
│   ├── git-graph.png
│   ├── globals.css
│   ├── icons8-git-16.png
│   ├── layout.tsx
│   ├── lib
│   │   ├── prisma.ts
│   │   ├── redis.ts
│   │   └── utils.ts
│   ├── page.tsx
│   └── user
│       └── page.tsx
├── components
│   └── ui
│       ├── alert.tsx
│       └── table.tsx
├── const
│   └── index.ts
└── lib
    └── utils.ts
```

### Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/TRACK.git
   cd track_app
   ```
2. **Install Dependencies and Run**:
   ```bash
   npm install
   npm run dev
   ```
   
   
   
