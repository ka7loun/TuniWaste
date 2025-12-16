# TuniWaste Backend API

Node.js/Express backend for the TuniWaste marketplace platform.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Create `.env` File
Create a `.env` file in the root directory with the following content:

```env
MONGODB_URI=mongodb+srv://kahlounahmed1_db_user:8ncGLXQ6iA8POIVO@tuniwaste.sxhepum.mongodb.net/tuniwaste?appName=Tuniwaste&retryWrites=true&w=majority
PORT=5000
JWT_SECRET=tuniwaste_super_secret_jwt_key_change_in_production
```

### 3. Run the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

## Project Structure

```
src/
├── app.ts              # Express app configuration
├── server.ts            # Server entry point
├── models/             # Mongoose models
│   └── User.ts
├── controllers/        # Route controllers
│   └── authController.ts
├── routes/             # Express routes
│   └── authRoutes.ts
└── middleware/         # Custom middleware
```

## Technologies

- **Express.js** - Web framework
- **Mongoose** - MongoDB ODM
- **TypeScript** - Type safety
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **dotenv** - Environment variables
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing
- **morgan** - HTTP request logger

