# WorldKYC Signup-to-Verification Workflow — Gold Standard Prompt

> **Purpose**: This document captures the complete signup-to-verified-member workflow as implemented in the WKYC application. It is intended as a reusable specification to rebuild this exact flow in another app, regardless of tech stack.

---

## Architecture Overview

- **Backend API**: RESTful API ("GPWebApi") with JWT bearer-token authentication. Base URL is configurable.
- **Frontend (current impl)**: ASP.NET Razor Pages (signup/login) + Blazor Server components (post-login pages).
- **Auth model**: A "bank user" (service account) authenticates for anonymous operations (signup). Logged-in users authenticate with their own credentials and receive an access token stored in a cookie-based claims identity.
- **Verification level** (`WKYCLevel`): Members start at level 0/1 (unverified). Level 2+ = verified. The verification process involves uploading ID documents + selfie, then requesting verification via a "VLink" (Verified Link).

---

## Step 1: Signup (Account Creation)

### User Input (Form Fields)

| Field            | Required | Type     | Validation |
|------------------|----------|----------|------------|
| Username         | Yes      | string   | Must not already exist (server-side check) |
| Password         | Yes      | string   | Regex: `^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$` (at least 8 chars, 1 uppercase, 1 lowercase, 1 digit). Regex is returned by the API via `AuthenticateResponse.UserSettings.PasswordRegEx`. |
| Confirm Password | Yes      | string   | Must match Password |
| Email            | Yes*     | email    | Valid email format. If empty, a default registering email from config is used. |
| Cellphone        | No       | tel      | Optional |
| First Name       | Yes      | string   | — |
| Last Name        | Yes      | string   | — |
| Referred By      | Config   | string   | Required if `IsReferredByRequired` config flag is true. Contains referrer's WPAYID. |
| Notary Node      | No       | select   | Optional. Pre-configured list of notary nodes (BranchId + CountryCode). |

### API Call Sequence (4 sequential calls)

All calls use a **bank user token** (service account), not the end user's token.

#### 1.1 Authenticate (Bank User)
```
POST {baseUrl}/authenticate
```
**Request**:
```json
{
  "LoginId": "{bankUsername}",
  "Password": "{bankUserPassword}",
  "CallerId": "{callerId}",
  "IncludeUserSettingsInResponse": true
}
```
**Response**: `AuthenticateResponse` with `Tokens.AccessToken` and `UserSettings.PasswordRegEx` / `UserSettings.PasswordRegExMessage`.

Use the returned `AccessToken` as `Authorization: Bearer {token}` for all subsequent signup calls.

#### 1.2 Check Username Availability
```
GET {baseUrl}/User/DoesUsernameExist/{username}
Authorization: Bearer {bankUserToken}
```
**Response**: `{ "Exists": true/false, "IsSuccessful": true, ... }`

Proceed only if `IsSuccessful == true && Exists == false`.

#### 1.3 Create Customer (from Template)
```
POST {baseUrl}/Customer/FromTemplate
Authorization: Bearer {bankUserToken}
Content-Type: application/json
```
**Request** (`CustomerCreateFromTemplateRequest`):
```json
{
  "BranchId": "{selectedBranchId or null}",
  "AccountRepresentativeId": "{config: AccountRepresentativeId}",
  "CustomerTemplateId": "{config: CustomerTemplateId}",
  "CustomerTypeId": 1,
  "FirstName": "{firstName}",
  "LastName": "{lastName}",
  "Email": "{email}",
  "CellPhone": "{cellphone}",
  "CountryCode": "{notaryNodeCountryCode or config: DefaultCountryCode}",
  "ReferredByPlatform": "WorldKYC Signup",
  "ReferredByName": "{referredBy}",
  "CustomerName": "",
  "MiddleName": "",
  "MailingAddressLine1": "",
  ... (all other string fields default to "")
}
```
**Response**: `{ "IsSuccessful": true, "Customer": { "CustomerId": "guid" } }`

Save the `CustomerId` for the next call.

