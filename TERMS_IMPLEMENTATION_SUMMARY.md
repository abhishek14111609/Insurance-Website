# Terms and Conditions Implementation Summary

## Overview
Comprehensive bilingual (English/Gujarati) terms and conditions have been added to the Insurance Website project based on the uploaded image requirements.

## Files Created/Modified

### Backend Files

1. **Backend/constants/termsAndConditions.js** (NEW)
   - Centralized terms and conditions constants
   - Includes:
     - Main policy terms (15 points in English & Gujarati)
     - Claim procedures (5 points in both languages)
     - Policy exclusions (5 points in both languages)
     - Tagging fees structure (Dasha, Shafar, Bhens, and tagging charges)

2. **Backend/utils/pdfGenerator.js** (MODIFIED)
   - Imported terms and conditions constants
   - Enhanced PDF generation with comprehensive bilingual terms
   - Added automatic page breaks for long content
   - Includes:
     - English terms section
     - Gujarati terms section (ગુજરાતીમાં નિયમો)
     - Claim procedures in both languages
     - Exclusions in both languages

### Customer Frontend Files

3. **CustomerFrontend/src/constants/termsAndConditions.js** (NEW)
   - Frontend version of terms constants
   - Same structure as backend for consistency
   - Used across multiple customer-facing pages

4. **CustomerFrontend/src/pages/TermsAndConditions.jsx** (NEW)
   - Dedicated Terms and Conditions page
   - Fully bilingual (English/Gujarati)
   - Sections:
     - Policy Terms & Conditions
     - Claim Procedures
     - Policy Exclusions
     - Premium & Tagging Fees
     - Contact Information
   - Accessible at: `/terms`

5. **CustomerFrontend/src/pages/TermsAndConditions.css** (NEW)
   - Modern, responsive design
   - Color-coded sections
   - Print-friendly styles
   - Mobile-optimized layout

6. **CustomerFrontend/src/pages/PolicyDetails.jsx** (MODIFIED)
   - Imported terms constants
   - Enhanced terms section with:
     - English terms (15 points)
     - Gujarati terms (15 points)
     - Claim procedures (bilingual)
     - Exclusions (bilingual, highlighted in red)

7. **CustomerFrontend/src/App.jsx** (MODIFIED)
   - Added TermsAndConditions page import
   - Added public route: `/terms`
   - Accessible to all users (no authentication required)

## Terms and Conditions Content

### Main Terms (15 Points)
Based on the uploaded image, includes:
1. Policy coverage details
2. 24-hour claim intimation requirement
3. Ear tag mandatory (No Tag No Claim)
4. Premium payment realization
5. 15-day discrepancy reporting window
6. Retagging/PM procedures
7. Doctor visit timing rules (5 hours)
8. 3-day PM availability window
9. Coverage exclusions (Upar Vayad, Bimar)
10. Tag replacement procedures (3 months)
11. Document requirements (Sarpanch/Sumer/Hum Mandali)
12. Dasha Gaya premium range (₹10,000-25,000)
13. Shafar Gaya premium range (₹10,000-40,000)
14. Bhens premium range (₹20,000-50,000)
15. Tagging charge (₹50 per animal)

### Claim Procedures (5 Points)
- Claim intimation within 24 hours
- Required documentation
- Verification timeline (3-5 working days)
- Settlement timeline (15 working days)
- Contact information for claims

### Exclusions (5 Points)
- Pre-existing diseases
- Death due to negligence
- Animals above 15 years
- Animals without proper ear tagging
- War, nuclear risks, radioactive contamination

## Where Terms Are Displayed

1. **PDF Policy Documents** (Backend)
   - Generated when admin approves a policy
   - Comprehensive bilingual terms included
   - Professional formatting with page breaks

2. **Policy Details Page** (Customer Frontend)
   - Shown when viewing policy details
   - Full bilingual terms displayed
   - Organized in collapsible sections

3. **Dedicated Terms Page** (Customer Frontend)
   - Accessible at `/terms`
   - Linked from policy application form
   - Linked from footer
   - Comprehensive standalone page

4. **Policy Application Form** (Customer Frontend)
   - Checkbox with link to terms page
   - Required acceptance before submission
   - Bilingual label

## User Access

- **Public Access**: `/terms` page is publicly accessible
- **Customer Access**: Terms visible in policy details and application
- **PDF Download**: Terms included in downloadable policy PDFs
- **Agent Access**: Can view terms when reviewing policies

## Language Support

All terms are provided in:
- **English**: For broader accessibility
- **ગુજરાતી (Gujarati)**: For local language support

## Next Steps (Optional)

If you want to further enhance the terms:
1. Add terms to Admin Frontend for reference
2. Create a Privacy Policy page
3. Add terms acceptance tracking in database
4. Create printable terms document
5. Add terms version tracking for updates

## Testing Recommendations

1. Visit `/terms` to view the dedicated page
2. Create a new policy and check PDF generation
3. View existing policy details to see enhanced terms
4. Test on mobile devices for responsive design
5. Test print functionality for terms page

---

**Implementation Date**: January 28, 2026
**Languages**: English, Gujarati (ગુજરાતી)
**Total Terms**: 15 main terms + 5 claim procedures + 5 exclusions
