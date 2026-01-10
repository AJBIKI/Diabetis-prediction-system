# User Authentication Setup Guide

## ✅ What's Been Added

Your diabetes prediction system now supports **user authentication** with JWT tokens. Each user will have:
- Personal account with email/password
- Private prediction history
- Secure JWT-based authentication

---

## 🔧 Quick Setup

### 1. Install New Dependencies

```bash
cd backend
npm install bcryptjs jsonwebtoken
```

### 2. Update .env File

Add these two lines to your `.env` file:

```env
JWT_SECRET=put-a-very-long-random-string-here-min-32-characters
JWT_EXPIRES_IN=7d
```

**Generate a strong JWT secret:**
```bash
# Windows PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### 3. Set Up MongoDB Atlas

Follow the `ATLAS_SETUP.md` guide to:
1. Create free cluster
2. Get connection string
3. Update `MONGODB_URI` in `.env`

### 4. Restart Backend

```bash
cd backend
npm start
```

Look for: `✓ MongoDB Connected`

---

## 📡 New API Endpoints

### Authentication Endpoints

#### 1. **Sign Up** - Create new account
```bash
POST http://localhost:3000/api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65abc...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### 2. **Login** - Existing user
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### 3. **Get Current User** - Verify token
```bash
GET http://localhost:3000/api/auth/me
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🔒 Protected Endpoints

### Get User's Prediction History

**Before:** Anyone could see all predictions  
**Now:** Users only see their own predictions

```bash
GET http://localhost:3000/api/history
Authorization: Bearer YOUR_JWT_TOKEN
```

Returns only predictions made by the authenticated user.

---

## 🔄 How It Works

### Making Predictions

**Without Login (Anonymous):**
- Prediction works normally
- Not saved with userId
- Won't appear in user history

**With Login:**
- Include JWT token in header
- Prediction saved with userId
- Appears in user's history

```bash
POST http://localhost:3000/api/predict
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "Pregnancies": 6,
  "Glucose": 148,
  ...
}
```

---

## 📋 Database Schema Changes

### User Collection
```javascript
{
  _id: ObjectId,
  name: "John Doe",
  email: "john@example.com",
  password: "$2a$12$hashed...",  // Encrypted
  createdAt: ISODate
}
```

### Prediction Collection (Updated)
```javascript
{
  _id: ObjectId,
  userId: ObjectId,  // NEW! Links to User
  input: { Pregnancies: 6, Glucose: 148, ... },
  prediction: 1,
  result: "Diabetes",
  probability: { no_diabetes: 0.37, diabetes: 0.63 },
  createdAt: ISODate
}
```

---

## 🎯 Next Steps (Optional)

### Frontend Integration
You'll need to update the React frontend to:
1. Add Login/Signup forms
2. Store JWT token (localStorage)
3. Include token in API requests
4. Show user's prediction history

I can help you add this when you're ready!

---

## 🔐 Security Notes

- Passwords are hashed with bcrypt (12 rounds)
- JWT tokens expire after 7 days
- Tokens include only user ID (no sensitive data)
- MongoDB connection should use SSL (Atlas does this automatically)

---

## ✅ Testing Authentication

### Test Flow:
1. **Sign up** → Get token
2. **Make prediction** with token → Saved to your account
3. **Get history** with token → See your predictions
4. **Try again** without token → Works but not saved to account

---

**Ready to test!** After installing dependencies and setting up Atlas, you'll have a fully authenticated system.
