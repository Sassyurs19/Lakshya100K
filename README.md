# Lakshya ₹100K

**Small Savings. Big Dreams.**

A premium personal savings tracker built with Firebase that helps you track every rupee, build lasting habits, and reach your financial goals with confidence.

## 🌟 Features

- **Beautiful Landing Page** - Hero section with animated floating currency symbols
- **Secure Authentication** - Email/password signup and login with Firebase Auth
- **Dashboard** - Animated counters, progress tracking, and quick actions
- **Add Savings** - Track savings with categories, notes, and proof images
- **History** - Premium card layout with search, sort, and filter
- **Analytics** - Category breakdown, goal predictions, and statistics
- **Gallery** - Pinterest-style masonry layout with fullscreen preview
- **Achievements** - Unlock badges as you reach savings milestones
- **Profile** - Manage your profile, change password, and account settings
- **Settings** - Customize goal, currency, reminders, and theme
- **Data Export** - Export your savings data to CSV

## 🚀 Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6 Modules)
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Deployment**: GitHub Pages / Firebase Hosting

## 📁 Project Structure

```
Lakshya100K/
├── index.html              # Landing page
├── login.html              # Login page
├── signup.html             # Signup page
├── dashboard.html          # Main dashboard
├── add-saving.html         # Add new saving
├── history.html            # Savings history
├── analytics.html          # Analytics and statistics
├── gallery.html            # Proof image gallery
├── achievements.html       # Achievements page
├── profile.html            # User profile
├── settings.html           # Settings page
├── 404.html                # 404 error page
├── css/
│   └── style.css           # Main stylesheet
├── js/
│   ├── firebase-config.js  # Firebase configuration
│   ├── auth.js             # Authentication module
│   ├── database.js         # Firestore operations
│   ├── storage.js          # Storage operations
│   └── utils.js            # Utility functions
├── config/
│   ├── firestore.rules     # Firestore security rules
│   └── storage.rules       # Storage security rules
├── assets/                 # Static assets
├── components/             # Reusable components
├── images/                 # Images
├── animations/             # Animations
├── firebase.json           # Firebase Hosting config
├── .gitignore              # Git ignore file
└── README.md               # This file
```

## 🔧 Setup Instructions

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Enable the following services:
   - **Authentication** (Email/Password)
   - **Firestore Database**
   - **Storage**

### 2. Get Firebase Configuration

1. In Firebase Console, go to Project Settings
2. Scroll to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Copy the configuration object

### 3. Configure Firebase

1. Open `js/firebase-config.js`
2. Replace the placeholder values with your actual Firebase credentials:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 4. Set Up Security Rules

#### Firestore Rules

1. Go to Firestore Database → Rules
2. Copy the content from `config/firestore.rules`
3. Paste and publish the rules

#### Storage Rules

1. Go to Storage → Rules
2. Copy the content from `config/storage.rules`
3. Paste and publish the rules

### 5. Enable Email/Password Authentication

1. Go to Authentication → Sign-in method
2. Enable "Email/Password" provider

### 6. Run the Project

#### Option 1: GitHub Pages (Recommended)

1. Push the project to GitHub
2. Go to Repository Settings → Pages
3. Select "main" branch as source
4. Access your site at `https://username.github.io/Lakshya100K/`

#### Option 2: Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase:
```bash
firebase init
```
- Select Hosting
- Select your Firebase project
- Use `.` as public directory
- Configure as single-page app: No

4. Deploy:
```bash
firebase deploy
```

#### Option 3: Local Development

1. Use a local server like Live Server in VS Code
2. Or use Python:
```bash
python -m http.server 8000
```
3. Open `http://localhost:8000` in your browser

## 📱 Usage

### Creating an Account

1. Open the landing page
2. Click "Create Account"
3. Fill in your details:
   - Full Name
   - Username
   - Email
   - Password (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
4. Click "Create Account"

### Adding Savings

1. Login to your account
2. Click "Add Saving" from dashboard or navigation
3. Enter:
   - Amount
   - Date & Time (auto-filled)
   - Category (Cash, Bank, UPI, Wallet, Investment, Other)
   - Note (optional)
   - Proof image (optional)
4. Click "Save Saving"

### Viewing History

1. Navigate to "History"
2. View all savings as premium cards
3. Use search to find specific savings
4. Filter by category or time period
5. Click on image to view full size

### Analytics

1. Navigate to "Analytics"
2. View:
   - Total saved amount
   - Average saving
   - Category breakdown
   - Goal prediction
3. Change time period filter

### Achievements

1. Navigate to "Achievements"
2. View unlocked and locked achievements
3. Progress bars show how close you are to the next milestone

### Profile Settings

1. Navigate to "Profile"
2. Update your profile picture
3. Change your password
4. Delete your account (permanent action)

### App Settings

1. Navigate to "Settings"
2. Set your savings goal
3. Choose currency symbol
4. Set daily reminder time
5. Export your data to CSV

## 🔒 Security

- All data is stored in Firebase Firestore
- Users can only access their own data
- Firestore security rules enforce data isolation
- Firebase Storage rules control file access
- Passwords are securely handled by Firebase Auth

## 🎨 Design

- **Theme**: White premium theme
- **Colors**: Blue (#2563eb) and Green (#10b981) accents
- **Typography**: Inter and Poppins fonts
- **Components**: Glass morphism cards, sharp buttons
- **Animations**: Smooth transitions, floating elements
- **Responsive**: Mobile-first design

## 📊 Firestore Database Structure

### Users Collection
```
users/{userId}
├── fullName: string
├── username: string
├── email: string
├── goal: number
├── currency: string
├── profileImage: string (URL)
├── createdAt: timestamp
└── settings: object
    ├── reminderTime: string
    └── theme: string
```

### Savings Collection
```
savings/{savingId}
├── userId: string
├── amount: number
├── date: string (YYYY-MM-DD)
├── time: string (HH:MM)
├── category: string
├── note: string
├── imageURL: string (URL)
└── createdAt: timestamp
```

### Achievements Collection
```
achievements/{achievementId}
├── userId: string
├── name: string
└── achievedAt: timestamp
```

## 🏆 Achievements

- 🎯 First Saving
- 💰 ₹100
- 💵 ₹500
- 💎 ₹1,000
- 🏆 ₹5,000
- 🌟 ₹10,000
- ⭐ ₹25,000
- 👑 ₹50,000
- 💫 ₹75,000
- 🏅 ₹100,000

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 👤 Author

**Sasi**

## 🙏 Acknowledgments

- Firebase for the amazing backend services
- Font Awesome for icons
- Google Fonts for typography
- The open-source community

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Made with ❤️ by Sasi**