#### 1.4 Create Customer User
```
POST {baseUrl}/CustomerUser
Authorization: Bearer {bankUserToken}
Content-Type: application/json
```
**Request** (`CustomerUserCreateRequest`):
```json
{
  "CustomerId": "{customerId from step 1.3}",
  "UserName": "{username}",
  "Password": "{password}",
  "EmailAddress": "{email}",
  "FirstName": "{firstName}",
  "LastName": "{lastName}",
  "IsApproved": true,
  "UserMustChangePassword": false,
  "EmailPasswordToUser": false,
  "WKYCId": ""
}
```
**Response**: `{ "IsSuccessful": true, "User": { "UserId": "guid" } }`

Save the `UserId` for the next call.

#### 1.5 Link Access Right Template
```
PATCH {baseUrl}/User/LinkAccessRightTemplate
Authorization: Bearer {bankUserToken}
Content-Type: application/json
```
**Request** (`UserAccessRightTemplateLinkRequest`):
```json
{
  "UserId": "{userId from step 1.4}",
  "AccessRightTemplateId": "{config: AccessRightTemplateId}"
}
```
**Response**: `{ "IsSuccessful": true }`

### Post-Signup
On success, redirect to the login page with message "Account successfully created", or to a configured `AfterSignUpUrl`.

### Configuration Keys Required
| Key | Description |
|-----|-------------|
| `Win:Beta:Url` | API base URL |
| `Win:Beta:CallerId` | Service caller ID for auth |
| `Win:Beta:BankUsername` | Service account username |
| `Win:Beta:BankUserPassword` | Service account password |
| `Win:Beta:CustomerTemplateId` | GUID - template for new customers |
| `Win:Beta:AccountRepresentativeId` | GUID - account rep ID |
| `Win:Beta:AccessRightTemplateId` | GUID - access rights template |
| `Win:Beta:DefaultCountryCode` | Default country code fallback |
| `Win:Beta:DefaultRegisteringEmail` | Fallback email if none provided |
| `Win:Beta:IsReferredByRequired` | bool - whether referral is required |
| `Win:Beta:AfterSignUpUrl` | Optional redirect URL after signup |
| `Win:Beta:NotaryNodes` | Array of `{ BranchId, Name, CountryCode, IsDefault }` |

---

## Step 2: Login (Authentication)

After signup, the user logs in with their credentials.

```
POST {baseUrl}/authenticate
```
**Request**:
```json
{
  "LoginId": "{username}",
  "Password": "{password}",
  "CallerId": "{callerId}",
  "IncludeUserSettingsInResponse": true
}
```

**Response** contains:
- `Tokens.AccessToken` / `Tokens.RefreshToken` — used for all authenticated API calls
- `UserSettings` — includes `UserId`, `OrganizationId` (CustomerId), `WKYCId`, `FirstName`, `LastName`, `EmailAddress`, `BaseCountryCode`, `CultureCode`, `SessionTimeout`, `PasswordRegEx`, `Licenses[]`

Store user claims in a cookie-based authentication scheme. Key claims: `Token`, `RefreshToken`, `CustomerId`, `UserId`, `WKYCId`, `WKYCLevel`, `FirstName`, `LastName`, `CultureCode`, `BaseCountryCode`, `SessionTimeout`.

---

## Step 3: Upload ID Documents (Get Verified — Step 1)

Route: `/get-verified` (Blazor component, requires authentication)

This is a **multi-step wizard** (4 steps). On initialization, the component:
1. Loads customer data via `GET {baseUrl}/Customer/{customerId}`
2. Loads country list via `GET {baseUrl}/CountryList`
3. Loads existing file attachments via `GET {baseUrl}/FileAttachmentInfoList/{customerId}`
4. Searches for an existing identity verification VLink, creates one if none exists

### Step 1 UI: Select Country + ID Type + Upload Front/Back

**User selects:**
- **Country of Issuance** — dropdown populated from `GET {baseUrl}/CountryList`
- **ID Type** — dropdown populated from `GET {baseUrl}/CountryIdentificationTypeList/{countryCode}` (dynamically loads when country changes)
- **Front File** — file upload (JPG/PNG only, validated by MIME type and extension)
- **Back File** — conditional, only shown if `selectedIdentificationType.RequireBackSide == true`

