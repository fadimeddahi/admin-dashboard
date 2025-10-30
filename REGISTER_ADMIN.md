# Admin Registration Script

## Create an Admin Account

Use this curl command or Postman to create an admin account:

### Using curl (PowerShell):
```powershell
$body = @{
    username = "admin_user"
    email = "admin@pcprimedz.com"
    password = "Admin@123"
    role = "admin"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://pcprimedz.onrender.com/users/register" -Method Post -Body $body -ContentType "application/json"
```

### Using curl (Command Line):
```bash
curl -X POST https://pcprimedz.onrender.com/users/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin_user\",\"email\":\"admin@pcprimedz.com\",\"password\":\"Admin@123\",\"role\":\"admin\"}"
```

### Using JavaScript/Fetch:
```javascript
fetch('https://pcprimedz.onrender.com/users/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'admin_user',
    email: 'admin@pcprimedz.com',
    password: 'Admin@123',
    role: 'admin'
  })
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));
```

## Test the Login

After registration, use these credentials in the admin panel:
- **Username**: `admin_user`
- **Password**: `Admin@123`

## Troubleshooting 401 Errors

If you're getting a 401 Unauthorized error:

1. **Verify the account exists**: Make sure you've registered an admin account first
2. **Check credentials**: Username and password are case-sensitive
3. **Check role**: Only users with `role: "admin"` can access the admin panel
4. **API Status**: Verify the API is running at https://pcprimedz.onrender.com
5. **Network**: Check browser console (F12) for detailed error messages

## API Response Examples

### Successful Registration:
```json
{
  "user": {
    "id": 1,
    "username": "admin_user",
    "email": "admin@pcprimedz.com",
    "role": "admin",
    "created_at": "2025-10-20T...",
    "updated_at": "2025-10-20T..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Successful Login:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "admin_user"
}
```

### Failed Login (401):
```json
{
  "message": "Invalid credentials" // or similar error message
}
```

## Quick Test in Browser Console

Open the login page, open browser console (F12), and run:

```javascript
// Register admin
fetch('https://pcprimedz.onrender.com/users/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'test_admin',
    email: 'test@admin.com',
    password: 'Test@123',
    role: 'admin'
  })
})
.then(r => r.json())
.then(d => console.log('Registration:', d))
.catch(e => console.error('Error:', e));

// Then test login
fetch('https://pcprimedz.onrender.com/users/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'test_admin',
    password: 'Test@123'
  })
})
.then(r => r.json())
.then(d => console.log('Login:', d))
.catch(e => console.error('Error:', e));
```
