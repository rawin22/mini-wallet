import { apiClient } from './client.ts';
import { authService } from './auth.service.ts';
import { API_CONFIG } from './config.ts';
import type {
    CountryIdentificationType,
    CountryIdTypeListResponse,
    CountryInfo,
    CountryListResponse,
    CustomerGetData,
    CustomerGetResponse,
    CustomerUpdateRequest,
    CustomerUpdateResponse,
    FileAttachmentAddData,
    FileAttachmentAddRequest,
    FileAttachmentAddResponse,
    FileAttachmentInfoItem,
    FileAttachmentInfoListResponse,
    FileAttachmentUpdateRequest,
    VerificationFormData,
    VerifiedLinkCreateData,
    VerifiedLinkCreateRequest,
    VerifiedLinkCreateResponse,
    VerifiedLinkUpdateRequest,
    WizardStep,
} from '../types/verification.types.ts';
import type { SignupResponseBase } from '../types/signup.types.ts';
import { extractSignupApiMessage } from './signup.service.ts';

// ── Error handling (reuses patterns from signup.service.ts) ──

export class VerificationError extends Error {
    code: string;
    responseData?: unknown;

    constructor(code: string, message?: string, responseData?: unknown) {
        super(message || code);
        this.name = 'VerificationError';
        this.code = code;
        this.responseData = responseData;
    }
}

const getIsSuccessful = (response: SignupResponseBase): boolean => {
    if (typeof response.IsSuccessful === 'boolean') return response.IsSuccessful;
    if (typeof response.isSuccessful === 'boolean') return response.isSuccessful;
    return true;
};

const buildErrorMessage = (fallback: string, responseData?: unknown): string => {
    const apiMessage = extractSignupApiMessage(responseData);
    if (apiMessage) return apiMessage;
    return fallback;
};

const assertSuccessful = (
    response: SignupResponseBase,
    code: string,
    fallback: string,
): void => {
    if (getIsSuccessful(response)) return;
    throw new VerificationError(code, buildErrorMessage(fallback, response), response);
};

// ── Bank user authentication (same PoC pattern as signup) ──

const authenticateBankUser = async (): Promise<string> => {
    const { BANK_USERNAME, BANK_PASSWORD } = API_CONFIG.SIGNUP;
    if (!BANK_USERNAME || !BANK_PASSWORD) {
        throw new VerificationError('missingBankCredentials', 'Bank user credentials not configured.');
    }

    const authResponse = await authService.login(BANK_USERNAME, BANK_PASSWORD);
    const bankToken = authResponse.tokens?.accessToken;
    if (!bankToken) {
        throw new VerificationError('bankAuthFailed', 'Bank user authentication failed.');
    }
    return bankToken;
};

const bankAuthHeaders = async () => ({
    Authorization: `Bearer ${await authenticateBankUser()}`,
});

// ── Helpers ──

export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // Strip the data URL prefix (e.g. "data:image/jpeg;base64,")
            const base64 = result.includes(',') ? result.split(',')[1] : result;
            resolve(base64);
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
};

export const buildIdDescription = (data: VerificationFormData): string => {
    const parts = [
        `documentType: Proof of Identity`,
        `country_of_issuance: ${data.countryOfIssuance}`,
        `id_type: ${data.idType}`,
        `account/id_number: ${data.idNumber}`,
        `issuer_name: ${data.issuerName}`,
        `issuance_date: ${data.issuanceDate}`,
        `expiry_date: ${data.expirationDate}`,
    ];
    return parts.join(', ');
};

export const appendVerificationMetadata = (
    baseDescription: string,
    userId: string,
    userName: string,
    fullName: string,
    vlinkId: string,
    vlinkReference: string,
): string => {
    const metaParts = [
        `is_get_verified_requested: True`,
        `get_verified_requested_by_user_id: ${userId}`,
        `get_verified_requested_by_user_name: ${userName}`,
        `get_verified_requested_by_name: ${fullName}`,
        `get_verified_requested_date: ${new Date().toISOString().split('T')[0]}`,
        `get_verified_vlink_id: ${vlinkId}`,
        `get_verified_vlink_reference: ${vlinkReference}`,
    ];
    return `${baseDescription}, ${metaParts.join(', ')}`;
};

export const parseDescriptionProperties = (description: string): Record<string, string> => {
    const result: Record<string, string> = {};
    if (!description) return result;
    const pairs = description.split(',').map((s) => s.trim());
    for (const pair of pairs) {
        const colonIdx = pair.indexOf(':');
        if (colonIdx > 0) {
            const key = pair.slice(0, colonIdx).trim();
            const value = pair.slice(colonIdx + 1).trim();
            result[key] = value;
        }
    }
    return result;
};