**On "Upload" click (`HandleStep1Next`):**

#### 3.1 Upload Front File
```
POST {baseUrl}/FileAttachment
Authorization: Bearer {userToken}
Content-Type: application/json
```
**Request** (`FileAttachmentAddFileRequest`):
```json
{
  "ParentObjectId": "{customerId}",
  "ParentObjectTypeId": 21,
  "SourceIP": "",
  "FileAttachmentTypeId": 1,
  "FileAttachmentSubTypeId": 0,
  "SumSubTypeId": "{CountryIdentificationTypeID}",
  "FileData": "[base64-encoded bytes]",
  "FileName": "front_file.jpg",
  "GroupName": "",
  "ViewableByBanker": true,
  "ViewableByCustomer": true,
  "DeletableByCustomer": false,
  "Description": "documentType: Proof of Identity, country_of_issuance: {code}, id_type: {type}, account/id_number: {number}, issuer_name: {issuer}, issuance_date: {yyyy-MM-dd}, expiry_date: {yyyy-MM-dd}",
  "Properties": null,
  "IsPrimary": true,
  "BypassFileAnalysis": false
}
```

**Important**: `FileAttachmentTypeId` values:
| Value | Type |
|-------|------|
| 0 | None |
| 1 | ProofOfIdentityFront |
| 2 | ProofOfIdentityBack |
| 3 | SelfiePhoto |

**Response** includes `FileAttachment.FileAttachmentId` and `FileAttachment.Properties` — a dictionary of OCR-extracted fields:
- `id_issued_country`, `id_type`, `id_number`, `id_issued_authority`
- `id_issued_date`, `id_expiration_date`, `id_birth_date`
- `id_nationality`, `id_sex`, `id_birth_place`

The API performs **automatic document analysis** (OCR/AI) when `BypassFileAnalysis == false`, returning extracted properties. These properties are used to pre-populate the review form (Step 3).

#### 3.2 Upload Back File (if required)
Same as 3.1 but with:
- `FileAttachmentTypeId`: 2 (ProofOfIdentityBack)
- `IsPrimary`: true
- `BypassFileAnalysis`: false
- `FileName`: `"back_file.jpg"` (or original filename)

#### 3.3 Merge Properties from Front + Back
The front and back file properties are merged (front takes priority). Merged properties are loaded into a `CustomerExtension` model for the review step.

#### 3.4 Update Customer Data with Extracted Info
```
PATCH {baseUrl}/Customer
Authorization: Bearer {bankUserToken}
Content-Type: application/json
```
Updates the customer record with extracted data (DateOfBirth, Nationality, CountryCode, GenderTypeId, CityOfBirth etc.)

#### 3.5 Update Front File Description
```
PATCH {baseUrl}/FileAttachment
Authorization: Bearer {userToken}
Content-Type: application/json
```
Updates the front file's description string with all ID metadata and OCR results.

---

## Step 4: Upload Selfie (Get Verified — Step 2)

### Step 2 UI: Upload Selfie Photo

**User selects:**
- **Selfie File** — file upload (JPG/PNG only)

**On "Upload" click (`HandleStep2Next`):**

```
POST {baseUrl}/FileAttachment
Authorization: Bearer {userToken}
Content-Type: application/json
```
**Request**:
```json
{
  "ParentObjectId": "{customerId}",
  "ParentObjectTypeId": 21,
  "FileAttachmentTypeId": 3,
  "SumSubTypeId": 0,
  "FileData": "[base64-encoded selfie bytes]",
  "FileName": "selfie.jpg",
  "Description": "documentType: Selfie",
  "ViewableByBanker": true,
  "ViewableByCustomer": true,
  "DeletableByCustomer": false,
  "IsPrimary": true,
  "BypassFileAnalysis": true
}
```

Note: `BypassFileAnalysis` is `true` for selfies — no OCR/analysis needed.

---

