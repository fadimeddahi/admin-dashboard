# Admin Dashboard# Admin Dashboard# E-Commerce Admin Dashboard



A full-stack admin panel I built for managing e-commerce operations. This project taught me a lot about state management, authentication flows, and building maintainable React applications.



**Live Demo:** [admin-dashboard-iota-drab-17.vercel.app](https://admin-dashboard-iota-drab-17.vercel.app)A full-stack admin panel I built for managing e-commerce operations. This project taught me a lot about state management, authentication flows, and building maintainable React applications.A modern, full-featured admin dashboard for managing e-commerce operations, built with Next.js 15, React 19, TypeScript, and TailwindCSS. Features real-time data visualization, inventory management, order processing, and role-based authentication.



## What It Does



This dashboard handles the core admin needs for an e-commerce business:**Live Demo:** [admin-dashboard-iota-drab-17.vercel.app](https://admin-dashboard-iota-drab-17.vercel.app)**🔗 Live Demo:** [admin-dashboard-iota-drab-17.vercel.app](https://admin-dashboard-iota-drab-17.vercel.app)



- Real-time analytics (revenue, orders, customers)

- Complete product management with image uploads

- Order processing and tracking## What It Does![Dashboard Preview](./screenshots/dashboard.png)

- Hardware component inventory (CPUs, RAM, storage, etc.)

- Activity logging for audit trails

- Secure JWT-based authentication

This dashboard handles the core admin needs for an e-commerce business:---

## Built With

- Real-time analytics (revenue, orders, customers)

- **Next.js 15** with App Router and React 19

- **TypeScript** for type safety across the codebase- Complete product management with image uploads## ✨ Features

- **Tailwind CSS** for styling

- **TanStack Query** for server state management- Order processing and tracking

- **Cloudinary** for image handling

- **JWT tokens** for authentication- Hardware component inventory (CPUs, RAM, storage, etc.)### Core Functionality



## Project Structure- Activity logging for audit trails- **📊 Real-time Dashboard** - Revenue analytics, order metrics, customer insights, and low-stock alerts



```- Secure JWT-based authentication- **🛍️ Product Management** - Complete CRUD operations with image uploads, bulk actions, and advanced filtering

app/

  components/        # Reusable UI components- **📦 Order Processing** - Order tracking, status management, customer details, and order history

  dashboard/         # Main dashboard page

  products/          # Product management## Built With- **💻 Component Inventory** - Dedicated management for CPUs, RAM, Storage, Motherboards, and Monitors

  orders/            # Order tracking

  login/             # Authentication- **🔐 Role-Based Authentication** - JWT-based auth with protected routes and admin-only access

  types/             # TypeScript definitions

lib/- **Next.js 15** with App Router and React 19- **📝 Activity Logging** - Complete audit trail of all admin actions

  auth.ts           # Authentication utilities

  components.ts     # API functions- **TypeScript** for type safety across the codebase- **🎨 Modern UI/UX** - Clean, responsive design with dark mode

  errorHandler.ts   # Error handling

```- **Tailwind CSS** for styling



## Getting Started- **TanStack Query** for server state management### Technical Highlights



```bash- **Cloudinary** for image handling- **Type-Safe** - Full TypeScript implementation with strict typing

# Install dependencies

npm install- **JWT tokens** for authentication- **Server State Management** - TanStack Query for efficient data fetching and caching



# Run development server- **Form Handling** - Multi-tab product forms with client-side validation

npm run dev

```## Project Structure- **Error Handling** - User-friendly error messages with detailed console logging



Open [http://localhost:3000](http://localhost:3000) - you'll be redirected to login.- **Responsive Design** - Mobile-first approach with Tailwind CSS



The backend is configured at `https://pcprimedz.onrender.com`. To use your own API, update `API_BASE_URL` in `lib/auth.ts`.```- **Code Quality** - ESLint configuration, clean architecture, reusable components



## Key Featuresapp/



**Multi-Tab Product Form**  components/        # Reusable UI components---



Built a complex tabbed interface for adding/editing products. Each tab handles different aspects like pricing, inventory, and technical specs. Includes proper validation and Cloudinary integration for images.  dashboard/         # Main dashboard page



**Activity Logging**  products/          # Product management## 🛠️ Tech Stack



Every admin action gets logged with username and timestamp. The logs page has filtering by action type, entity, and search. Makes it easy to track what happened and when.  orders/            # Order tracking



**Error Handling**  login/             # Authentication| Category | Technologies |



Created a custom error handler that shows friendly messages to users while logging detailed info to the console. No more showing raw 500 errors.  types/             # TypeScript definitions|----------|-------------|



**Component Managers**lib/| **Frontend** | React 19, Next.js 15 (App Router), TypeScript |



Separate CRUD interfaces for different hardware components. Each one is customized for its type while sharing the same base pattern.  auth.ts           # Authentication utilities| **Styling** | Tailwind CSS 4, CSS Modules |



**State Management**  components.ts     # API functions| **State Management** | TanStack Query (React Query) |



TanStack Query handles all server state (products, orders, logs) with automatic caching and refetching. Local UI state uses React hooks.  errorHandler.ts   # Error handling| **Form Handling** | Native React state with validation |



## Technical Approach```| **Icons** | Lucide React |



- **TypeScript everywhere** - Helps catch bugs before they reach production| **Image Handling** | Cloudinary integration, Next.js Image optimization |

- **Component reusability** - Built pieces like StatCard, Modal patterns

- **Custom hooks** - Extracted shared logic for cleaner code## Getting Started| **Authentication** | JWT tokens, localStorage, Protected Routes |

- **Tailwind utilities** - Fast styling without leaving the markup

- **Protected routes** - Authentication checks on every admin page| **API Client** | Custom `authenticatedFetch` wrapper |



## What I Learned```bash| **Development** | Turbopack, ESLint, TypeScript 5 |



This project pushed my frontend skills in several areas:# Install dependencies



- Managing complex forms with validationnpm install---

- Authentication flows in Next.js

- When to use server state vs local state

- Building maintainable component structures

- Real-world API integration# Run development server## 📁 Project Structure



## Code Qualitynpm run dev



- Full TypeScript with strict mode``````

- Consistent naming conventions

- Clear separation of concernsadmin-dashboard/

- Reusable component patterns

- Error boundaries for graceful failuresOpen [http://localhost:3000](http://localhost:3000) - you'll be redirected to login.├── app/



## Author│   ├── components/          # Reusable UI components



**Fadi Meddahi**The backend is configured at `https://pcprimedz.onrender.com`. To use your own API, update `API_BASE_URL` in `lib/auth.ts`.│   │   ├── ActivityLogList.tsx



Frontend Developer│   │   ├── CPUComponentManager.tsx



[LinkedIn](https://www.linkedin.com/in/fadi-meddahi-193789342/) • [GitHub](https://github.com/fadimeddahi)## Key Features│   │   ├── Header.tsx



---│   │   ├── OrderDetailsModal.tsx



Built with Next.js and deployed on Vercel.**Multi-Tab Product Form**  │   │   ├── ProductModal.tsx


Built a complex tabbed interface for adding/editing products. Each tab handles different aspects like pricing, inventory, and technical specs. Includes proper validation and Cloudinary integration for images.│   │   ├── ProtectedRoute.tsx

│   │   ├── Sidebar.tsx

**Activity Logging**  │   │   └── ...

Every admin action gets logged with username and timestamp. The logs page has filtering by action type, entity, and search. Makes it easy to track what happened and when.│   ├── dashboard/           # Dashboard page & layout

│   ├── products/            # Product management

**Error Handling**  │   ├── orders/              # Order management

Created a custom error handler that shows friendly messages to users while logging detailed info to the console. No more showing raw 500 errors.│   ├── components/          # Component inventory pages

│   │   ├── cpu/

**Component Managers**  │   │   ├── ram/

Separate CRUD interfaces for different hardware components. Each one is customized for its type while sharing the same base pattern.│   │   ├── storage/

│   │   └── ...

**State Management**  │   ├── login/               # Authentication

TanStack Query handles all server state (products, orders, logs) with automatic caching and refetching. Local UI state uses React hooks.│   ├── logs/                # Activity logging

│   ├── types/               # TypeScript type definitions

## Technical Approach│   └── providers/           # React Query provider

├── lib/

- **TypeScript everywhere** - Helps catch bugs before they reach production│   ├── auth.ts              # Authentication utilities

- **Component reusability** - Built pieces like StatCard, Modal patterns│   ├── components.ts        # Component API functions

- **Custom hooks** - Extracted shared logic for cleaner code│   └── errorHandler.ts      # Error handling utilities

- **Tailwind utilities** - Fast styling without leaving the markup├── public/                  # Static assets

- **Protected routes** - Authentication checks on every admin page└── ...config files

```

## What I Learned

---

This project pushed my frontend skills in several areas:

- Managing complex forms with validation## 🚀 Getting Started

- Authentication flows in Next.js

- When to use server state vs local state### Prerequisites

- Building maintainable component structures- Node.js 18+ and npm/yarn/pnpm

- Real-world API integration- Backend API running (or update `API_BASE_URL` in `lib/auth.ts`)



## Code Quality### Installation



- Full TypeScript with strict mode1. **Clone the repository**

- Consistent naming conventions```bash

- Clear separation of concernsgit clone https://github.com/fadimeddahi/admin-dashboard.git

- Reusable component patternscd admin-dashboard

- Error boundaries for graceful failures```



## Author2. **Install dependencies**

```bash

**Fadi Meddahi**  npm install

Frontend Developer```



[LinkedIn](https://www.linkedin.com/in/fadi-meddahi-193789342/) • [GitHub](https://github.com/fadimeddahi)3. **Set up environment variables** (if needed)

```bash

---# Update API_BASE_URL in lib/auth.ts

export const API_BASE_URL = "https://your-api-url.com";

Built with Next.js and deployed on Vercel.```


4. **Run development server**
```bash
npm run dev
```

5. **Open your browser**
```
http://localhost:3000
```

### Building for Production

```bash
npm run build
npm run start
```

---

## 🔑 Authentication

The dashboard requires admin authentication:

- Navigate to `/login`
- Enter admin credentials (configured in your backend)
- JWT token is stored securely and validated on protected routes
- Automatic redirect to login on session expiry

---

## 📸 Screenshots

### Dashboard Overview
![Dashboard](./screenshots/dashboard.png)

### Product Management
![Products](./screenshots/products.png)

### Order Processing
![Orders](./screenshots/orders.png)

### Component Inventory
![Components](./screenshots/components.png)

---

## 🎯 Key Implementation Details

### Component Abstraction
- Reusable UI components following atomic design principles
- Consistent prop interfaces and TypeScript definitions
- Separated concerns: UI, business logic, and data fetching

### State Management
- **TanStack Query** for server state (caching, refetching, optimistic updates)
- React hooks (`useState`, `useEffect`) for local component state
- Custom hooks for shared logic

### API Integration
- Centralized API functions in `lib/` directory
- `authenticatedFetch` wrapper for JWT token injection
- Comprehensive error handling with user-friendly messages

### Type Safety
- Strict TypeScript configuration
- Interface definitions for all data models
- Type-safe API responses and form data

---

## 🧩 Notable Features

### Multi-Tab Product Form
Complex product creation/editing with tabbed interface:
- Basic Information
- Pricing & Discounts
- Inventory Management
- Image Upload (Cloudinary)
- Technical Specifications
- Marketing Details

### Activity Logging
Complete audit trail system:
- Tracks all CRUD operations
- Records admin actions with username
- Filterable by action type, entity, and search
- Pagination for performance

### Protected Routes
Security-first approach:
- Client-side route protection
- JWT token validation
- Role-based access control
- Automatic session management

---

## 🤝 Contributing

This is a portfolio project, but suggestions and feedback are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit your changes (`git commit -m 'Add improvement'`)
4. Push to the branch (`git push origin feature/improvement`)
5. Open a Pull Request

---

## 📄 License

MIT License - feel free to use this project for learning and inspiration.

---

## 👤 Author

**Fadi Meddahi**
- GitHub: [@fadimeddahi](https://github.com/fadimeddahi)
- LinkedIn: [Your LinkedIn]
- Portfolio: [Your Portfolio]

---

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **Vercel** for seamless deployment
- **TailwindCSS** for the utility-first CSS framework
- **Lucide** for the beautiful icon library

---

**⭐ If you found this project helpful, please consider giving it a star!**