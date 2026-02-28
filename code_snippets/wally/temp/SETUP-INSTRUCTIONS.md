# WinstantPay Wallet - React Implementation

## 📁 File Structure

Copy these files to your project:

```
winpay-wallet/
├── src/
│   ├── api/
│   │   ├── client.ts
│   │   ├── auth.service.ts
│   │   └── config.ts
│   ├── components/
│   │   └── ProtectedRoute.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   └── useAuth.ts
│   ├── pages/
│   │   ├── Login.tsx
│   │   └── Dashboard.tsx
│   ├── styles/
│   │   ├── globals.css
│   │   └── Login.css
│   ├── types/
│   │   └── auth.types.ts
│   ├── utils/
│   │   └── storage.ts
│   ├── App.tsx
│   └── main.tsx
├── .env
└── public/
    └── winstantpay-logo.png  (Add your logo here)
```

## 🚀 Installation Steps

### 1. Copy Files to Your Project

Copy all the files from the outputs folder into your `winpay-wallet` project following the structure above.

**Important:** Make sure to create the folders if they don't exist:
- `src/api/`
- `src/components/`
- `src/contexts/`
- `src/hooks/`
- `src/pages/`
- `src/styles/`
- `src/types/`
- `src/utils/`

### 2. Install Required Dependencies

Make sure you have these packages installed (you should already have axios and react-router-dom):

```bash
npm install
```

If you haven't installed them yet:

```bash
npm install axios react-router-dom
```

### 3. Add Logo

Place your WinstantPay logo in the `public` folder as `winstantpay-logo.png`.

If you don't have the logo yet, the login page will show a broken image - we can fix this later.

### 4. Configure API URL

Edit the `.env` file in your project root and update the API URL:

```env
VITE_API_URL=https://your-actual-api-url.com
```

### 5. Fix a Small Bug in storage.ts

There's a typo in the `getExpiresAt()` function. Open `src/utils/storage.ts` and change line 18 from:

```typescript
return localStorage.setItem(API_CONFIG.STORAGE_KEYS.EXPIRES_AT);
```

to:

```typescript
return localStorage.getItem(API_CONFIG.STORAGE_KEYS.EXPIRES_AT);
```

### 6. Run the App

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## 🧪 Testing the Login

Use your test credentials from the API documentation to test the login.

Example from the OpenAPI spec:
- **Username:** `tsgtest`
- **Password:** `password`

## 📝 What's Working

✅ Full authentication flow with JWT tokens
✅ Automatic token refresh on 401 errors
✅ Protected routes (dashboard requires login)
✅ Logout functionality
✅ User data display
✅ Responsive login page with WinstantPay branding

## 🔜 Next Steps

After testing the login, we'll build:

1. ✅ **Login Page** (DONE!)
2. Balance Management UI
3. Foreign Exchange (FxDeal) component
4. Payment & Transfer flows
5. Transaction history
6. Account statements

## 🐛 Troubleshooting

**Issue:** "Module not found" errors
- **Fix:** Make sure you created all the folders and files in the correct locations

**Issue:** Logo not showing
- **Fix:** Add `winstantpay-logo.png` to the `public` folder

**Issue:** API connection errors
- **Fix:** Check the `.env` file has the correct API URL
- **Fix:** Make sure CORS is enabled on your API

**Issue:** Login button does nothing
- **Fix:** Open browser console (F12) to see error messages
- **Fix:** Verify API endpoints in `src/api/config.ts`

## 💡 Tips

- Open browser DevTools (F12) to see API requests and errors
- Check the Network tab to see if API calls are being made
- The auth token is stored in localStorage - you can inspect it in Application tab

## 🎨 Customization

To change colors, edit these CSS variables in `src/styles/Login.css`:

```css
:root {
  --primary-color: #1b6ec2;     /* Main blue */
  --primary-dark: #1861ac;      /* Darker blue */
  --link-color: #0077cc;        /* Link color */
}
```

---

Let me know when you're ready to test the login, and then we'll build the next features! 🚀