## Step 5: Review & Submit Verification Request (Get Verified — Step 3)

### Step 3 UI: Review Extracted/Editable Data

Displays thumbnails of all uploaded documents (front, back, selfie) and editable fields:

| Field              | Source | Editable |
|--------------------|--------|----------|
| Country of Issuance | OCR / user | Yes |
| ID Type #          | OCR / user | Yes |
| Last Name          | OCR / customer data | Yes |
| Middle Name        | OCR / customer data | Yes |
| First Name         | OCR / customer data | Yes |
| Nationality        | OCR / customer data | Yes (country dropdown) |
| Date of Birth      | OCR / customer data | Yes (date picker) |
| Place of Birth     | OCR / customer data | Yes |
| Gender             | OCR / customer data | Yes (Male/Female/N/A) |
| Issuer Name        | OCR | Yes |
| Issuance Date      | OCR | Yes (date picker) |
| Expiration Date    | OCR | Yes (date picker) |

**Validation (all required for submit):**
- CountryOfIssuance, IdType, IdNumber, LastName, FirstName, Nationality, DateOfBirth (non-null), PlaceOfBirth, GenderTypeId >= 1, IssuanceDate (non-null), IssuerName, ExpirationDate (non-null)

**On "Submit" click (`HandleStep3Next`):**

#### 5.1 Update Front File Description (if ID info changed)
Updates the front file attachment description with the corrected metadata.

#### 5.2 Update Customer Data (if profile info changed)
Updates customer record with corrected first/last/middle name, nationality, DOB, place of birth, gender.

#### 5.3 Create or Update Identity Verification VLink

If no VLink exists yet:
```
POST {baseUrl}/VerifiedLink
Authorization: Bearer {userToken}
Content-Type: application/json
```
**Request** (`VerifiedLinkCreateRequest`):
```json
{
  "VerifiedLinkTypeId": 3,
  "VerifiedLinkName": "{customerName}",
  "CustomerId": "{customerId}",
  "MinimumWKYCLevel": 0,
  "Message": "{structured message with verification request metadata}",
  "ShareFirstName": true,
  "ShareLastName": true,
  "ShareNationality": true,
  "ShareBirthDate": true,
  "ShareBirthCity": true,
  "ShareGender": true,
  "ShareIdType": true,
  "ShareIdNumber": true,
  "ShareIdExpirationDate": true,
  "ShareIdFront": true,
  "ShareIdBack": true,
  "ShareSelfie": true,
  "IsPrimary": true,
  ...
}
```
**Response**: `{ "VerifiedLink": { "VerifiedLinkId": "guid", "VerifiedLinkReference": "string" } }`

The VLink's URL is then updated to point to the verify page:
```
PATCH {baseUrl}/VerifiedLink
```
Sets `VerifiedLinkUrl` and `VerifiedLinkShortUrl` to `{baseUrl}verify/{vlinkId}`.

If VLink already exists, update its message with the latest verification request data.

#### 5.4 Update Front File with Verification Request Metadata
```
PATCH {baseUrl}/FileAttachment
```
Appends verification metadata to the front file's description:
```
..., is_get_verified_requested: True, get_verified_requested_by_user_id: {userId}, get_verified_requested_by_user_name: {username}, get_verified_requested_by_name: {fullName}, get_verified_requested_date: {yyyy-MM-dd}, get_verified_vlink_id: {vlinkId}, get_verified_vlink_reference: {vlinkReference}
```

### Step 4 UI: Confirmation / Result

Displays:
- QR Code pointing to `{baseUrl}verify/{vlinkId}`
- Reference Number (copyable)
- Target URL (copyable)
- Verification Code / VLink ID (copyable)
- Thumbnails of all uploaded documents
- Summary of all ID details
- Notes section (view existing notes + add new notes via `POST {baseUrl}/ItemNote`)

---

## Complete API Endpoint Reference

