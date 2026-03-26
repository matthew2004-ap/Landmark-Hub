# Landmark Hub - Campus Dining Platform

A full-stack web application for campus dining and lifestyle management, built with React frontend and Node.js/Express backend.

## Features

- **Student Portal**: Order food from campus cafeterias with real-time tracking
- **Vendor Dashboard**: Manage menus, orders, and inventory
- **Admin Panel**: Full platform oversight and analytics
- **AI-Powered Assistance**: Integrated AI for order recommendations and support
- **Payment Integration**: Multiple payment methods including campus wallet
- **Real-time Updates**: Live order status and delivery tracking

## Tech Stack

- **Frontend**: React 18, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: JSON file storage (easily replaceable with MongoDB/PostgreSQL)
- **Styling**: CSS with custom animations
- **Deployment**: Ready for Heroku, Vercel, or any Node.js hosting

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd landmark-hub
```

2. Install root dependencies:
```bash
npm install
```

3. Install client dependencies:
```bash
cd client
npm install
cd ..
```

4. Build the client:
```bash
npm run build
```

5. Start the server:
```bash
npm start
```

The application will be available at `http://localhost:3001`

### Development

For development with hot reload:
```bash
# Terminal 1: Start the backend
npm run dev

# Terminal 2: Start the React app
cd client
npm start
```

## Project Structure

```
landmark-hub/
├── server.js              # Express server
├── app.js                 # Main HTML page (legacy)
├── index.html             # Landing page HTML
├── styles.css             # Global styles
├── package.json           # Root dependencies
├── data/
│   └── store.json         # Application data
└── client/                # React frontend
    ├── src/
    │   ├── App.js         # Main React component
    │   └── index.js       # React entry point
    ├── public/
    │   └── index.html     # React HTML template
    └── package.json       # Frontend dependencies
```

## API Endpoints

- `GET /api/platform-data` - Get platform stats, menu, vendors, testimonials
- `POST /api/contact` - Submit contact form
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Save orders
- `GET /api/reviews` - Get all reviews
- `POST /api/reviews` - Save reviews
- `GET /api/complaints` - Get all complaints
- `POST /api/complaints` - Save complaints
- `GET /api/menu` - Get menu data
- `POST /api/menu` - Save menu data

## Deployment

### Heroku

1. Create a Heroku app
2. Connect your GitHub repository
3. Enable automatic deploys or deploy manually
4. The `heroku-postbuild` script will handle building the React app

### Vercel

1. Import the project on Vercel
2. Set the build command to `npm run build`
3. Set the output directory to `client/build`
4. Deploy

### Manual Deployment

1. Build the client: `npm run build`
2. Start the server: `npm start`
3. Configure your web server (nginx, Apache) to proxy to port 3001

## Environment Variables

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.