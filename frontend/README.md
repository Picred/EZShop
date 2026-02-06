# EZShop Frontend

Modern React frontend application for EZShop shop management system.

## 🎨 Vibe Coding Philosophy

**"Vibe coding" is the core purpose of this frontend implementation.** 

This project goes beyond functional requirements to prioritize **aesthetic excellence** and **visual fluidity**. The goal is to verify the system through a premium, highly responsive user interface that "feels" right. Visual testing is as critical as functional testing — every interaction must be smooth, polished, and visually cohesive.

## Tech Stack

- **React 18** with TypeScript
- **Vite** - Build tool
- **TailwindCSS** + **DaisyUI** - Styling
- **Zustand** - State management
- **React Router** - Routing
- **Axios** - HTTP client
- **React Hook Form** + **Zod** - Form handling and validation
- **Recharts** - Charts and analytics
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://127.0.0.1:8000`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The application will be available at `http://localhost:5173`

### Default Credentials

- **Username**: admin
- **Password**: admin

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── Layout/      # Layout components (MainLayout, etc.)
│   └── ProtectedRoute.tsx
├── pages/           # Page components
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── InventoryPage.tsx
│   ├── OrdersPage.tsx
│   ├── SalesPage.tsx
│   ├── AnalyticsPage.tsx
│   └── ReportsPage.tsx
├── services/        # API service layer
│   ├── api.ts
│   ├── authService.ts
│   ├── productsService.ts
│   ├── ordersService.ts
│   └── salesService.ts
├── stores/          # Zustand state stores
│   └── authStore.ts
├── types/           # TypeScript type definitions
│   └── api.ts
├── App.tsx          # Main app component with routing
├── main.tsx         # Entry point
└── index.css        # Global styles
```

## Features

### Implemented

- ✅ Authentication with JWT tokens
- ✅ Dashboard with KPI cards and analytics charts
- ✅ Inventory management (view products)
- ✅ Orders management with status tabs
- ✅ Sales management
- ✅ Responsive sidebar navigation
- ✅ Protected routes
- ✅ API integration with backend

### To Be Enhanced

- Product CRUD forms (modal implementation)
- Order creation and management
- Sales transaction workflow
- Returns/refunds management
- Advanced analytics and reporting
- Suppliers management
- Customer management

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=/api/v1
```

## API Integration

The frontend connects to the backend API through Axios with:
- Automatic JWT token injection
- Request/response interceptors
- Error handling
- Token refresh on 401 errors

## Design

The UI follows the design specifications from the Stitch export files with:
- Clean, modern interface
- Blue primary color scheme (#4F46E5 indigo)
- Card-based layouts
- Responsive design
- DaisyUI component library

## Development

### Running with Backend

1. Start the backend server:
   ```bash
   cd /home/picred/EZShop-1
   python main.py
   ```

2. Start the frontend dev server:
   ```bash
   cd /home/picred/EZShop-1/frontend
   npm run dev
   ```

3. Open `http://localhost:5173` in your browser

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## License

This project is part of the EZShop application.
