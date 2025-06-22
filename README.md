# Kaizen Ideas: A Modern Employee Innovation Management Platform

Kaizen Ideas is a full-stack application that streamlines the process of collecting, reviewing, and implementing employee improvement ideas. The platform promotes continuous improvement by providing an intuitive interface for idea submission, tracking, and collaboration while offering robust analytics and leaderboard features to drive engagement.

The application consists of a React Native mobile frontend and a Node.js/Express backend, enabling employees to easily submit improvement ideas across various categories including cost savings, safety, quality, and productivity. Reviewers and administrators can efficiently manage and track ideas through their implementation lifecycle, while built-in gamification features encourage participation through leaderboards and achievement tracking.

## Repository Structure
```
.
├── backend/                      # Node.js/Express backend application
│   ├── src/
│   │   ├── config/              # Configuration files (database connection)
│   │   ├── controllers/         # Business logic for auth, ideas, users, notifications
│   │   ├── middleware/          # Auth, validation middleware
│   │   ├── models/             # Mongoose models for User, Idea, Notification
│   │   ├── routes/             # API route definitions
│   │   └── server.js           # Express application entry point
│   └── scripts/
│       └── seedData.js         # Database seeding script
└── frontend/                    # React Native mobile application
    ├── app/                     # Expo Router screens and layouts
    │   ├── (tabs)/             # Tab-based navigation screens
    │   └── _layout.js          # Root layout configuration
    ├── context/                # React Context providers
    ├── hooks/                  # Custom React hooks
    └── utils/                  # Utility functions and theme configuration
```

## Usage Instructions
### Prerequisites
- Node.js v14.x or higher
- MongoDB v4.x or higher
- Expo CLI for mobile development
- React Native development environment setup

### Installation

#### Backend Setup
```bash
# Clone the repository
git clone <repository-url>

# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update environment variables
# Edit .env with your MongoDB connection string and other configurations

# Seed the database with sample data
npm run seed

# Start the development server
npm run dev
```

#### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the Expo development server
npm start
```

### Quick Start
1. Access the application using the following test credentials:
   ```
   Employee: 12345 | OTP: 1234
   Reviewer: 67890 | OTP: 1234
   Admin: 11111 | OTP: 1234
   ```

2. Submit your first idea:
   - Navigate to the "Submit" tab
   - Fill in the idea details across the multi-step form
   - Add supporting images if needed
   - Submit for review

3. Track your ideas:
   - Use the "Tracker" tab to monitor your submitted ideas
   - Filter ideas by status
   - View detailed feedback from reviewers

### More Detailed Examples
1. Managing Ideas (Reviewers/Admins):
```javascript
// Update idea status
PUT /api/ideas/:id/status
{
  "status": "approved",
  "reviewComments": "Great improvement suggestion!",
  "actualSavings": 25000
}
```

2. Viewing Statistics:
```javascript
// Get idea statistics
GET /api/ideas/stats
// Returns aggregated statistics by department, status, and benefit type
```

### Troubleshooting
1. Database Connection Issues
   - Error: "MongoDB Connection Failed"
   - Solution: 
     ```bash
     # Check MongoDB service status
     sudo service mongod status
     
     # Verify connection string in .env
     MONGODB_URI=mongodb://localhost:27017/kaizen-ideas
     ```

2. Authentication Issues
   - Error: "Invalid token"
   - Solution: Clear local storage and re-login
   ```javascript
   // In browser console or React Native
   await AsyncStorage.clear()
   ```

## Data Flow
The application follows a standard client-server architecture with RESTful API communication between the React Native frontend and Express backend.

```ascii
[Mobile Client] <--> [Express Server] <--> [MongoDB]
     |                     |                  |
User Interface    API & Business Logic    Data Storage
     |                     |                  |
Auth Context     JWT Authentication     User/Idea Data
```

Key component interactions:
1. User authentication via JWT tokens
2. Real-time idea status updates
3. Notification system for status changes
4. File upload for supporting documentation
5. Caching for improved performance
6. Role-based access control
7. Automated email notifications
8. Analytics and reporting pipeline