/** Map OCR properties from API response to form fields */
export const mapOcrToFormData = (
    properties: Record<string, string> | null | undefined,
): Partial<VerificationFormData> => {
    if (!properties) return {};
    const p = properties;
    const result: Partial<VerificationFormData> = {};

    if (p['id_issued_country']) result.countryOfIssuance = p['id_issued_country'];
    if (p['id_type']) result.idType = p['id_type'];
    if (p['id_number']) result.idNumber = p['id_number'];
    if (p['id_issued_authority']) result.issuerName = p['id_issued_authority'];
    if (p['id_issued_date']) result.issuanceDate = p['id_issued_date'];
    if (p['id_expiration_date']) result.expirationDate = p['id_expiration_date'];
    if (p['id_birth_date']) result.dateOfBirth = p['id_birth_date'];
    if (p['id_nationality']) result.nationality = p['id_nationality'];
    if (p['id_birth_place']) result.placeOfBirth = p['id_birth_place'];

    if (p['id_sex']) {
        const sex = p['id_sex'].toUpperCase();
        if (sex === 'M' || sex === 'MALE') result.genderTypeId = 1;
        else if (sex === 'F' || sex === 'FEMALE') result.genderTypeId = 2;
    }

    return result;
};

/** Merge front and back OCR properties (front takes priority) */
export const mergeOcrProperties = (
    frontProps: Record<string, string> | null | undefined,
    backProps: Record<string, string> | null | undefined,
): Record<string, string> => {
    const merged: Record<string, string> = {};
    if (backProps) Object.assign(merged, backProps);
    if (frontProps) Object.assign(merged, frontProps);
    return merged;
};

/** Determine current wizard step from existing file attachments */
export const detectWizardStep = (attachments: FileAttachmentInfoItem[]): WizardStep => {
    const hasFront = attachments.some((a) => {
        const typeId = a.FileAttachmentTypeId ?? a.fileAttachmentTypeId;
        return typeId === 1; // ProofOfIdentityFront
    });

    if (!hasFront) return 1;

    const hasSelfie = attachments.some((a) => {
        const typeId = a.FileAttachmentTypeId ?? a.fileAttachmentTypeId;
        return typeId === 3; // SelfiePhoto
    });

    if (!hasSelfie) return 2;

    // Check if verification has been submitted (VLink metadata in front file description)
    const frontFile = attachments.find((a) => {
        const typeId = a.FileAttachmentTypeId ?? a.fileAttachmentTypeId;
        return typeId === 1;
    });

    const desc = frontFile?.Description ?? frontFile?.description ?? '';
    if (desc.includes('get_verified_vlink_id:')) return 4;

    return 3;
};

const normalizeFileAttachment = (item: FileAttachmentInfoItem): FileAttachmentInfoItem => ({
    FileAttachmentId: item.FileAttachmentId ?? item.fileAttachmentId ?? '',
    FileAttachmentTypeId: item.FileAttachmentTypeId ?? item.fileAttachmentTypeId ?? 0,
    FileName: item.FileName ?? item.fileName ?? '',
    Description: item.Description ?? item.description ?? '',
    Properties: item.Properties ?? item.properties ?? null,
    IsPrimary: item.IsPrimary ?? true,
    FileAttachmentTypeName: item.FileAttachmentTypeName,
});

// ── Service methods ──

