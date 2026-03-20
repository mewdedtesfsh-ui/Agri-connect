# AgriConnect - Agricultural Information Platform

AgriConnect is a comprehensive agricultural information platform designed for farmers in Ethiopia, providing live crop market prices, weather forecasting, farming advice, and SMS notifications.

## 🌟 Features

### For Farmers
- 👤 User registration and authentication
- 💰 View live crop market prices across markets
- 🌤️ Weather forecasts (current + 7-day)
- 📚 Access farming advice with media (images, videos, audio)
- ❓ Ask questions to extension officers
- ⭐ Rate and review advice articles
- 📱 Receive SMS notifications for weather alerts
- 📊 Dashboard with price trends and weather overview

### For Extension Officers
- 📝 Create and manage farming advice articles
- 📸 Upload media (images, videos, audio) to articles
- 💬 Answer farmer questions
- 📊 View engagement statistics

### For Admins
- 👥 Manage users and extension officers
- 🌾 Manage crops, markets, and prices
- 🌦️ Create weather alerts with SMS notifications
- 📊 View analytics and system statistics
- 📱 Monitor SMS logs and delivery
- 🔧 System configuration and management

## 🛠️ Technology Stack

- **Frontend**: React.js, TailwindCSS, Vite
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT, bcrypt
- **SMS**: Twilio
- **Email**: Nodemailer (Gmail)
- **External APIs**: OpenWeatherMap API
- **File Upload**: Multer
- **Testing**: Jest (property-based testing)

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Docker & Docker Compose (optional)
- Twilio account (for SMS)
- OpenWeatherMap API key
- Gmail account (for email notifications)

## 🚀 Quick Start

### Option 1: Docker (Recommended)

1. **Clone the repository**
```bash
git clone https://github.com/mewdedtesfsh-ui/Agri-connect.git
cd Agri-connect
```

2. **Create `.env` file in backend directory**
```bash
cd backend
cp .env.example .env
```

Edit `.env` and add your credentials:
- Database credentials (PostgreSQL)
- JWT secret
- Weather API key (OpenWeatherMap)
- Twilio credentials (for SMS)
- Email credentials (Gmail)

3. **Run with Docker Compose**
```bash
cd ..
docker-compose up -d
```

4. **Initialize the database**
```bash
docker exec -it agriconnect-backend npm run seed
```

5. **Access the application**
   - Frontend: http://localhost:3002
   - Backend API: http://localhost:5000

### Option 2: Manual Setup

See [docs/setup/LOCAL_SETUP_GUIDE.md](docs/setup/LOCAL_SETUP_GUIDE.md) for detailed instructions.

## 📚 Documentation

### Setup Guides
- [Setup Checklist](docs/setup/SETUP_CHECKLIST.md) - Complete setup checklist
- [Local Setup Guide](docs/setup/LOCAL_SETUP_GUIDE.md) - Manual installation guide
- [Email Setup](docs/setup/EMAIL_SETUP_GUIDE.md) - Configure email notifications

### SMS Documentation
- [SMS Setup Guide](docs/sms/SETUP_GUIDE.md) - Complete SMS setup
- [Twilio Setup](docs/sms/TWILIO_SETUP.md) - Quick Twilio guide
- [Provider Comparison](docs/sms/PROVIDERS_COMPARISON.md) - Compare SMS providers

### Feature Documentation
- [Media Upload](docs/features/MEDIA_UPLOAD.md) - Media upload feature guide
- [Phase 2 Features](docs/features/PHASE2_FEATURES.md) - Phase 2 feature summary

## 🔑 Default Credentials

### Admin Account
- Email: `admin@agriconnect.et`
- Password: `admin123`

### Extension Officer
- Email: `officer@agriconnect.et`
- Password: `officer123`

### Farmer Accounts
- Email: `abebe@example.com` | Password: `farmer123`
- Email: `tigist@example.com` | Password: `farmer123`

## 📁 Project Structure

