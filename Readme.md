# Clone or download the project
git clone <repository-url>
cd tinylink

# Install dependencies
npm install

# Start the application in development mode (with auto-restart)
npm run dev

# Or start in production mode
npm start



# TinyLink - URL Shortener

A simple and efficient URL shortener service built with Node.js, Express, and PostgreSQL.

## Features

- **Shorten URLs** - Convert long URLs into short, shareable links
- **Custom Codes** - Use custom short codes for memorable URLs
- **Click Tracking** - Monitor total clicks and last accessed time
- **Link Management** - View, track, and delete your shortened links
- **Responsive UI** - Clean interface that works on all devices

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (Neon.tech)
- **Frontend:** HTML, Tailwind CSS, JavaScript
- **Hosting:** Render/Railway (Backend), Neon (Database)




# Project Structure
tinylink/
├── server.js                     # Main server file
├── config/
│ └── database.js                  # Database configuration
├── routes/
│ ├── api/
│ │ ├── healthz.js                 # Health check endpoint
│ │ └── links.js                   # Link management APIs
│ └── web.js                       # Web page routes
├── models/
│ └── Link.js                      # Database model for links
├── middleware/
│ └── validation.js                # Request validation
├── views/
│ ├── dashboard.html               # Main dashboard page
│ ├── stats.html                   # Link statistics page
│ └── 404.html                     # 404 error page
├── public/
│ ├── css/
│ │ └── output.css                 # Tailwind CSS
│ └── js/
│ ├── script.js                    # Dashboard JavaScript
│ └── stats.js                     # Stats page JavaScript
├── .env.example                   # Environment variables template
├── package.json                   # Dependencies and scripts
└── README.md                      # Project documentation