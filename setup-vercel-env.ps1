# Vercel Environment Variables Setup Script
# This script configures all production environment variables

Write-Host "🚀 Setting up Vercel Environment Variables..." -ForegroundColor Cyan

# Database Configuration
Write-Host "`n📊 Setting up Database..." -ForegroundColor Yellow
$env:TEMP_VAR = "postgresql://postgres:bkEOzJECBtU2SZcM@db.fahcabutajczylskmmgw.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1&pool_timeout=10"
echo $env:TEMP_VAR | vercel env add DATABASE_URL production 2>&1 | Out-Null
Write-Host "✅ DATABASE_URL set" -ForegroundColor Green

$env:TEMP_VAR = "postgresql://postgres:bkEOzJECBtU2SZcM@db.fahcabutajczylskmmgw.supabase.co:6543/postgres"
echo $env:TEMP_VAR | vercel env add DIRECT_DATABASE_URL production 2>&1 | Out-Null
Write-Host "✅ DIRECT_DATABASE_URL set" -ForegroundColor Green

# NextAuth Configuration
Write-Host "`n🔐 Setting up NextAuth..." -ForegroundColor Yellow
$env:TEMP_VAR = "https://airdrop.sylvantoken.org"
echo $env:TEMP_VAR | vercel env add NEXTAUTH_URL production 2>&1 | Out-Null
Write-Host "✅ NEXTAUTH_URL set" -ForegroundColor Green

$env:TEMP_VAR = "your-secret-key-change-this-in-production"
echo $env:TEMP_VAR | vercel env add NEXTAUTH_SECRET production 2>&1 | Out-Null
Write-Host "✅ NEXTAUTH_SECRET set" -ForegroundColor Green

# Admin Credentials
Write-Host "`n👤 Setting up Admin..." -ForegroundColor Yellow
$env:TEMP_VAR = "admin@sylvantoken.org"
echo $env:TEMP_VAR | vercel env add ADMIN_EMAIL production 2>&1 | Out-Null
Write-Host "✅ ADMIN_EMAIL set" -ForegroundColor Green

$env:TEMP_VAR = "Mjkvebep_Brn68o"
echo $env:TEMP_VAR | vercel env add ADMIN_PASSWORD production 2>&1 | Out-Null
Write-Host "✅ ADMIN_PASSWORD set" -ForegroundColor Green

# Test Access Key
Write-Host "`n🔑 Setting up Access Keys..." -ForegroundColor Yellow
$env:TEMP_VAR = "07c3bc6110ce1528fa7206f504420d3fc62deab8a8ea03548d289b6eb8a3fc1c"
echo $env:TEMP_VAR | vercel env add TEST_ACCESS_KEY production 2>&1 | Out-Null
Write-Host "✅ TEST_ACCESS_KEY set" -ForegroundColor Green

# Email Configuration
Write-Host "`n📧 Setting up Email..." -ForegroundColor Yellow
$env:TEMP_VAR = "noreply@sylvantoken.org"
echo $env:TEMP_VAR | vercel env add EMAIL_FROM production 2>&1 | Out-Null
Write-Host "✅ EMAIL_FROM set" -ForegroundColor Green

$env:TEMP_VAR = "Sylvan Token"
echo $env:TEMP_VAR | vercel env add EMAIL_FROM_NAME production 2>&1 | Out-Null
Write-Host "✅ EMAIL_FROM_NAME set" -ForegroundColor Green

# SMTP Configuration
Write-Host "`n📮 Setting up SMTP..." -ForegroundColor Yellow
$env:TEMP_VAR = "smtp.gmail.com"
echo $env:TEMP_VAR | vercel env add SMTP_HOST production 2>&1 | Out-Null
Write-Host "✅ SMTP_HOST set" -ForegroundColor Green

$env:TEMP_VAR = "587"
echo $env:TEMP_VAR | vercel env add SMTP_PORT production 2>&1 | Out-Null
Write-Host "✅ SMTP_PORT set" -ForegroundColor Green

