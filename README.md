# MediProject Backend

A NestJS backend server with Supabase PostgreSQL database, Supabase Storage for file uploads, and JWT authentication.

## Features

- 🔐 JWT Authentication
- 📦 Product CRUD operations with details and file uploads
- 🗄️ PostgreSQL database via Supabase
- 📁 File storage via Supabase Storage
- 🔄 TypeORM for database management
- ✅ Input validation with class-validator
- 🌐 CORS enabled for frontend integration

## Tech Stack

- **Framework**: NestJS
- **Database**: Supabase PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT with Passport
- **File Storage**: Supabase Storage
- **Validation**: class-validator & class-transformer

## Database Schema

### User
- `id` (Primary Key)
- `username` (Unique)
- `password` (Hashed with bcrypt)

### Product
- `id` (Primary Key)
- `name`
- `priority`

### ProductDetail
- `id` (Primary Key)
- `id_product` (Foreign Key → Product)
- `label`
- `description`

### File
- `id` (Primary Key)
- `id_product` (Foreign Key → Product)
- `location` (Supabase Storage URL)
- `name`

## API Endpoints

### Authentication
- **POST** `/auth/login` - Login with username and password
  - Body: `{ "username": "string", "password": "string" }`
  - Returns: `{ "access_token": "jwt-token", "user": {...} }`

### Products
- **GET** `/product` - Get all products with details and files (Public)
- **GET** `/product/:id` - Get single product by ID (Public)
- **POST** `/product` - Create new product (Protected)
  - Requires: JWT Bearer token
  - Body: `{ "name": "string", "priority": number, "details": [...] }`
- **PATCH** `/product/:id` - Update product with optional file uploads (Protected)
  - Requires: JWT Bearer token
  - Body: Form-data with optional `files` field and JSON fields
  - Supports multiple file uploads (max 10)

## Setup Instructions

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### 2. Supabase Configuration

#### Database Setup
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Get your database connection details from Project Settings → Database
3. Note down:
   - Host
   - Database name
   - User (usually `postgres`)
   - Password
   - Port (usually `5432`)

#### Storage Setup
1. Go to Storage in your Supabase dashboard
2. Create a new bucket named `products` (or your preferred name)
3. Set the bucket to **Public** if you want files to be publicly accessible
4. Get your Supabase URL and anon key from Project Settings → API

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Update the following variables in `.env`:

```env
# Database Configuration (from Supabase)
DB_HOST=db.xxxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-database-password
DB_DATABASE=postgres
DB_SYNCHRONIZE=true  # Set to false in production

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=24h

# Supabase Storage Configuration
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_BUCKET=products

# Application
PORT=3000
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Application

Development mode:
```bash
npm run start:dev
```

Production mode:
```bash
npm run build
npm run start:prod
```

The server will start on `http://localhost:3000`

### 6. Create a Test User

Since there's no registration endpoint, you'll need to create a user directly in the database or use the AuthService programmatically. You can add a temporary endpoint or use Supabase SQL Editor:

```sql
-- This is just for reference, the app will handle password hashing
-- Use the AuthService.createUser() method instead
```

Or create a simple script to add a user using the AuthService.

## Deployment to Render

### 1. Prepare for Deployment

1. Set `DB_SYNCHRONIZE=false` in production environment variables
2. Ensure all environment variables are set in Render dashboard

### 2. Render Configuration

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Environment**: Node
4. Add all environment variables from `.env.example`
5. Deploy!

### 3. Database Migrations

For production, consider using TypeORM migrations instead of `synchronize: true`:

```bash
npm run typeorm migration:generate -- -n InitialMigration
npm run typeorm migration:run
```

## Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── dto/             # Login DTOs
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── jwt.strategy.ts
│   └── jwt-auth.guard.ts
├── entities/            # TypeORM entities
│   ├── user.entity.ts
│   ├── product.entity.ts
│   ├── product-detail.entity.ts
│   └── file.entity.ts
├── product/             # Product module
│   ├── dto/            # Product DTOs
│   ├── product.controller.ts
│   ├── product.service.ts
│   └── product.module.ts
├── storage/             # Supabase storage service
│   ├── storage.service.ts
│   └── storage.module.ts
├── app.module.ts        # Root module
└── main.ts              # Application entry point
```

## Testing with Postman

Import the `postman_collection.json` file into Postman to test all endpoints.

### Workflow:
1. **Login**: Use the login endpoint to get a JWT token
2. **Set Token**: The token will be automatically saved to the collection variable
3. **Create Product**: Use the token to create products
4. **Upload Files**: Use the PATCH endpoint with form-data to upload files
5. **Get Products**: View all products (no auth required)

## Security Notes

- Passwords are hashed using bcrypt with salt rounds of 10
- JWT tokens expire after 24 hours (configurable)
- File uploads are limited to 10 files per request
- Input validation is enabled globally
- CORS is enabled (configure for production)

## Troubleshooting

### Database Connection Issues
- Verify Supabase database credentials
- Check if your IP is allowed in Supabase (usually not needed)
- Ensure SSL is enabled in the connection

### File Upload Issues
- Verify Supabase Storage bucket exists and is public
- Check SUPABASE_URL and SUPABASE_KEY are correct
- Ensure bucket name matches SUPABASE_BUCKET env variable

### JWT Issues
- Ensure JWT_SECRET is set and consistent
- Check token expiration time
- Verify Authorization header format: `Bearer <token>`

## License

MIT
