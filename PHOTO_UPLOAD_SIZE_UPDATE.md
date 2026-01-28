# Photo Upload Size Limit Update Summary

## Changes Made: 1MB → 5MB

### Updated Files

#### 1. **CustomerFrontend/src/components/PhotoUpload.jsx**
   - **Line 18-20**: Updated file size validation from 1MB (1048576 bytes) to 5MB (5242880 bytes)
   - **Line 61**: Updated UI hint text from "Max 1MB" to "Max 5MB"
   - **Impact**: Affects all photo uploads across the application (customer and agent)

#### 2. **CustomerFrontend/src/pages/AnimalPolicyForm.jsx**
   - **Line 376**: Updated hint text from "Maximum 1MB per photo" to "Maximum 5MB per photo"
   - **Impact**: Bilingual hint (English and Gujarati) updated

#### 3. **Backend/middleware/upload.middleware.js**
   - **Line 37**: Already configured with 5MB limit (`fiveMbLimit`)
   - **No changes needed** - backend was already supporting 5MB uploads

## Components Affected

### ✅ Automatically Updated (use PhotoUpload component):
1. **AnimalPolicyForm** - Customer policy application (4 cattle photos)
2. **AgentAddPolicy** - Agent policy creation (4 cattle photos)
3. Any other components using the PhotoUpload component

### ✅ Backend Upload Handlers:
1. **uploadAgentDocs** - Agent KYC documents (already 5MB)
2. **uploadPolicyPhotos** - Policy photos (already 5MB)
3. **uploadClaimDocs** - Claim documents (already 5MB)

## Technical Details

### File Size Limits:
- **Old Limit**: 1MB = 1,048,576 bytes
- **New Limit**: 5MB = 5,242,880 bytes
- **Increase**: 5x larger files allowed

### Supported File Types:
- **Images**: JPG, JPEG, PNG
- **Documents** (for KYC/Claims): PDF (in addition to images)

### Validation Points:
1. **Frontend Validation**: PhotoUpload component checks file size before upload
2. **Backend Validation**: Multer middleware enforces 5MB limit on server
3. **User Feedback**: Clear error messages if file exceeds limit

## User-Facing Changes

### English Messages:
- Upload hint: "Max 5MB • JPG, PNG"
- Error message: "File size must be less than 5MB. Please compress the image."
- Form hint: "Upload clear photos from all 4 sides. Maximum 5MB per photo."

### Gujarati Messages:
- Form hint: "ચારેય બાજુથી સ્પષ્ટ ફોટા અપલોડ કરો. ફોટો દીઠ મહત્તમ 5MB."

## Testing Recommendations

1. **Test photo uploads** in AnimalPolicyForm (customer side)
2. **Test photo uploads** in AgentAddPolicy (agent side)
3. **Verify error messages** when uploading files > 5MB
4. **Check backend** accepts files up to 5MB
5. **Test with various file sizes**:
   - < 1MB (should work)
   - 1-5MB (should work now, previously failed)
   - > 5MB (should fail with error)

## Benefits

✅ **Better Image Quality**: Users can upload higher resolution photos  
✅ **Less Compression**: No need to heavily compress images  
✅ **Fewer Rejections**: Less likely to fail due to file size  
✅ **Better Documentation**: Clearer cattle photos for verification  
✅ **Consistent Limits**: Frontend and backend both support 5MB

---

**Update Date**: January 28, 2026  
**Files Modified**: 2 frontend files  
**Backend Status**: Already configured for 5MB
