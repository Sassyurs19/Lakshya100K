# Firebase Deployment Guide

This guide will help you deploy the Lakshya ₹100K application to Firebase with live saving, history, and profile updates.

## Prerequisites
- Firebase project already created (lakshya-100k)
- Firebase Console access
- Authentication enabled with Email/Password

## Step 1: Deploy Firestore Security Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **lakshya-100k**
3. Navigate to **Build > Firestore Database**
4. Click on the **Rules** tab
5. Delete the existing rules
6. Copy and paste the following rules:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      // Users can read their own profile
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Users can update their own profile
      allow update: if request.auth != null && request.auth.uid == userId;
      
      // Only the user themselves can create their document (handled in signup)
      allow create: if request.auth != null && request.auth.uid == userId;
      
      // Delete is not allowed
      allow delete: if false;
    }
    
    // Savings collection
    match /savings/{savingId} {
      // Users can read their own savings
      allow read: if request.auth != null && 
                   resource.data.userId == request.auth.uid;
      
      // Users can create savings for themselves
      allow create: if request.auth != null && 
                     request.resource.data.userId == request.auth.uid;
      
      // Users can update their own savings
      allow update: if request.auth != null && 
                    resource.data.userId == request.auth.uid;
      
      // Users can delete their own savings
      allow delete: if request.auth != null && 
                    resource.data.userId == request.auth.uid;
    }
    
    // Achievements collection
    match /achievements/{achievementId} {
      // Users can read their own achievements
      allow read: if request.auth != null && 
                   resource.data.userId == request.auth.uid;
      
      // Users can create achievements for themselves (system will handle this)
      allow create: if request.auth != null && 
                     request.resource.data.userId == request.auth.uid;
      
      // Updates and deletes are not allowed for achievements
      allow update: if false;
      allow delete: if false;
    }
  }
}
```

7. Click **Publish**

## Step 2: Deploy Storage Security Rules

1. In Firebase Console, navigate to **Build > Storage**
2. Click on the **Rules** tab
3. Delete the existing rules
4. Copy and paste the following rules:

```firestore
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Savings images
    match /savings-images/{allPaths=**} {
      // Users can upload their own savings images
      // The filename should contain their userId
      allow write: if request.auth != null && 
                   request.resource.size < 10 * 1024 * 1024 && // Max 10MB
                   request.resource.contentType.matches('image/.*') &&
                   request.auth.uid in request.resource.name;
      
      // Users can read their own savings images
      allow read: if request.auth != null && 
                  request.auth.uid in resource.name;
    }
    
    // Profile images
    match /profile-images/{allPaths=**} {
      // Users can upload their own profile image
      // The filename should contain their userId
      allow write: if request.auth != null && 
                   request.resource.size < 5 * 1024 * 1024 && // Max 5MB
                   request.resource.contentType.matches('image/.*') &&
                   request.auth.uid in request.resource.name;
      
      // Anyone can read profile images (for display purposes)
      allow read: if true;
    }
  }
}
```

5. Click **Publish**

## Step 3: Deploy to Firebase Hosting

### Option A: Using Firebase CLI (Recommended)

1. Install Firebase CLI (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   cd c:\Lakshya100K
   firebase init
   ```
   - Select **Hosting**
   - Select **Use an existing project**
   - Choose **lakshya-100k**
   - Use **.** as your public directory
   - Configure as single-page app: **Yes**
   - Overwrite firebase.json: **Yes**

4. Deploy:
   ```bash
   firebase deploy
   ```

### Option B: Manual Deployment via Firebase Console

1. In Firebase Console, navigate to **Build > Hosting**
2. Click **Get Started**
3. Upload all files from your project directory (excluding node_modules, .git, etc.)
4. Configure as single-page app: **Yes**
5. Click **Deploy**

## Step 4: Verify Deployment

1. Visit your Firebase Hosting URL (e.g., https://lakshya-100k.web.app)
2. Test the following features:
   - **User Registration**: Create a new account
   - **Add Saving**: Add a new saving entry with image
   - **History View**: View savings history with filters
   - **Profile Update**: Update profile information and image
   - **Real-time Updates**: Verify changes reflect immediately

## What This Enables

After deployment, your application will have:

✅ **Live Saving System**
- Real-time saving entries stored in Firestore
- Image uploads to Firebase Storage
- Automatic running total calculations
- Achievement unlocking

✅ **Live History System**
- Paginated savings history
- Real-time search and filtering
- Export to CSV functionality
- Edit and delete operations

✅ **Live Profile System**
- Profile image uploads
- Real-time profile updates
- Statistics calculations
- Goal tracking

✅ **Security**
- User-specific data isolation
- Authentication required for all operations
- File size and type validation
- Proper error handling

## Troubleshooting

### Permission Denied Errors
- Ensure Firestore and Storage rules are published
- Check that user is authenticated
- Verify userId matches in rules

### Image Upload Failures
- Check Storage rules are deployed
- Verify file size limits (5MB for profile, 10MB for savings)
- Ensure content type is image/*

### Real-time Updates Not Working
- Verify Firestore rules allow read operations
- Check network connectivity
- Ensure Firebase SDK is properly initialized

## Production Checklist

- [ ] Firestore security rules deployed
- [ ] Storage security rules deployed
- [ ] Application deployed to Firebase Hosting
- [ ] Authentication enabled (Email/Password)
- [ ] Test user registration
- [ ] Test saving creation with image
- [ ] Test history viewing and filtering
- [ ] Test profile updates
- [ ] Test real-time updates across devices
- [ ] Verify achievement unlocking
- [ ] Test export functionality

## Support

For issues, refer to:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/rules)
- [Storage Security Rules](https://firebase.google.com/docs/storage/security)
