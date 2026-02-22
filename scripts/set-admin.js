#!/usr/bin/env node

// Load environment variables from .env file manually
const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    const envFile = fs.readFileSync(envPath, 'utf8');
    
    envFile.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        // Remove quotes if present
        const cleanValue = value.replace(/^["']|["']$/g, '');
        process.env[key.trim()] = cleanValue;
      }
    });
  } catch {
    console.warn('⚠️  Could not load .env file. Make sure environment variables are set.');
  }
}

// Load environment variables
loadEnvFile();

// Since we need to import from a TypeScript file, we'll initialize Firebase Admin directly
const { initializeApp, cert, getApps, getApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

// Initialize Firebase Admin
const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
};

const app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApp();
const adminAuth = getAuth(app);

async function setAdminClaim(uid) {
  try {
    // Set custom claims to make user an admin
    await adminAuth.setCustomUserClaims(uid, { admin: true });
    
    console.log(`✅ Successfully set admin privileges for user: ${uid}`);
    
    // Verify the claims were set
    const user = await adminAuth.getUser(uid);
    console.log('📋 User custom claims:', user.customClaims);
    
  } catch (error) {
    console.error('❌ Error setting admin privileges:', error.message);
    throw error;
  }
}

async function removeAdminClaim(uid) {
  try {
    // Remove admin claim
    await adminAuth.setCustomUserClaims(uid, { admin: false });
    
    console.log(`✅ Successfully removed admin privileges for user: ${uid}`);
    
    // Verify the claims were updated
    const user = await adminAuth.getUser(uid);
    console.log('📋 User custom claims:', user.customClaims);
    
  } catch (error) {
    console.error('❌ Error removing admin privileges:', error.message);
    throw error;
  }
}

async function getUserInfo(uid) {
  try {
    const user = await adminAuth.getUser(uid);
    console.log('👤 User Info:');
    console.log(`   UID: ${user.uid}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Display Name: ${user.displayName || 'Not set'}`);
    console.log(`   Phone: ${user.phoneNumber || 'Not set'}`);
    console.log(`   Email Verified: ${user.emailVerified}`);
    console.log(`   Disabled: ${user.disabled}`);
    console.log(`   Custom Claims:`, user.customClaims || 'None');
    console.log(`   Created: ${user.metadata.creationTime}`);
    console.log(`   Last Sign In: ${user.metadata.lastSignInTime || 'Never'}`);
    
  } catch (error) {
    console.error('❌ Error getting user info:', error.message);
    throw error;
  }
}

async function listAllUsers() {
  try {
    console.log('👥 Listing all users...');
    const listUsersResult = await adminAuth.listUsers();
    
    listUsersResult.users.forEach((userRecord, index) => {
      console.log(`${index + 1}. ${userRecord.uid} - ${userRecord.email || 'No email'} - Admin: ${userRecord.customClaims?.admin || false}`);
    });
    
    console.log(`\n📊 Total users: ${listUsersResult.users.length}`);
    
  } catch (error) {
    console.error('❌ Error listing users:', error.message);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    process.exit(1);
  }
  
  const command = args[0];
  const uid = args[1];
  
  try {
    switch (command) {
      case 'set':
        if (!uid) {
          console.error('❌ UID is required for set command');
          process.exit(1);
        }
        await setAdminClaim(uid);
        break;
        
      case 'remove':
        if (!uid) {
          console.error('❌ UID is required for remove command');
          process.exit(1);
        }
        await removeAdminClaim(uid);
        break;
        
      case 'info':
        if (!uid) {
          console.error('❌ UID is required for info command');
          process.exit(1);
        }
        await getUserInfo(uid);
        break;
        
      case 'list':
        await listAllUsers();
        break;
        
      default:
        console.error(`❌ Unknown command: ${command}`);
        process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  setAdminClaim,
  removeAdminClaim,
  getUserInfo,
  listAllUsers
};
