# Logo Upload Debug Guide

## Issue
When uploading a restaurant logo image:
- ✅ Upload succeeds (shows "Restaurant logo updated" message)
- ❌ Logo does not appear in the admin sidebar or Settings preview
- ❌ Logo still doesn't appear after page refresh

## Root Cause Analysis

### The Flow
1. User selects image file
2. Clicks "Upload logo"
3. `handleLogoUpload()` is called in Settings.jsx
4. File sent to backend endpoint: `POST /restaurant/logo/upload`
5. Backend uploads to Supabase S3 and stores URL in database
6. Response includes restaurant object with `branding.logoUrl`
7. Frontend sets `logoUrl` state and calls `refreshRestaurant()`
8. `refreshRestaurant()` calls `adminApi.restaurant()` 
9. BrandingContext updates and sidebar should re-render

### Possible Issues

#### Issue 1: Image URL is not valid
- **Check**: Open browser DevTools (F12) → Network tab
- **Upload an image and check**: What URL is returned in the response?
- **Test**: Paste that URL directly in browser to see if image loads

#### Issue 2: CORS/Cross-origin issue  
- **Check**: Open browser DevTools (F12) → Console
- **Look for**: Any "CORS" or "blocked" errors
- **If found**: Supabase bucket needs CORS configuration

#### Issue 3: Image file permissions on Supabase
- **Check**: In Supabase Dashboard → Storage → restaurant-images bucket
- **Verify**: Policies allow public read access

#### Issue 4: Frontend not waiting for refresh
- **Check**: The code does `await refreshRestaurant()` - this should work
- **But**: Make sure the context provider actually updates

#### Issue 5: Cache issue
- **Try**: Hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
- **Or**: Incognito/Private mode to bypass browser cache

## Debug Steps

### Step 1: Check the API Response
```javascript
// Open DevTools Console (F12) and run:
fetch('http://localhost:4000/api/v1/restaurant', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('admin-access-token')
  }
})
.then(r => r.json())
.then(d => console.log('Restaurant:', d.data))
```

### Step 2: Check if image URL works
```javascript
// Copy the logoUrl from the response above and test:
fetch('https://your-supabase-url/storage/v1/object/public/restaurant-images/...')
  .then(r => console.log('Image accessible:', r.ok))
```

### Step 3: Check if context is updating
```javascript
// In Sidebar component, add console.log:
console.log('Restaurant from context:', restaurant);
console.log('Logo URL:', restaurant?.branding?.logoUrl);
```

## Quick Fixes to Try

1. **Clear browser cache and storage:**
   - DevTools → Application → Clear site data
   - Then hard refresh

2. **Check Supabase bucket permissions:**
   - Go to Supabase Dashboard
   - Storage → restaurant-images
   - Make sure it's public or has proper policies

3. **Verify SUPABASE_URL environment variable:**
   - Backend must have correct Supabase project URL
   - Check .env or environment variables in backend

4. **Test with a small image:**
   - Try uploading a very small (< 100KB) PNG
   - Some issues only occur with larger files

## If Still Not Working

Check backend logs:
- Look for upload errors in backend console
- Verify Supabase credentials are correct
- Check if `imageUpload` middleware is running

Check frontend:
- Verify `refreshRestaurant()` is being called
- Check if API response actually contains the logoUrl
- Make sure image URL is being set in state
