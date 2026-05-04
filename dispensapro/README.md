## basic Folder Structure that should follow

src/
├─ app/ # App-level setup (routing, store, theme)
│ ├─ store.ts # Redux store config
│ ├─ App.tsx # Root App component
│ ├─ routes.tsx # React Router config
│ └─ index.tsx # Entry point (ReactDOM.createRoot)
│
├─ features/ # Feature-first folders
│ └─ users/
│ ├─ components/
│ │ ├─ UserCard.tsx
│ │ └─ UserList.tsx
│ ├─ hooks/
│ │ └─ useUsers.ts # Data fetching logic (React Query/RTK Query)
│ ├─ services/
│ │ └─ userService.ts # API calls
│ ├─ pages/
│ │ └─ UsersPage.tsx
│ └─ types.ts # Feature-specific types
│
├─ components/ # Truly shared UI widgets
│ ├─ Button.tsx
│ └─ Input.tsx
│
├─ hooks/ # Global reusable hooks
│ └─ useAuth.ts
│
├─ services/ # Global API clients/config
│ └─ apiClient.ts
│
├─ utils/ # Pure helpers
│ └─ formatDate.ts
│
├─ types/ # Global types/interfaces
│ └─ index.ts
│
├─ styles/ # Global CSS / theme
│ └─ theme.ts
│
└─ index.css
