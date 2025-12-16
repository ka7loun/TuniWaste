import dotenv from 'dotenv';
import app from './app.js';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { initializeSocketServer } from './socket/socketServer.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tuniwaste';

// MongoDB connection options for better reliability
const mongooseOptions = {
  serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds instead of 30
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  retryWrites: true,
  w: 'majority',
};

// Set up MongoDB connection event listeners for debugging
mongoose.connection.on('connecting', () => {
  console.log('🔄 Connecting to MongoDB...');
});

mongoose.connection.on('connected', () => {
  console.log('✅ Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

// Handle application termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('👋 MongoDB connection closed due to app termination');
  process.exit(0);
});

mongoose
  .connect(MONGODB_URI, mongooseOptions)
  .then(() => {
    // Create HTTP server
    const httpServer = createServer(app);
    
    // Initialize Socket.IO server
    const io = initializeSocketServer(httpServer);
    
    // Make io available globally for use in controllers
    (app as any).io = io;
    
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🔌 Socket.IO server initialized`);
    }).on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use.`);
        console.error(`   Please stop the other process or use a different port.`);
        console.error(`   To find the process: netstat -ano | findstr :${PORT}`);
        process.exit(1);
      } else {
        console.error('❌ Server error:', err);
        process.exit(1);
      }
    });
  })
  .catch((err) => {
    console.error('\n❌ MongoDB connection failed!');
    console.error('Error details:', err.message);
    
    // Provide helpful error messages based on common issues
    if (err.message.includes('IP') || err.message.includes('whitelist')) {
      console.error('\n💡 Solution: Your IP address needs to be whitelisted in MongoDB Atlas.');
      console.error('   1. Go to: https://cloud.mongodb.com/');
      console.error('   2. Navigate to Network Access');
      console.error('   3. Click "Add IP Address" → "Add Current IP Address"');
      console.error('   4. Wait 1-2 minutes for changes to apply');
      console.error('   5. Restart the server');
      console.error('\n   See MONGODB_SETUP.md for detailed instructions.\n');
    } else if (err.message.includes('authentication')) {
      console.error('\n💡 Solution: Check your MongoDB credentials in the .env file.');
      console.error('   Verify MONGODB_URI contains the correct username and password.\n');
    } else if (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo')) {
      console.error('\n💡 Solution: Check your internet connection and MongoDB URI.');
      console.error('   Verify MONGODB_URI is correct in your .env file.\n');
    }
    
    process.exit(1);
  });