| # | Method | Endpoint | Purpose | Auth |
|---|--------|----------|---------|------|
| 1 | POST | `/authenticate` | Get access token | None |
| 2 | POST | `/Authenticate/Refresh` | Refresh expired token | Bearer |
| 3 | GET | `/User/DoesUsernameExist/{username}` | Check username availability | Bearer (bank) |
| 4 | POST | `/Customer/FromTemplate` | Create new customer from template | Bearer (bank) |
| 5 | POST | `/CustomerUser` | Create user for customer | Bearer (bank) |
| 6 | PATCH | `/User/LinkAccessRightTemplate` | Link access rights template to user | Bearer (bank) |
| 7 | GET | `/Customer/{customerId}` | Get customer details | Bearer |
| 8 | PATCH | `/Customer` | Update customer data | Bearer (bank) |
| 9 | GET | `/CountryList` | Get list of countries | Bearer |
| 10 | GET | `/CountryIdentificationTypeList/{countryCode}` | Get ID types for a country | Bearer |
| 11 | GET | `/FileAttachmentInfoList/{customerId}` | List all file attachments for customer | Bearer |
| 12 | GET | `/FileAttachment/{fileAttachmentId}` | Get file attachment data (incl. bytes) | Bearer |
| 13 | POST | `/FileAttachment` | Upload new file attachment | Bearer |
| 14 | PATCH | `/FileAttachment` | Update file attachment info | Bearer |
| 15 | DELETE | `/FileAttachment/{fileAttachmentId}` | Delete file attachment | Bearer |
| 16 | GET | `/FileAttachment/ExtractData/{fileAttachmentId}` | Extract OCR data from file | Bearer |
| 17 | GET | `/FileAttachment/SetAsPrimary/{fileAttachmentId}` | Set file as primary | Bearer |
| 18 | GET | `/FileAttachmentPropertyList/{fileAttachmentId}` | Get file properties | Bearer |
| 19 | PATCH | `/FileAttachmentPropertyList` | Update file properties | Bearer |
| 20 | POST | `/VerifiedLink` | Create verified link (VLink) | Bearer |
| 21 | PATCH | `/VerifiedLink` | Update verified link | Bearer |
| 22 | POST | `/Verify` | Verify a VLink | Bearer |
| 23 | POST | `/Verify/{vlinkId}` | Verify a VLink by ID | Bearer |
| 24 | GET | `/ItemNote/{itemId}` | Get all notes for an item | Bearer |
| 25 | POST | `/ItemNote` | Create a note | Bearer |

---

## Key Data Models

### FileAttachmentType Enum
```
None = 0
ProofOfIdentityFront = 1
ProofOfIdentityBack = 2
SelfiePhoto = 3
```

### ParentObjectTypeId Values
| Value | Object Type |
|-------|------------|
| 21 | Customer |
| 28 | VerifiedLink |
| 29 | LiveVerification |

### File Description Format (Proof of Identity)
Comma-separated key-value pairs stored as a string:
```
documentType: Proof of Identity, country_of_issuance: {CC}, id_type: {type}, account/id_number: {num}, issuer_name: {issuer}, issuance_date: {yyyy-MM-dd}, expiry_date: {yyyy-MM-dd}, is_get_verified_requested: True, get_verified_requested_by_user_id: {guid}, get_verified_requested_by_user_name: {username}, get_verified_requested_by_name: {fullname}, get_verified_requested_date: {yyyy-MM-dd}, get_verified_vlink_id: {guid}, get_verified_vlink_reference: {reference}
```

### File Description Format (Selfie)
```
documentType: Selfie
```

### CustomerExtension Model (Verification Form Data)
```
WKYCId: string
CountryOfIssuance: string (country code)
IdType: string (e.g., "Passport", "National ID Card")
IdNumber: string
IssuerName: string
IssuanceDate: DateTime?
ExpirationDate: DateTime?
FirstName: string
MiddleName: string
LastName: string
Nationality: string (country code)
DateOfBirth: DateTime?
PlaceOfBirth: string
GenderTypeId: short (0=N/A, 1=Male, 2=Female)
VLinkId: string (guid)
VLinkReference: string
IsGetVerifiedRequested: string
GetVerifiedRequestedByUserId: string
GetVerifiedRequestedByUserName: string
GetVerifiedRequestedByName: string
GetVerifiedRequestedDate: string
```

