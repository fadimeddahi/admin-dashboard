# Register Admin User Script
# Run this in PowerShell to create an admin account

$apiUrl = "https://pcprimedz.onrender.com/users/register"

# Admin credentials - CHANGE THESE!
$username = "admin_user"
$email = "admin@pcprimedz.com"
$password = "Admin@123"

# Create request body
$body = @{
    username = $username
    email = $email
    password = $password
    role = "admin"
} | ConvertTo-Json

Write-Host "Registering admin user..." -ForegroundColor Yellow
Write-Host "Username: $username" -ForegroundColor Cyan
Write-Host "Email: $email" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method Post -Body $body -ContentType "application/json"
    
    Write-Host "`nSuccess! Admin account created." -ForegroundColor Green
    Write-Host "`nUser Details:" -ForegroundColor Yellow
    $response.user | Format-List
    
    Write-Host "`nToken:" -ForegroundColor Yellow
    Write-Host $response.token
    
    Write-Host "`n✅ You can now login with:" -ForegroundColor Green
    Write-Host "   Username: $username" -ForegroundColor Cyan
    Write-Host "   Password: $password" -ForegroundColor Cyan
    
} catch {
    Write-Host "`nError: Failed to register admin" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        Write-Host "`nAPI Response:" -ForegroundColor Yellow
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
}

Write-Host "`nPress any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
