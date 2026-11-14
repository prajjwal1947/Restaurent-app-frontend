# Logo Upload Fix - Potential Issues & Solutions

## Symptoms
- Upload succeeds with "Restaurant logo updated" message
- Logo doesn't appear in sidebar or preview  
- Still doesn't appear after refresh
- No console errors

## Most Likely Issue: Supabase URL or Permissions

### Scenario 1: Image URL is incorrect
The backend returns a URL like:
```
https://your-project.supabase.co/storage/v1/object/public/restaurant-images/...
```

But Supabase storage might need a different format or the bucket/policy settings are wrong.

**Solution:**
1. Go to Supabase Dashboard
2. Check Settings → Storage
3. Verify bucket policies allow public read access
4. Test the URL directly in browser

### Scenario 2: CORS Issue
If Supabase bucket doesn't have proper CORS headers set.

**Solution:**
1. In Supabase Dashboard, go to Storage
2. Click the restaurant-images bucket
3. Edit CORS policy to allow requests from your domain

### Scenario 3: Image encoded incorrectly
The file might be uploaded but image tag can't render it.

**Solution:**
Add error event listener to image to see what's failing:
```html
<img 
  src={logoUrl} 
  alt="Logo"
  onError={() => console.log("Image failed to load:", logoUrl)}
/>
```

## Recommended Debug Steps

### Step 1: Check the upload response
Add this to handleLogoUpload after upload:
```javascript
console.log("Raw response:", updated);
console.log("Logo URL:", updated.branding?.logoUrl || updated.logoUrl);

// Test if URL is valid
if (logoUrl) {
  fetch(logoUrl, { mode: 'no-cors' })
    .then(r => console.log('URL accessible:', r.ok))
    .catch(e => console.log('URL error:', e));
}
```

### Step 2: Check database
Run this on backend to verify logo is saved:
```sql
SELECT id, "logoUrl", branding FROM restaurant LIMIT 1;
SELECT * FROM restaurant_branding LIMIT 1;
```

### Step 3: Add error boundary to image
Wrap image display with error handling:
```jsx
<img 
  src={logoUrl}
  onError={(e) => {
    console.error("Image load failed", logoUrl, e);
    // Fallback to emoji
  }}
/>
```

## Quick Fix: Test with Different Upload Method

Try uploading via curl to test backend directly:
```bash
curl -X POST http://localhost:4000/api/v1/restaurant/logo/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg"
```

Check the response URL and whether it's accessible.

## If Still Not Working

1. **Check backend environment variables:**
   - SUPABASE_URL
   - SUPABASE_S3_ENDPOINT
   - SUPABASE_S3_ACCESS_KEY_ID
   - SUPABASE_S3_SECRET_ACCESS_KEY
   - SUPABASE_STORAGE_BUCKET

2. **Check Supabase project is active:**
   - Verify subscription is current
   - Storage should be enabled

3. **Try local storage instead:**
   - Temporarily save image to LocalStorage as base64
   - Then restore from Supabase when available

## Expected URL Format

Valid Supabase public URL format:
```
https://{project-id}.supabase.co/storage/v1/object/public/{bucket-name}/{path-to-file}
```

Examples:
- Good: `https://my-project.supabase.co/storage/v1/object/public/restaurant-images/restaurant-123/logos/image.jpg`
- Bad: `https://my-project.supabase.co/storage/object/restaurant-images/...` (missing `/v1/object/public`)
