# MongoDB Atlas Setup - Step by Step Guide

## Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with Google/GitHub or email
3. Complete verification

## Step 2: Create Free Cluster
1. Click "Build a Database"
2. Choose **M0 FREE** tier
3. Select **AWS** as provider
4. Choose region closest to you (e.g., US East)
5. Cluster Name: `TripGenie` (or keep default)
6. Click **Create Deployment**

## Step 3: Create Database User
1. You'll see "Security Quickstart"
2. Create username: `tripgenie_user`
3. Click **Autogenerate Secure Password** (copy this password!)
4. Click **Create Database User**

## Step 4: Set Network Access
1. Click **Add IP Address**
2. Click **Allow Access from Anywhere** (0.0.0.0/0)
3. Click **Confirm**
4. Wait 1-2 minutes for deployment

## Step 5: Get Connection String
1. Click **Connect** button on your cluster
2. Choose **Drivers**
3. Select **Node.js** and version **5.5 or later**
4. Copy the connection string:
   ```
   mongodb+srv://tripgenie_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password from Step 3
6. Add database name before `?`:
   ```
   mongodb+srv://tripgenie_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/tripgenie?retryWrites=true&w=majority
   ```

## Step 6: Add to Netlify
1. Go to Netlify Dashboard
2. Select your site (travixai)
3. Go to **Site configuration** → **Environment variables**
4. Click **Add a variable**
5. Key: `DATABASE_URL`
6. Value: Your MongoDB connection string from Step 5
7. Click **Save**

## Step 7: Update Prisma Schema (Optional - if using Prisma)

If you're using Prisma, update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  email     String   @unique
  name      String
  password  String
  createdAt DateTime @default(now())
}

model Booking {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @db.ObjectId
  from      String
  to        String
  date      DateTime
  amount    Int
  status    String
  createdAt DateTime @default(now())
}
```

Then run:
```bash
npx prisma generate
npx prisma db push
```

## Step 8: Redeploy on Netlify
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Wait for build to complete

## ✅ Done!
Your MongoDB database is now connected and ready for production!

## Troubleshooting
- **Connection timeout**: Check IP whitelist (0.0.0.0/0)
- **Authentication failed**: Verify password has no special characters or URL encode them
- **Database not found**: Make sure database name is in connection string