---

## Workflow State Machine

```
[Signup Form] --success--> [Login Page]
       |
       v
[Login] --success--> [Home / Dashboard]
       |
       v
[Get Verified Page] (checks WKYCLevel)
       |
       +--> WKYCLevel >= 2 --> "You are verified" (done)
       |
       +--> WKYCLevel < 2 --> Step Wizard:
              |
              Step 1: Upload ID (Country + Type + Front + optional Back)
              |   API: FileAttachment POST (front), FileAttachment POST (back)
              |   API: Customer PATCH (update with OCR data)
              |   API: FileAttachment PATCH (update description)
              |
              Step 2: Upload Selfie
              |   API: FileAttachment POST (selfie)
              |
              Step 3: Review & Submit
              |   API: FileAttachment PATCH (update description if changed)
              |   API: Customer PATCH (update profile if changed)
              |   API: VerifiedLink POST or PATCH (create/update VLink)
              |   API: FileAttachment PATCH (append verification metadata)
              |
              Step 4: Confirmation
                  Displays QR code, reference, URLs, document summary, notes
```

---

## Finding Current Step (on page load)

The wizard determines the current step by checking existing data:
1. If no front file exists (no `ProofOfIdentityFront` attachment) → **Step 1**
2. If front file exists but no selfie → **Step 2**
3. If front file and selfie exist but no verification request metadata in description → **Step 3**
4. If verification request has been submitted (VLinkId present in description) → **Step 4**

---

## Error Handling Patterns

- All API responses inherit from `DTOResponseBase` which includes `IsSuccessful: bool`, `HasErrors: bool`, `ErrorMessages: string[]`
- Always check `IsSuccessful` before proceeding
- Display `ErrorMessages[0]` to user on failure
- Username already taken: checked via `DoesUsernameExist` before attempting creation
- File validation: client-side MIME type + extension check (JPG/PNG only, `.jpg`, `.jpeg`, `.png`)
- Max file size: configurable via `Win:MaxAllowedSize`

---

## Security Notes

- Signup uses a **bank user service account** token — never the end user's token (user doesn't have one yet)
- Post-login operations use the **user's own token** (except Customer PATCH which uses bank user token for elevated permissions)
- CSRF: Anti-forgery tokens used on Razor Pages forms
- Password regex is server-defined and returned by the API
- File uploads are validated server-side (analysis engine) in addition to client-side checks
- Session timeout is configurable and enforced via sliding cookie expiration

---

## Environment / .env

All configuration variables needed to run the signup-to-verification workflow. In the current implementation these live in `appsettings.json` under the `Win:Beta` section (and a few top-level keys). Adapt to `.env`, vault, or any config system in your target stack.

### Core API Settings

```env
# API base URL (all endpoints are relative to this)
WIN_BETA_URL=https://www.bizcurrency.com:20500/api/v1

# API version header sent with every request
WIN_BETA_VERSION=3.0.116

# Caller ID — identifies this application to the API (GUID)
WIN_BETA_CALLER_ID=12FDEC27-6E1F-4EC5-BF15-1C7E75A99117
```

### Bank User (Service Account)

These credentials authenticate the "bank user" used for anonymous operations (signup, username check, etc.) and elevated operations (customer PATCH).

```env
# Bank user login credentials
WIN_BETA_BANK_USERNAME=4kycmig
WIN_BETA_BANK_USER_PASSWORD=Wkycmig@88
```

### Template & Representative IDs

GUIDs that link new customers to the correct template and account representative in the system.

```env
# Account representative assigned to new customers (GUID)
WIN_BETA_ACCOUNT_REPRESENTATIVE_ID=9469c6b2-ebed-ec11-915b-3ee1a118192f

# Customer template used in "Create Customer From Template" (GUID)
WIN_BETA_CUSTOMER_TEMPLATE_ID=b3cccc87-4317-ef11-8541-002248afce03

# Access right template linked to new users after signup (GUID)
WIN_BETA_ACCESS_RIGHT_TEMPLATE_ID=dba74278-a2e8-4503-b59c-8ab8cd458841
```

