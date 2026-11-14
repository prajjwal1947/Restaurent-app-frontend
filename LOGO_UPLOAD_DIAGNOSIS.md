# Logo Upload Issue - Diagnosis & Next Steps

## What I've Done ✅

### 1. **Added Debug Logging**
   - Enhanced `handleLogoUpload()` in Settings.jsx with console logs
   - Logs the API response and refreshed restaurant data
   - Logs any upload errors

### 2. **Added Error Handling to Images**
   - Modified Sidebar.jsx to show console error if logo fails to load
   - Modified Settings.jsx preview to show errors
   - Images will fallback to emoji if URL fails

### 3. **Created Debug Guides**
   - `LOGO_UPLOAD_DEBUG.md` - Full diagnostic steps
   - `LOGO_UPLOAD_FIX.md` - Common issues and solutions

## How to Troubleshoot 🔍

### Step 1: Upload an image and open DevTools
1. Go to Settings page
2. Select a logo image
3. Click "Upload logo"
4. Open browser DevTools (F12)
5. Go to Console tab

### Step 2: Check console output
You should see:
```
Upload response: { id: "...", logoUrl: "...", branding: {...} }
Setting logoUrl to: https://...../restaurant-images/...
Refreshed restaurant: { ... branding: {...} }
```

If you see errors instead:
- Check what error is logged
- Note the exact error message

### Step 3: Test the image URL
Copy the URL from console and paste into browser address bar:
```
https://your-project.supabase.co/storage/v1/object/public/restaurant-images/...
```

**Expected:** Image displays
**If error:** Check Supabase permissions below

### Step 4: Check Supabase Storage
1. Go to Supabase Dashboard
2. Navigate to Storage → Buckets
3. Find `restaurant-images` bucket
4. Check:
   - Bucket is public (or has proper policies)
   - File is actually uploaded in the path
   - CORS settings allow your domain

## Most Likely Issue

Based on typical "upload succeeds but image doesn't show" problems:

1. **Supabase bucket is private** (403 Forbidden)
   - Fix: Make bucket public in Supabase Dashboard

2. **Wrong SUPABASE_URL in backend**
   - Fix: Verify backend .env has correct Supabase project URL

3. **S3 credentials are incorrect**
   - Fix: Check SUPABASE_S3_* env variables in backend

4. **Image saved to database but URL not used**
   - Fix: Check if `branding.logoUrl` field has correct value in DB

## What to Check & Report

When you troubleshoot, please tell me:

1. **What does console show?**
   ```
   Copy the "Upload response" line
   ```

2. **Can you access the image URL directly?**
   ```
   Try pasting the URL in browser: [YES/NO]
   Does it show the image or error? [IMAGE/404/403/OTHER]
   ```

3. **What's in Supabase Dashboard?**
   ```
   Do you see the uploaded file in restaurant-images bucket? [YES/NO]
   Is the bucket public? [YES/NO]
   ```

4. **Any error messages?**
   ```
   Copy any console errors or network errors
   ```

## Temporary Workaround

If Supabase is having issues, we can:
1. Store logo as Base64 in database temporarily
2. Display from LocalStorage
3. Switch to different cloud storage provider

## Files Modified

- ✅ `admin/src/pages/Settings.jsx` - Added debug logging and error handling
- ✅ `admin/src/components/layout/Sidebar.jsx` - Added error handling
- ✅ Build verified - all changes compile

## Ready to Test

Build is ready. Just:
1. Upload an image
2. Check console (F12)
3. Follow troubleshooting steps above
4. Report what you find

I'll help you fix it once we identify the root cause! 🚀
