import { apiClient } from './client.ts';
import { authService } from './auth.service.ts';
import { API_CONFIG } from './config.ts';
import type {
    AccessRightTemplateLinkRequest,
    CustomerFromTemplateRequest,
    CustomerFromTemplateResponse,
    CustomerUserCreateRequest,
    CustomerUserCreateResponse,
    NotaryNode,
    SignupFormConfig,
    SignupFormData,
    SignupResponseBase,
    SignupResult,
    UsernameExistsResponse,
} from '../types/signup.types.ts';

export type SignupErrorCode =
    | 'missingBankCredentials'
    | 'bankAuthFailed'
    | 'usernameExists'
    | 'customerCreateFailed'
    | 'customerUserCreateFailed'
    | 'accessRightsLinkFailed'
    | 'unknown';

export class SignupError extends Error {
    code: SignupErrorCode;

    constructor(code: SignupErrorCode, message?: string) {
        super(message || code);
        this.name = 'SignupError';
        this.code = code;
    }
}

const getIsSuccessful = (response: SignupResponseBase): boolean => {
    if (typeof response.IsSuccessful === 'boolean') return response.IsSuccessful;
    if (typeof response.isSuccessful === 'boolean') return response.isSuccessful;
    return false;
};

const getErrorMessages = (response: SignupResponseBase): string[] => {
    const allMessages: string[] = [];

    if (Array.isArray(response.ErrorMessages)) {
        allMessages.push(...response.ErrorMessages.filter(Boolean));
    }

    if (Array.isArray(response.errorMessages)) {
        allMessages.push(...response.errorMessages.filter(Boolean));
    }

    const problems = response.Problems ?? response.problems;
    if (Array.isArray(problems)) {
        allMessages.push(
            ...problems
                .map((problem) => {
                    if (!problem || typeof problem !== 'object') return '';

                    const candidate = problem as {
                        message?: unknown;
                        Message?: unknown;
                        detail?: unknown;
                        Detail?: unknown;
                    };

                    if (typeof candidate.message === 'string' && candidate.message.trim().length > 0) {
                        return candidate.message;
                    }

                    if (typeof candidate.Message === 'string' && candidate.Message.trim().length > 0) {
                        return candidate.Message;
                    }

                    if (typeof candidate.detail === 'string' && candidate.detail.trim().length > 0) {
                        return candidate.detail;
                    }

                    if (typeof candidate.Detail === 'string' && candidate.Detail.trim().length > 0) {
                        return candidate.Detail;
                    }

                    return '';
                })
                .filter(Boolean),
        );
    }

    return allMessages;
};

const assertSuccessful = (
    response: SignupResponseBase,
    fallbackCode: SignupErrorCode,
    fallbackMessage: string,
): void => {
    if (getIsSuccessful(response)) return;
    const messages = getErrorMessages(response);
    throw new SignupError(fallbackCode, messages[0] || fallbackMessage);
};

const getCustomerId = (response: CustomerFromTemplateResponse): string => {
    const customerId = response.Customer?.CustomerId ?? response.customer?.customerId;
    if (!customerId) {
        throw new SignupError(
            'customerCreateFailed',
            'Customer creation succeeded but customer ID was missing in response.',
        );
    }
    return customerId;
};

const getUserId = (response: CustomerUserCreateResponse): string => {
    const userId = response.User?.UserId ?? response.user?.userId;
    if (!userId) {
        throw new SignupError(
            'customerUserCreateFailed',
            'User creation succeeded but user ID was missing in response.',
        );
    }
    return userId;
};

const resolveNotaryNodes = (): NotaryNode[] => {
    if (API_CONFIG.SIGNUP.NOTARY_NODES.length > 0) {
        return API_CONFIG.SIGNUP.NOTARY_NODES;
    }

    return [
        {
            branchId: '',
            name: 'Default Notary Node',
            countryCode: API_CONFIG.SIGNUP.DEFAULT_COUNTRY_CODE,
            isDefault: true,
        },
    ];
};

const getDefaultNotaryNode = (notaryNodes: NotaryNode[]): NotaryNode => {
    return notaryNodes.find((node) => node.isDefault) ?? notaryNodes[0];
};

const authenticateBankUser = async (): Promise<{
    bankToken: string;
    passwordRegEx?: string;
    passwordRegExMessage?: string;
}> => {
    const { BANK_USERNAME, BANK_PASSWORD } = API_CONFIG.SIGNUP;

    if (!BANK_USERNAME || !BANK_PASSWORD) {
        throw new SignupError(
            'missingBankCredentials',
            'Bank user credentials are missing. Set VITE_BANK_USERNAME and VITE_BANK_PASSWORD in .env.',
        );
    }

    let authResponse;
    try {
        authResponse = await authService.login(BANK_USERNAME, BANK_PASSWORD);
    } catch (error) {
        throw new SignupError('bankAuthFailed', error instanceof Error ? error.message : 'Bank auth failed');
    }

    const bankToken = authResponse.tokens?.accessToken;
    if (!bankToken) {
        throw new SignupError('bankAuthFailed', 'Bank user authentication failed: missing access token in response.');
    }

    return {
        bankToken,
        passwordRegEx: authResponse.userSettings?.passwordRegEx,
        passwordRegExMessage: authResponse.userSettings?.passwordRegExMessage,
    };
};

const getAuthHeaders = (accessToken: string) => ({
    Authorization: `Bearer ${accessToken}`,
});

