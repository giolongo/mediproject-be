# Quick Start Guide

## Prerequisites
- Node.js installed
- Supabase account created
- Git (for deployment)

## Setup Steps

### 1. Configure Environment Variables

Copy the example file and edit it:
```bash
cp .env.example .env
```

Update these values in `.env`:
```env
# Get from Supabase Project Settings → Database
DB_HOST=db.xxxxxxxxxxxxx.supabase.co
DB_PASSWORD=your-database-password

# Get from Supabase Project Settings → API
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# Generate a secure random string
JWT_SECRET=your-super-secret-jwt-key
```

### 2. Create Supabase Storage Bucket

1. Go to your Supabase project
2. Navigate to Storage
3. Create a new bucket named `products`
4. Make it **Public** for file access

### 3. Install Dependencies

```bash
npm install
```

### 4. Create Test User

```bash
npm run seed
```

This creates:
- Username: `testuser`
- Password: `password123`

### 5. Start Development Server

```bash
npm run start:dev
```

Server runs on: `http://localhost:3000`

### 6. Test with Postman

1. Import `postman_collection.json`
2. Run the **Login** request
3. Token is automatically saved
4. Test other endpoints

## API Endpoints

### Login
```
POST http://localhost:3000/auth/login
Body: { "username": "testuser", "password": "password123" }
```

### Get All Products (Public)
```
GET http://localhost:3000/product
```

### Create Product (Protected)
```
POST http://localhost:3000/product
Headers: Authorization: Bearer <your-token>
Body: {
  "name": "My Product",
  "priority": 1,
  "details": [
    { "label": "Description", "description": "Product info" }
  ]
}
```

### Update Product with Files (Protected)
```
PATCH http://localhost:3000/product/1
Headers: Authorization: Bearer <your-token>
Body: form-data
  - name: "Updated Product"
  - priority: 2
  - files: [select files]
```

## Troubleshooting

### Database Connection Error
- Verify Supabase credentials in `.env`
- Check database is running in Supabase dashboard

### File Upload Error
- Ensure storage bucket `products` exists
- Verify bucket is set to public
- Check SUPABASE_URL and SUPABASE_KEY

### JWT Error
- Make sure JWT_SECRET is set in `.env`
- Check Authorization header format: `Bearer <token>`

## Production Deployment

See `README.md` for detailed Render deployment instructions.

Quick steps:
1. Push to GitHub
2. Create Render Web Service
3. Add environment variables
4. Set `DB_SYNCHRONIZE=false`
5. Deploy!
