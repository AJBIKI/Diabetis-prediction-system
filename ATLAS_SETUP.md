# MongoDB Atlas Setup Guide

## Quick Setup Steps

### 1. Create Cluster (5 minutes)
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up or log in
3. Create a **FREE cluster** (M0 Sandbox)
   - Choose provider: AWS/GCP/Azure
   - Region: Closest to you
   - Cluster name: `diabetes-cluster`

### 2. Configure Database Access
1. Click **Database Access** in left sidebar
2. Click **Add New Database User**
   - Authentication: Username/Password
   - Username: `diabetesAdmin`
   - Password: Generate secure password (save it!)
   - Database User Privileges: **Read and write to any database**

### 3. Configure Network Access
1. Click **Network Access** in left sidebar
2. Click **Add IP Address**
   - Choose: **Allow access from anywhere** (0.0.0.0/0)
   - Or add your specific IP for better security

### 4. Get Connection String
1. Click **Database** in left sidebar
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Driver: **Node.js**, Version: **5.5 or later**
5. Copy the connection string

**Example:**
```
mongodb+srv://diabetesAdmin:<password>@diabetes-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### 5. Update Backend .env
Replace `<password>` with your actual password:

```env
MONGODB_URI=mongodb+srv://diabetesAdmin:YOUR_PASSWORD@diabetes-cluster.xxxxx.mongodb.net/diabetes-predictions?retryWrites=true&w=majority
```

**Important**: Replace `YOUR_PASSWORD` and the cluster URL with your actual values!

---

## Quick Test

After updating `.env`, restart backend:
```bash
cd backend
npm start
```

Look for: `✓ MongoDB Connected` in the terminal.

---

## Database Structure

Once connected, Atlas will auto-create these collections:
- `users` - User accounts
- `predictions` - Prediction history (linked to users)

You can view data in Atlas Dashboard → Collections
