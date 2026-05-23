const { initializeApp } = require("firebase/app");
const { getAuth, createUserWithEmailAndPassword } = require("firebase/auth");

// Load Firebase credentials from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if variables are loaded
if (!firebaseConfig.apiKey) {
  console.error("Error: Firebase Environment variables are not loaded.");
  console.error("Make sure to run the script with Node's environment flag: node --env-file=.env create_super_admin.js");
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Use email and password from command arguments, or defaults
const email = process.argv[2] || "admin@glvia.com";
const password = process.argv[3] || "AdminPassword123";

async function createAdmin() {
  console.log(`Creating Firebase Auth user for Super Admin: ${email}...`);
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("\nSuccess!");
    console.log("--------------------------------------------------");
    console.log(`Super Admin user created successfully in Firebase Auth!`);
    console.log(`Email: ${userCredential.user.email}`);
    console.log(`Firebase UID: ${userCredential.user.uid}`);
    console.log("--------------------------------------------------");
    console.log("\nNow you can open the Admin Sign In page, leave the Security PIN blank,");
    console.log(`and log in with:`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log("\nOn your first login, the application will prompt you to set up your 4-digit Security PIN.");
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log("\nNote: This email is already registered in Firebase Auth!");
      console.log("You can log in directly with the password you previously set.");
    } else {
      console.error("\nError creating Firebase user:", error.message);
    }
  }
}

createAdmin();