export const verificationService = {
    async getCustomer(customerId: string): Promise<CustomerGetData> {
        const response = await apiClient.get<CustomerGetResponse>(
            `${API_CONFIG.ENDPOINTS.CUSTOMER.GET}/${customerId}`,
        );
        assertSuccessful(response.data, 'customerGetFailed', 'Failed to load customer data.');
        const customer = response.data.Customer ?? response.data.customer;
        if (!customer) {
            throw new VerificationError('customerGetFailed', 'Customer data missing from response.');
        }
        return customer;
    },

    async getCountryList(): Promise<CountryInfo[]> {
        const response = await apiClient.get<CountryListResponse>(
            API_CONFIG.ENDPOINTS.COUNTRY.LIST,
        );
        assertSuccessful(response.data, 'countryListFailed', 'Failed to load country list.');
        return response.data.Countries ?? response.data.countries ?? [];
    },

    async getIdTypes(countryCode: string): Promise<CountryIdentificationType[]> {
        const response = await apiClient.get<CountryIdTypeListResponse>(
            `${API_CONFIG.ENDPOINTS.COUNTRY.ID_TYPES}/${encodeURIComponent(countryCode)}`,
        );
        assertSuccessful(response.data, 'idTypesFailed', 'Failed to load identification types.');
        return response.data.IdentificationTypes ?? response.data.identificationTypes ?? [];
    },

    async getFileAttachmentInfoList(customerId: string): Promise<FileAttachmentInfoItem[]> {
        const response = await apiClient.get<FileAttachmentInfoListResponse>(
            `${API_CONFIG.ENDPOINTS.FILE_ATTACHMENT.INFO_LIST}/${customerId}`,
        );
        assertSuccessful(response.data, 'attachmentListFailed', 'Failed to load file attachments.');
        const items = response.data.FileAttachments ?? response.data.fileAttachments ?? [];
        return items.map(normalizeFileAttachment);
    },

    async uploadFile(request: FileAttachmentAddRequest): Promise<FileAttachmentAddData> {
        const response = await apiClient.post<FileAttachmentAddResponse>(
            API_CONFIG.ENDPOINTS.FILE_ATTACHMENT.BASE,
            request,
        );
        assertSuccessful(response.data, 'uploadFailed', 'File upload failed.');

        // Normalize casing from API response
        const d = response.data as Record<string, unknown>;
        const fa = (d.FileAttachment ?? d.fileAttachment) as Record<string, unknown> | undefined;
        const id = (fa?.FileAttachmentId ?? fa?.fileAttachmentId) as string | undefined;
        if (!id) {
            throw new VerificationError('uploadFailed', 'File uploaded but ID missing from response.');
        }

        return {
            FileAttachmentId: id,
            Properties: (fa?.Properties ?? fa?.properties) as Record<string, string> | null ?? null,
        };
    },

    async updateFileAttachment(request: FileAttachmentUpdateRequest): Promise<void> {
        const response = await apiClient.patch<SignupResponseBase>(
            API_CONFIG.ENDPOINTS.FILE_ATTACHMENT.BASE,
            request,
        );
        assertSuccessful(response.data, 'updateAttachmentFailed', 'Failed to update file attachment.');
    },

    async deleteFileAttachment(fileAttachmentId: string): Promise<void> {
        const response = await apiClient.delete<SignupResponseBase>(
            `${API_CONFIG.ENDPOINTS.FILE_ATTACHMENT.BASE}/${fileAttachmentId}`,
        );
        assertSuccessful(response.data, 'deleteAttachmentFailed', 'Failed to delete file attachment.');
    },

    async updateCustomer(request: CustomerUpdateRequest): Promise<void> {
        const headers = await bankAuthHeaders();
        const response = await apiClient.patch<CustomerUpdateResponse>(
            API_CONFIG.ENDPOINTS.CUSTOMER.UPDATE,
            request,
            { headers },
        );
        assertSuccessful(response.data, 'customerUpdateFailed', 'Failed to update customer data.');
    },

    async createVerifiedLink(request: VerifiedLinkCreateRequest): Promise<VerifiedLinkCreateData> {
        const response = await apiClient.post<VerifiedLinkCreateResponse>(
            API_CONFIG.ENDPOINTS.VERIFIED_LINK.BASE,
            request,
        );
        assertSuccessful(response.data, 'vlinkCreateFailed', 'Failed to create verification request.');

        // Normalize casing from API response
        const d = response.data as Record<string, unknown>;
        const vl = (d.VerifiedLink ?? d.verifiedLink) as Record<string, unknown> | undefined;
        const vlinkId = (vl?.VerifiedLinkId ?? vl?.verifiedLinkId) as string | undefined;
        const vlinkRef = (vl?.VerifiedLinkReference ?? vl?.verifiedLinkReference) as string | undefined;

        if (!vlinkId) {
            throw new VerificationError('vlinkCreateFailed', 'VLink created but ID missing from response.');
        }

        return {
            VerifiedLinkId: vlinkId,
            VerifiedLinkReference: vlinkRef ?? '',
            Timestamp: (vl?.Timestamp ?? vl?.timestamp) as string ?? '',
        };
    },

    async updateVerifiedLink(request: VerifiedLinkUpdateRequest): Promise<void> {
        const response = await apiClient.patch<SignupResponseBase>(
            API_CONFIG.ENDPOINTS.VERIFIED_LINK.BASE,
            request,
        );
        assertSuccessful(response.data, 'vlinkUpdateFailed', 'Failed to update verification link.');
    },
};
