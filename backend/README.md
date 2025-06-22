# Kaizen Ideas Backend API

A robust Node.js/Express backend API for the Kaizen Ideas continuous improvement platform with MongoDB integration.

## 🚀 Features

- **User Management**: Authentication, authorization, and user profiles
- **Idea Management**: Submit, review, and track improvement ideas
- **Notifications**: Real-time notifications for idea status updates
- **Leaderboards**: Individual and department-based rankings
- **Statistics**: Comprehensive analytics and reporting
- **Security**: JWT authentication, rate limiting, input validation
- **File Upload**: Support for idea attachments and images

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone and navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/kaizen_ideas
   JWT_SECRET=your_super_secret_jwt_key_here
   PORT=3000
   NODE_ENV=development
   ```

4. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

5. **Seed the database** (optional):
   ```bash
   node scripts/seedData.js
   ```

6. **Start the server**:
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "employeeNumber": "12345",
  "otp": "1234"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Ideas

#### Create Idea
```http
POST /api/ideas
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Improve Process Efficiency",
  "problem": "Current process is slow and inefficient",
  "improvement": "Implement automation to speed up the process",
  "benefit": "productivity",
  "estimatedSavings": 25000,
  "department": "Engineering"
}
```

#### Get Ideas
```http
GET /api/ideas?page=1&limit=10&status=approved&department=Engineering
Authorization: Bearer <token>
```

#### Get My Ideas
```http
GET /api/ideas/my?page=1&limit=10
Authorization: Bearer <token>
```

#### Update Idea Status (Admin/Reviewer only)
```http
PUT /api/ideas/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "approved",
  "reviewComments": "Great idea! Approved for implementation."
}
```

### Users

#### Get Leaderboard
```http
GET /api/users/leaderboard?type=individual
Authorization: Bearer <token>
```

#### Get Users (Admin only)
```http
GET /api/users?page=1&limit=10&department=Engineering
Authorization: Bearer <token>
```

### Notifications

#### Get Notifications
```http
GET /api/notifications?page=1&limit=20&isRead=false
Authorization: Bearer <token>
```

#### Mark as Read
```http
PUT /api/notifications/:id/read
Authorization: Bearer <token>
```

## 🗄️ Database Schema

### User Model
```javascript
{
  employeeNumber: String (unique),
  name: String,
  email: String (unique),
  department: String,
  designation: String,
  role: String (employee|reviewer|admin),
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Idea Model
```javascript
{
  title: String,
  problem: String,
  improvement: String,
  benefit: String (cost_saving|safety|quality|productivity),
  estimatedSavings: Number,
  department: String,
  submittedBy: ObjectId (User),
  submittedByEmployeeNumber: String,
  status: String (under_review|approved|rejected|implementing|implemented),
  reviewedBy: ObjectId (User),
  reviewedAt: Date,
  reviewComments: String,
  implementationDate: Date,
  actualSavings: Number,
  images: Array,
  tags: Array,
  priority: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Notification Model
```javascript
{
  recipient: ObjectId (User),
  recipientEmployeeNumber: String,
  type: String,
  title: String,
  message: String,
  relatedIdea: ObjectId (Idea),
  isRead: Boolean,
  readAt: Date,
  createdAt: Date
}
```

## 🔐 Authentication & Authorization

The API uses JWT (JSON Web Tokens) for authentication:

1. **Login** with employee number and OTP to receive a token
2. **Include token** in Authorization header: `Bearer <token>`
3. **Role-based access**: Different endpoints require different roles
   - `employee`: Basic access to submit and view own ideas
   - `reviewer`: Can review and update idea status
   - `admin`: Full access to all features

## 🧪 Testing Credentials

After running the seed script, use these credentials:

| Role | Employee Number | OTP | Description |
|------|----------------|-----|-------------|
| Employee | 12345 | 1234 | John Doe - Senior Engineer |
| Reviewer | 67890 | 1234 | Jane Smith - Quality Manager |
| Admin | 11111 | 1234 | Admin User - Kaizen Coordinator |

## 🔧 Development

### Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests
```

### Project Structure

```
backend/
├── src/
│   ├── config/         # Database and app configuration
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Custom middleware
│   ├── models/         # MongoDB models
│   └── routes/         # API routes
├── scripts/            # Utility scripts
├── uploads/            # File upload directory
├── .env               # Environment variables
└── package.json       # Dependencies and scripts
```

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kaizen_ideas
JWT_SECRET=your_super_secure_production_secret
PORT=3000
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### Docker Deployment (Optional)

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Monitoring & Logging

- **Health Check**: `GET /health`
- **Request Logging**: Morgan middleware
- **Error Handling**: Global error handler
- **Rate Limiting**: 100 requests per 15 minutes per IP

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Joi schema validation
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt for sensitive data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.