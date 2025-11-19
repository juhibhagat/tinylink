# Clone or download the project
git clone <repository-url>
cd tinylink

# Install dependencies
npm install

# Start the application in development mode (with auto-restart)
npm run dev

# Or start in production mode
npm start


# Deploy to Render.com
 1. Create account at render.com
 2. Connect GitHub repository
 3. Create new Web Service
 4. Configure settings:
    - Build Command: npm install
    - Start Command: npm start
 5. Add Environment Variables:
    - NODE_ENV=production
    - BASE_URL=your-app-name.onrender.com
 6. Deploy - Automatic deployment on git push



# Deploy to Railway.app 
 1. Sign up at railway.app
 2. New Project → "Deploy from GitHub"
 3. Connect your repository
 4. Auto-deploys on every git push
 5. Add environment variables in dashboard



# Project Structure
tinylink/
├── app.js                 # Main server file
├── config/
│   └── db.js             # Database configuration
├── routes/
│   └── links.js          # All application routes
├── views/
│   ├── dashboard.ejs     # Main dashboard page
│   └── stats.ejs         # Link statistics page
├── package.json          # Dependencies and scripts
└── README.md             # This file