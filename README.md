# Dashboard Pro

## Quick Start

### Backend (Terminal 1)
```bash
cd backend
npm install
npm run dev
# Server runs at http://localhost:5000
```

### Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
# App runs at http://localhost:5173
```

## Login
- Email: `admin@gmail.com`
- Password: `1234`

## Backend Modes
- **Without MongoDB** (default): Works out of the box — data in memory
- **With MongoDB**: Add `MONGODB_URI=mongodb://localhost:27017/dashboard` to `backend/.env`

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login |
| GET  | /api/auth/me    | Get current user |
| GET  | /api/products   | List products |
| POST | /api/products   | Create product |
| PUT  | /api/products/:id | Update product |
| DELETE | /api/products/:id | Delete product |
| GET  | /api/orders     | List orders |
| POST | /api/orders     | Create order |
| PUT  | /api/orders/:id | Update order |
| DELETE | /api/orders/:id | Delete order |
| GET  | /api/customers  | List customers |
| POST | /api/customers  | Create customer |
| PUT  | /api/customers/:id | Update customer |
| DELETE | /api/customers/:id | Delete customer |
| GET  | /api/analytics/stats | Dashboard stats |
| GET  | /api/health     | Health check |