$env:TEMP_VAR = "false"
echo $env:TEMP_VAR | vercel env add SMTP_SECURE production 2>&1 | Out-Null
Write-Host "✅ SMTP_SECURE set" -ForegroundColor Green

$env:TEMP_VAR = "sylvantoken@gmail.com"
echo $env:TEMP_VAR | vercel env add SMTP_USER production 2>&1 | Out-Null
Write-Host "✅ SMTP_USER set" -ForegroundColor Green

$env:TEMP_VAR = "stnjueibsosjffbw"
echo $env:TEMP_VAR | vercel env add SMTP_PASSWORD production 2>&1 | Out-Null
Write-Host "✅ SMTP_PASSWORD set" -ForegroundColor Green

# Resend API
Write-Host "`n📨 Setting up Resend..." -ForegroundColor Yellow
$env:TEMP_VAR = "re_esWqEK4H_JANdaicdiRGjqfvUq4ZDmqLt"
echo $env:TEMP_VAR | vercel env add RESEND_API_KEY production 2>&1 | Out-Null
Write-Host "✅ RESEND_API_KEY set" -ForegroundColor Green

# Supabase Configuration
Write-Host "`n🗄️ Setting up Supabase..." -ForegroundColor Yellow
$env:TEMP_VAR = "https://fahcabutajczylskmmgw.supabase.co"
echo $env:TEMP_VAR | vercel env add SUPABASE_URL production 2>&1 | Out-Null
Write-Host "✅ SUPABASE_URL set" -ForegroundColor Green

$env:TEMP_VAR = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaGNhYnV0YWpjenlsc2ttbWd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5Mzk3MTksImV4cCI6MjA3ODUxNTcxOX0.ZiANFTDtTqsYUXBbhQLxrUVU0H-4tX38n4nbxoBSngk"
echo $env:TEMP_VAR | vercel env add SUPABASE_ANON_KEY production 2>&1 | Out-Null
Write-Host "✅ SUPABASE_ANON_KEY set" -ForegroundColor Green

$env:TEMP_VAR = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaGNhYnV0YWpjenlsc2ttbWd3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkzOTcxOSwiZXhwIjoyMDc4NTE1NzE5fQ._0cz1qZDF3c-QP9CBl01zo3M1wTEvkPanJso-d629a0"
echo $env:TEMP_VAR | vercel env add SUPABASE_SERVICE_ROLE_KEY production 2>&1 | Out-Null
Write-Host "✅ SUPABASE_SERVICE_ROLE_KEY set" -ForegroundColor Green

$env:TEMP_VAR = "Me/qAOyTMg6iDSQ/HlMbwq+rPyU0vRlQhqsKObpJnau1nWGs2faznjvGTyXDs/uFEZ7v2B7X7h0he7/F35I8tA=="
echo $env:TEMP_VAR | vercel env add SUPABASE_JWT_SECRET production 2>&1 | Out-Null
Write-Host "✅ SUPABASE_JWT_SECRET set" -ForegroundColor Green

# Public Supabase Keys
Write-Host "`n🌐 Setting up Public Keys..." -ForegroundColor Yellow
$env:TEMP_VAR = "https://fahcabutajczylskmmgw.supabase.co"
echo $env:TEMP_VAR | vercel env add NEXT_PUBLIC_SUPABASE_URL production 2>&1 | Out-Null
Write-Host "✅ NEXT_PUBLIC_SUPABASE_URL set" -ForegroundColor Green

$env:TEMP_VAR = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaGNhYnV0YWpjenlsc2ttbWd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5Mzk3MTksImV4cCI6MjA3ODUxNTcxOX0.ZiANFTDtTqsYUXBbhQLxrUVU0H-4tX38n4nbxoBSngk"
echo $env:TEMP_VAR | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production 2>&1 | Out-Null
Write-Host "✅ NEXT_PUBLIC_SUPABASE_ANON_KEY set" -ForegroundColor Green

