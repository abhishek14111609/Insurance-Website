# Policy Schedule Generation Report

## 1. Overview
The objective is to implement a strict PDF generation process that replicates the format of `CI_POLICYSCHEDULERURALCI_80059781 copy.PDF` using policy data from the database and company details from `GST CERTIFICATE.pdf`.

## 2. Current Capabilities
- **Database Model (`Policy.js`)**: We have access to all necessary dynamic data:
    -   **Policy Info**: Policy Number, Period, Dates, Sum Insured, Premium.
    -   **Insured Info**: Name, Address, Contact.
    -   **Risk Info**: Cattle Tag, Type, Breed, Gender, Age, Health.
- **PDF Generation**: The current `utils/pdfGenerator.js` uses `pdfkit` to generate a "Certificate of Insurance". This can be extended or replicated to create the "Policy Schedule".

## 3. Implementation Strategy
To "strictly" follow the reference PDF without changing existing logic unnecessarily:
1.  **New Utility Function**: Create a dedicated function (e.g., `generateStrictPolicySchedule`) in `Backend/utils/pdfGenerator.js`.
2.  **Layout Replication**: We will build the PDF structure programmatically using `pdfkit` to match the reference headers, tables, and footers.
3.  **Data Mapping**:
    -   **DB Fields** -> **PDF Fields** (e.g., `policy.policyNumber` -> "Policy No", `policy.coverageAmount` -> "Sum Insured").
    -   **Static Details** -> From `GST CERTIFICATE.pdf`.

## 4. Requirements & Clarifications
Since I cannot visually view the contents of the binary PDF files (`CI...PDF` and `GST...PDF`), I require the following specific details to ensure strict compliance:

### From `GST CERTIFICATE.pdf`:
Please provide the exact text for:
1.  **Legal Entity Name** (e.g., "Pashudhan Suraksha Insurance Ltd."?)
2.  **Registered Address**
3.  **GSTIN Number**
4.  **State Code** (if applicable)

### From `CI_POLICYSCHEDULERURALCI_80059781 copy.PDF`:
To ensure the layout is "strict", please describe or confirm the following:
1.  **Header Format**: Does it include specific logos (left/right) or specific header text (e.g., "Policy Schedule" vs "Certificate of Insurance")?
2.  **Table Structure**: Are there specific columns required for the Cattle Description that differ from the current implementation?
3.  **Clauses/Warranties**: Is there specific static text (disclaimers, warranties) that must be included verbatim?

## 5. Next Steps
Once the above details are confirmed, I will:
1.  Update `Backend/utils/pdfGenerator.js` with the new generation logic.
2.  Ensure the styling (fonts, spacing, borders) matches a professional Policy Schedule.
