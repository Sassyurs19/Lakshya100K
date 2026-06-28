# Firebase Setup Instructions

This application requires Firebase Authentication and Firestore to function. The Firebase configuration has been set up with the following credentials:

## Current Firebase Configuration

- **Project ID**: lakshya-100k
- **Auth Domain**: lakshya-100k.firebaseapp.com
- **Storage Bucket**: lakshya-100k.firebasestorage.app
- **App ID**: 1:772396453515:web:b5e3314be252b283d10e8e

## Prerequisites

- A Google account
- Firebase project already created

## Step 1: Enable Authentication

1. In Firebase Console, go to **Build > Authentication**
2. Click **Get Started**
3. Enable **Email/Password** sign-in provider
4. Click **Save**

## Step 2: Create Firestore Database

1. In Firebase Console, go to **Build > Firestore Database**
2. Click **Create Database**
3. Choose a location (select the one closest to your users)
4. Select **Start in Test Mode** (we'll update security rules later)
5. Click **Enable**

## Step 3: Deploy Firestore Security Rules

1. In Firebase Console, go to **Build > Firestore Database > Rules**
2. Replace the existing rules with the content from `firestore.rules` in this project
3. Click **Publish**

The security rules ensure:
- Users can only read/write their own documents
- Data is protected from unauthorized access

## Step 4: Set Up Firebase Storage

1. In Firebase Console, go to **Build > Storage**
2. Click **Get Started**
3. Select a location (same as Firestore)
4. Select **Start in Test Mode**
5. Click **Enable**
6. Go to **Storage > Rules**
7. Replace with the content from `storage.rules` in this project
8. Click **Publish**

## Step 5: Test the Application

1. Open `index.html` in your browser
2. Try to create a new account
3. Verify that the user is created in Firebase Console > Authentication
4. Verify that the user document is created in Firestore > users collection
5. Test login with email and username
6. Test password reset functionality

## Firestore Data Structure

### Users Collection
```
users/{userId}
├── uid: string
├── fullName: string
├── username: string
├── email: string
├── profileImage: string (URL)
├── goalAmount: number (default: 100000)
├── createdAt: timestamp
├── lastLogin: timestamp
├── provider: string ("email")
├── theme: string ("light" or "dark")
└── currency: string ("INR")
```

### Savings Collection
```
savings/{savingId}
├── userId: string
├── amount: number
├── category: string
├── date: string (ISO format)
├── time: string
├── note: string
└── imageUrl: string (optional)
```

### Achievements Collection
```
achievements/{achievementId}
├── userId: string
├── achievementId: string
├── name: string
├── icon: string
├── achievedAt: timestamp
└── description: string
```

## Troubleshooting

### Authentication Errors
- **"auth/email-already-in-use"**: Email already registered
- **"auth/invalid-email"**: Invalid email format
- **"auth/weak-password"**: Password doesn't meet requirements
- **"auth/user-not-found"**: User doesn't exist

### Firestore Errors
- **"Missing or insufficient permissions"**: Security rules not deployed correctly
- **"permission-denied"**: User doesn't have access to the document

### Common Issues

1. **CORS Errors**: Make sure you're running the app from a local server or HTTPS
2. **Firebase not initialized**: Check that `firebase-config.js` has correct values
3. **Route protection not working**: Ensure `initializeAuthGuard()` is called on all pages

## Production Checklist

- [ ] Update Firebase config with production credentials
- [ ] Deploy Firestore security rules
- [ ] Deploy Storage security rules (if using image uploads)
- [ ] Enable Email verification (optional)
- [ ] Set up custom email templates (optional)
- [ ] Configure Firebase Analytics (optional)
- [ ] Test all authentication flows
- [ ] Test password reset functionality
- [ ] Test account deletion
- [ ] Verify data persistence after page refresh

## Google Sign-In (Future)

The Google Sign-In button is currently disabled with a "Coming Soon" badge. To enable it later:

1. In Firebase Console, go to **Authentication > Sign-in method**
2. Enable **Google** sign-in provider
3. Add your domain to the authorized domains
4. Update `js/firebase-config.js` to include Google Auth provider
5. Remove the `disabled` attribute from the Google button in `login.html`
6. Implement Google Auth logic in `js/auth.js`

## Support

For Firebase-related issues, refer to:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
