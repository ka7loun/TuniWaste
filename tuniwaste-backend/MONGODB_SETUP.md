# MongoDB Atlas Connection Setup Guide

## Current Issue
The backend cannot connect to MongoDB Atlas because your IP address is not whitelisted.

## Solution: Whitelist Your IP Address

### Step 1: Get Your Current IP Address
1. Visit: https://whatismyipaddress.com/
2. Copy your public IP address (e.g., `123.45.67.89`)

### Step 2: Add IP to MongoDB Atlas Whitelist

1. **Log in to MongoDB Atlas**
   - Go to: https://cloud.mongodb.com/
   - Sign in with your account

2. **Navigate to Network Access**
   - Click on your cluster (or select it from the left sidebar)
   - Click on **"Network Access"** in the left menu
   - Or go directly to: https://cloud.mongodb.com/v2#/security/network/list

3. **Add IP Address**
   - Click **"Add IP Address"** button
   - You have two options:
     - **Option A (Recommended for Development):** Click **"Add Current IP Address"** - this automatically detects and adds your current IP
     - **Option B (Manual):** Enter your IP address manually and click **"Confirm"**
   - For production, you can also add `0.0.0.0/0` to allow all IPs (⚠️ **NOT RECOMMENDED** for production, only for testing)

4. **Wait for Changes to Apply**
   - MongoDB Atlas may take 1-2 minutes to apply the changes
   - You'll see a green checkmark when it's ready

### Step 3: Verify Connection

After whitelisting your IP, restart your backend server:

```bash
cd tuniwaste-backend
npm run dev
```

You should see:
```
✅ Connected to MongoDB
🚀 Server is running on port 5000
```

## Alternative: Allow All IPs (Development Only)

⚠️ **WARNING: Only use this for development/testing!**

If you want to allow all IPs (not recommended for production):

1. In MongoDB Atlas Network Access, click **"Add IP Address"**
2. Enter `0.0.0.0/0` in the IP address field
3. Add a comment like "Allow all IPs - Development only"
4. Click **"Confirm"**

This allows connections from any IP address, which is convenient for development but a security risk in production.

## Troubleshooting

### Still Can't Connect?

1. **Check Your IP Address**
   - Your IP might have changed (especially if using a dynamic IP)
   - Re-check your current IP and update the whitelist

2. **Check Connection String**
   - Verify your `.env` file has the correct `MONGODB_URI`
   - Make sure there are no extra spaces or characters

3. **Check MongoDB Atlas Status**
   - Ensure your cluster is running (not paused)
   - Check if there are any service alerts

4. **Firewall/VPN Issues**
   - If you're behind a corporate firewall or VPN, you may need to whitelist MongoDB Atlas IPs
   - Try disconnecting from VPN temporarily to test

5. **Wait a Few Minutes**
   - IP whitelist changes can take 1-2 minutes to propagate

## Current .env Configuration

Your `.env` file should contain:

```env
MONGODB_URI=mongodb+srv://kahlounahmed1_db_user:8ncGLXQ6iA8POIVO@tuniwaste.sxhepum.mongodb.net/tuniwaste?appName=Tuniwaste&retryWrites=true&w=majority
PORT=5000
JWT_SECRET=tuniwaste_super_
```

✅ Your configuration looks correct! The only issue is the IP whitelist.

## Security Best Practices

1. **For Development:**
   - Whitelist only your current IP address
   - Update it when your IP changes

2. **For Production:**
   - Whitelist only specific IP addresses of your servers
   - Never use `0.0.0.0/0` in production
   - Use MongoDB Atlas VPC peering for better security

3. **Database User:**
   - Use strong passwords
   - Create separate users for different environments
   - Rotate passwords regularly