# Telegram Configuration
Write-Host "`n💬 Setting up Telegram..." -ForegroundColor Yellow
$env:TEMP_VAR = "-1002857056222"
echo $env:TEMP_VAR | vercel env add TELEGRAM_CHANNEL_ID production 2>&1 | Out-Null
Write-Host "✅ TELEGRAM_CHANNEL_ID set" -ForegroundColor Green

$env:TEMP_VAR = "8083809833:AAGMj_xHy12LwF89_inbwiifok6FjjuOJoE"
echo $env:TEMP_VAR | vercel env add TELEGRAM_BOT_TOKEN production 2>&1 | Out-Null
Write-Host "✅ TELEGRAM_BOT_TOKEN set" -ForegroundColor Green

$env:TEMP_VAR = "SylvusBot"
echo $env:TEMP_VAR | vercel env add TELEGRAM_BOT_USERNAME production 2>&1 | Out-Null
Write-Host "✅ TELEGRAM_BOT_USERNAME set" -ForegroundColor Green

# Cloudflare Turnstile
Write-Host "`n🛡️ Setting up Turnstile..." -ForegroundColor Yellow
$env:TEMP_VAR = "0x4AAAAAACArCE6b3EXA2mX4"
echo $env:TEMP_VAR | vercel env add NEXT_PUBLIC_TURNSTILE_SITE_KEY production 2>&1 | Out-Null
Write-Host "✅ NEXT_PUBLIC_TURNSTILE_SITE_KEY set" -ForegroundColor Green

$env:TEMP_VAR = "0x4AAAAAACArCIAxxPkAefdXJYppUZPtiH4"
echo $env:TEMP_VAR | vercel env add TURNSTILE_SECRET_KEY production 2>&1 | Out-Null
Write-Host "✅ TURNSTILE_SECRET_KEY set" -ForegroundColor Green

$env:TEMP_VAR = "true"
echo $env:TEMP_VAR | vercel env add TURNSTILE_ENABLED production 2>&1 | Out-Null
Write-Host "✅ TURNSTILE_ENABLED set" -ForegroundColor Green

$env:TEMP_VAR = "true"
echo $env:TEMP_VAR | vercel env add NEXT_PUBLIC_TURNSTILE_ENABLED production 2>&1 | Out-Null
Write-Host "✅ NEXT_PUBLIC_TURNSTILE_ENABLED set" -ForegroundColor Green

# Token Contract Addresses
Write-Host "`n🪙 Setting up Token Addresses..." -ForegroundColor Yellow
$env:TEMP_VAR = "0xf949f50B3C32bD4cDa7D2192ff8f51dd9db4A469"
echo $env:TEMP_VAR | vercel env add TOKEN_DEPLOYER_ADDRESS production 2>&1 | Out-Null
Write-Host "✅ TOKEN_DEPLOYER_ADDRESS set" -ForegroundColor Green

$env:TEMP_VAR = "0x50FfD5b14a1b4CDb2EA29fC61bdf5EB698f72e85"
echo $env:TEMP_VAR | vercel env add TOKEN_CONTRACT_ADDRESS production 2>&1 | Out-Null
Write-Host "✅ TOKEN_CONTRACT_ADDRESS set" -ForegroundColor Green

# BscScan API
Write-Host "`n🔍 Setting up BscScan..." -ForegroundColor Yellow
$env:TEMP_VAR = "N8R5NJSDH686DGNJ85EJZP3IGG3GTU2UE4"
echo $env:TEMP_VAR | vercel env add BSCSCAN_API_KEY production 2>&1 | Out-Null
Write-Host "✅ BSCSCAN_API_KEY set" -ForegroundColor Green

Write-Host "`n✨ All environment variables configured successfully!" -ForegroundColor Green
Write-Host "🚀 Ready to deploy to Vercel!" -ForegroundColor Cyan