```
agriconnect/
├── backend/
│   ├── config/          # Database configuration
│   ├── middleware/      # Auth, validation middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic (SMS, email, notifications)
│   ├── scripts/         # Database seeds and migrations
│   ├── tests/           # Unit and integration tests
│   └── uploads/         # Uploaded media files
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── context/     # React context (Auth, Toast)
│   │   ├── pages/       # Page components
│   │   │   ├── admin/   # Admin pages
│   │   │   └── extension/ # Extension officer pages
│   │   └── App.jsx
│   └── dist/            # Production build
├── docs/
│   ├── setup/           # Setup documentation
│   ├── sms/             # SMS documentation
│   ├── features/        # Feature documentation
│   └── internal/        # Internal docs (audits, cleanup)
└── .kiro/
    └── specs/           # Feature specifications
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Users & Officers
- `GET /api/users` - Get all users (Admin)
- `GET /api/officers` - Get extension officers (Admin)
- `PATCH /api/officers/:id/approve` - Approve officer (Admin)

### Crops, Markets & Prices
- `GET /api/crops` - Get all crops
- `GET /api/markets` - Get all markets
- `GET /api/prices` - Get all prices
- Admin endpoints for CRUD operations

### Weather
- `GET /api/weather?location=<location>` - Get weather forecast
- `GET /api/weather-alerts` - Get active weather alerts
- `POST /api/weather-alerts` - Create weather alert (Admin)

### Advice & Questions
- `GET /api/extension/advice` - Get all advice articles
- `POST /api/extension/advice` - Create advice (Extension Officer)
- `GET /api/extension/questions` - Get farmer questions
- `POST /api/extension/questions/:id/answer` - Answer question

### Ratings & Reviews
- `POST /api/ratings/advice/:id` - Rate advice article
- `GET /api/ratings/advice/:id` - Get article ratings

### SMS
- `GET /api/sms/logs` - Get SMS logs (Admin)
- `GET /api/sms/stats` - Get SMS statistics (Admin)
- `POST /api/sms/send` - Send manual SMS (Admin)

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/:id/read` - Mark as read

## 🗄️ Database Schema

### Core Tables
- `users` - User accounts (farmers, officers, admins)
- `crops` - Crop information
- `markets` - Market locations
- `prices` - Crop prices by market

### Feature Tables
- `advice_articles` - Farming advice with media
- `farmer_questions` - Questions from farmers
- `weather_alerts` - Weather alert notifications
- `sms_logs` - SMS delivery logs
- `notifications` - In-app notifications
- `advice_ratings` - Ratings and reviews
- `advice_reviews` - Detailed reviews

## 🔒 Security Features

- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT authentication with 24-hour expiration
- ✅ Role-based authorization (Admin/Extension Officer/Farmer)
- ✅ Input validation and sanitization
- ✅ SQL injection prevention (parameterized queries)
- ✅ File upload validation (type, size)
- ✅ CORS policy
- ✅ Rate limiting on authentication endpoints

## ⚡ Performance Optimizations

- Weather data caching (1-hour cache)
- Database indexes on frequently queried columns
- Gzip compression for API responses
- Static asset caching
- Efficient SQL queries with joins

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run property-based tests
npm run test:property

# Run integration tests
npm run test:integration
```

## 📱 SMS Notifications

AgriConnect supports SMS notifications for:
- Weather alerts to farmers
- Price update notifications
- System announcements

SMS provider:
- Twilio (Global coverage)

See [docs/sms/](docs/sms/) for setup instructions.

## 🌍 Deployment

### Production Checklist
- [ ] Update environment variables
- [ ] Set strong JWT secret
- [ ] Configure production database
- [ ] Set up SMS provider
- [ ] Configure email service
- [ ] Enable HTTPS
- [ ] Set up domain and DNS
- [ ] Configure CORS for production domain
- [ ] Set up monitoring and logging
- [ ] Create database backups

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📄 License

MIT

## 📞 Support

For issues and questions:
- Email: support@agriconnect.et
- Documentation: [docs/](docs/)
- Issues: GitHub Issues

## 🙏 Acknowledgments

- OpenWeatherMap for weather data API
- Twilio for SMS services
- All contributors and testers

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Production Ready
#   A g r i - c o n n e c t 
 
 