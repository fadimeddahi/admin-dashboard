# Admin Dashboard Authentication Integration

## 🔐 API Integration Complete

### Authentication API Details
- **Base URL**: `https://pcprimedz.onrender.com`
- **Login Endpoint**: `POST /users/login`
- **Register Endpoint**: `POST /users/register`

### Features Implemented

#### 1. **Authentication Library** (`lib/auth.ts`)
- JWT token decoding and validation
- Role-based access control (admin check)
- Token storage in localStorage
- Authenticated API requests with Bearer token
- Auto-redirect on token expiration

#### 2. **Login Page** (`app/login/page.tsx`)
- Real API integration with login endpoint
- Username/email input (flexible authentication)
- Password input
- Remember me checkbox
- Loading states and error handling
- Admin role verification
- Auto-redirect to dashboard on successful login
- Error messages for failed authentication

#### 3. **Protected Routes** (`app/components/ProtectedRoute.tsx`)
- Client-side route protection
- Token validation on page load
- Admin role verification
- Loading spinner during authentication check
- Auto-redirect to login if unauthorized

#### 4. **Enhanced Components**
- **Sidebar**: Logout functionality with auth cleanup
- **Header**: Display logged-in username from token
- **Dashboard Layout**: Wrapped with ProtectedRoute
- **Products Page**: Wrapped with ProtectedRoute
- **Orders Page**: Wrapped with ProtectedRoute

### Security Features
✅ JWT token-based authentication
✅ Role-based access control (admin only)
✅ Token stored securely in localStorage
✅ Authorization header in API requests
✅ Auto-logout on token expiration
✅ Protected routes for all admin pages
✅ Client-side role verification

### How to Use

#### For Admin Login:
1. Navigate to `/login`
2. Enter admin credentials:
   - Username: `admin_user`
   - Password: `securePassword123`
3. Click "Login"
4. System verifies admin role from JWT token
5. Redirects to `/dashboard` if authorized

#### For Admin Registration (via API):
```bash
POST https://pcprimedz.onrender.com/users/register
Content-Type: application/json

{
  "username": "admin_user",
  "email": "admin@pcprimedz.com",
  "password": "securePassword123",
  "role": "admin"
}
```

### JWT Token Structure
The JWT token contains:
- User ID
- Username
- Email
- **Role** (used for authorization)
- Expiration time

### API Request Format
All authenticated API requests include:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Storage Keys
- `auth_token`: JWT token
- `username`: User's username
- `user_role`: User's role (decoded from token)

### Error Handling
- Invalid credentials: Shows error message
- Non-admin users: Access denied message
- Expired token: Auto-redirect to login
- Network errors: User-friendly error messages

### Protected Pages
All admin pages are now protected:
- ✅ `/dashboard` - Dashboard home
- ✅ `/products` - Product management
- ✅ `/orders` - Order management

### Next Steps (Optional Enhancements)
1. Add token refresh mechanism
2. Implement "Remember Me" functionality with longer token expiry
3. Add logout API call (if backend supports it)
4. Store user preferences
5. Add session timeout warning
6. Implement 2FA (if required)

## 🚀 Ready to Use!
The admin dashboard is now fully integrated with the authentication API and ready for production use.