### Regional / Default Settings

```env
# Default country code for signup (ISO 2-letter)
WIN_BETA_DEFAULT_COUNTRY_CODE=HK

# Default registering email sent with customer creation
WIN_BETA_DEFAULT_REGISTERING_EMAIL=register@worldkyc.com

# "Referred by" platform name attached to new signups
WIN_BETA_REFERRED_BY_PLATFORM=WorldKYC Signup

# Whether the "Referred By" field is required on the signup form
WIN_BETA_IS_REFERRED_BY_REQUIRED=false
```

### Notary Nodes (Branches)

Each notary node represents a branch/jurisdiction. At least one must be marked `IsDefault`. These populate the "Notary Node" dropdown on the signup form and determine the `CountryCode` sent with customer creation.

```env
# Notary node 1 (default)
WIN_BETA_NOTARY_NODE_1_BRANCH_ID=82b42669-ac24-e911-9109-3ee1a118192f
WIN_BETA_NOTARY_NODE_1_NAME=World KYC HK - Hong Kong
WIN_BETA_NOTARY_NODE_1_COUNTRY_CODE=HK
WIN_BETA_NOTARY_NODE_1_IS_DEFAULT=true

# Notary node 2
WIN_BETA_NOTARY_NODE_2_BRANCH_ID=adbc61a1-648e-e811-bca9-002590067f61
WIN_BETA_NOTARY_NODE_2_NAME=TradeEnabler TH - Thailand
WIN_BETA_NOTARY_NODE_2_COUNTRY_CODE=TH
WIN_BETA_NOTARY_NODE_2_IS_DEFAULT=false
```

### URLs & Branding

```env
# Forgot password redirect URL
WIN_BETA_FORGOT_PASSWORD_URL=https://www.bizcurrency.com/WKYCBeta/Pages/General/Login.aspx

# Trust Scan default link (shown in trust scan feature)
WIN_BETA_TRUST_SCAN_DEFAULT_LINK=https://t.me/Winstant

# Contact/support URL
WIN_BETA_CONTACT_US_URL=https://support.worldkyc.com/Main/frmNewTicket.aspx

# Logo file name (served from wwwroot/images)
WIN_BETA_LOGO_FILE_NAME=kyc-logo-blue-white-notag.png

# URL to redirect to after signup (empty = default login page)
WIN_BETA_AFTER_SIGN_UP_URL=

# Dashboard welcome message (HTML)
WIN_BETA_DASHBOARD_MESSAGE=<p>Welcome to <b>World KYC...</b></p>
```

### Application Mode

```env
# Which service adapter to use: "Beta" or "Prod"
WIN_MODE=Beta

# Localization language code
WIN_LINGO=en

# Translation mode
WIN_TRANSLATION_MODE=Live
```

### File Upload

```env
# Maximum allowed file size in bytes (10 MB)
WIN_MAX_ALLOWED_SIZE=10485760
```

### Email Settings (Notifications)

```env
EMAIL_SMTP_SERVER=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=support@worldkyc.com
EMAIL_PASSWORD=<your-app-password>
EMAIL_SENDER_EMAIL=support@worldkyc.com
EMAIL_RECIPIENT_EMAIL=support@worldkyc.com
EMAIL_SUPPORT_RECIPIENT_EMAILS=support@worldkyc.com
```

### Database (if applicable)

```env
CONNECTION_STRING=Server=<host>;Database=WKYCDb;Trusted_Connection=True;TrustServerCertificate=True;
```

### Usage Notes

- **Bank user credentials** are used server-side only — never expose them to the client/browser.
- **Template IDs** are environment-specific. When pointing at a different API instance, request the correct GUIDs from the API provider.
- **Notary Nodes** can be extended by adding more entries. The default node's `CountryCode` is used when no selection is made.
- **`WIN_MODE`** switches the entire service layer between Beta and Production API endpoints/credentials. Each mode has its own full set of the above variables.