const checkUsernameAvailability = async (username: string, bankToken: string): Promise<void> => {
    const response = await apiClient.get<UsernameExistsResponse>(
        `${API_CONFIG.ENDPOINTS.USER.DOES_USERNAME_EXIST}/${encodeURIComponent(username)}`,
        {
            headers: getAuthHeaders(bankToken),
        },
    );

    const hasSuccessFlag =
        typeof response.data.IsSuccessful === 'boolean' || typeof response.data.isSuccessful === 'boolean';

    if (hasSuccessFlag) {
        assertSuccessful(response.data, 'usernameExists', 'Unable to validate username availability.');
    } else {
        const messages = getErrorMessages(response.data);
        if (messages.length > 0) {
            throw new SignupError('usernameExists', messages[0]);
        }
    }

    const exists = response.data.Exists ?? response.data.exists ?? false;
    if (exists) {
        throw new SignupError('usernameExists', 'Username already exists. Please choose a different username.');
    }
};

const createCustomer = async (
    payload: CustomerFromTemplateRequest,
    bankToken: string,
): Promise<string> => {
    const response = await apiClient.post<CustomerFromTemplateResponse>(
        API_CONFIG.ENDPOINTS.CUSTOMER.FROM_TEMPLATE,
        payload,
        {
            headers: getAuthHeaders(bankToken),
        },
    );

    assertSuccessful(response.data, 'customerCreateFailed', 'Failed to create customer profile.');
    return getCustomerId(response.data);
};

const createCustomerUser = async (
    payload: CustomerUserCreateRequest,
    bankToken: string,
): Promise<string> => {
    const response = await apiClient.post<CustomerUserCreateResponse>(
        API_CONFIG.ENDPOINTS.CUSTOMER.USER,
        payload,
        {
            headers: getAuthHeaders(bankToken),
        },
    );

    assertSuccessful(response.data, 'customerUserCreateFailed', 'Failed to create customer user.');
    return getUserId(response.data);
};

const linkAccessRights = async (
    payload: AccessRightTemplateLinkRequest,
    bankToken: string,
): Promise<void> => {
    const response = await apiClient.patch<SignupResponseBase>(
        API_CONFIG.ENDPOINTS.USER.LINK_ACCESS_RIGHT_TEMPLATE,
        payload,
        {
            headers: getAuthHeaders(bankToken),
        },
    );

    assertSuccessful(response.data, 'accessRightsLinkFailed', 'Failed to assign access rights.');
};

export const signupService = {
    async loadSignupFormConfig(): Promise<SignupFormConfig> {
        const notaryNodes = resolveNotaryNodes();
        try {
            const authContext = await authenticateBankUser();

            return {
                passwordRegEx: authContext.passwordRegEx,
                passwordRegExMessage: authContext.passwordRegExMessage,
                isReferredByRequired: API_CONFIG.SIGNUP.IS_REFERRED_BY_REQUIRED,
                notaryNodes,
            };
        } catch (error) {
            console.warn('Signup config fallback activated:', error);
            return {
                isReferredByRequired: API_CONFIG.SIGNUP.IS_REFERRED_BY_REQUIRED,
                notaryNodes,
            };
        }
    },

    async register(request: SignupFormData): Promise<SignupResult> {
        const notaryNodes = resolveNotaryNodes();
        const defaultNode = getDefaultNotaryNode(notaryNodes);
        const selectedNode =
            notaryNodes.find((node) => node.branchId === request.notaryNodeBranchId) ?? defaultNode;

        const { bankToken } = await authenticateBankUser();

        await checkUsernameAvailability(request.username, bankToken);

        const emailToUse = request.email.trim() || API_CONFIG.SIGNUP.DEFAULT_REGISTERING_EMAIL;

        const customerId = await createCustomer(
            {
                BranchId: selectedNode.branchId,
                AccountRepresentativeId: API_CONFIG.SIGNUP.ACCOUNT_REPRESENTATIVE_ID,
                CustomerTemplateId: API_CONFIG.SIGNUP.CUSTOMER_TEMPLATE_ID,
                CustomerTypeId: 1,
                FirstName: request.firstName.trim(),
                LastName: request.lastName.trim(),
                Email: emailToUse,
                CellPhone: request.cellphone.trim(),
                CountryCode: selectedNode.countryCode || API_CONFIG.SIGNUP.DEFAULT_COUNTRY_CODE,
                ReferredByPlatform: API_CONFIG.SIGNUP.REFERRED_BY_PLATFORM,
                ReferredByName: request.referredBy.trim(),
                CustomerName: '',
                MiddleName: '',
                MailingAddressLine1: '',
                MailingAddressLine2: '',
                MailingAddressLine3: '',
                MailingAddressCity: '',
                MailingAddressStateProvince: '',
                MailingAddressCountryCode: '',
                MailingAddressZipCode: '',
            },
            bankToken,
        );

        const userId = await createCustomerUser(
            {
                CustomerId: customerId,
                UserName: request.username.trim(),
                Password: request.password,
                EmailAddress: emailToUse,
                FirstName: request.firstName.trim(),
                LastName: request.lastName.trim(),
                IsApproved: true,
                UserMustChangePassword: false,
                EmailPasswordToUser: false,
                WKYCId: '',
            },
            bankToken,
        );

        await linkAccessRights(
            {
                UserId: userId,
                AccessRightTemplateId: API_CONFIG.SIGNUP.ACCESS_RIGHT_TEMPLATE_ID,
            },
            bankToken,
        );

        return {
            redirectUrl: API_CONFIG.SIGNUP.AFTER_SIGNUP_URL || '/login',
            message: 'Account successfully created.',
        };
    },
};
