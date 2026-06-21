# Express API + Next.js storefront

Two independent applications live in this repository:

- `backend/` — Express, MongoDB/Mongoose, Clerk auth, and Socket.IO
- `frontend/` — Next.js App Router, Clerk Google sign-in, products, and chat

Run the backend:

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run dev
```

Run the frontend on the backend's configured CORS origin:

```powershell
cd frontend
npm install
Copy-Item .env.local.example .env.local
npm run dev
```

Enable Google in Clerk's social connections. Create a Clerk webhook for `POST /api/clerk` and subscribe to `user.created` and `user.updated` so users are synchronized to MongoDB.
