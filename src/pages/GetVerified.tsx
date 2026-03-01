import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth.ts';
import { useLanguage } from '../hooks/useLanguage.ts';
import {
    verificationService,
    fileToBase64,
    buildIdDescription,
    appendVerificationMetadata,
    mapOcrToFormData,
    mergeOcrProperties,
    detectWizardStep,
    parseDescriptionProperties,
} from '../api/verification.service.ts';
import { FileAttachmentTypeId } from '../types/verification.types.ts';
import type {
    CountryInfo,
    CountryIdentificationType,
    CustomerGetData,
    FileAttachmentInfoItem,
    VerificationFormData,
    WizardStep,
} from '../types/verification.types.ts';
import '../styles/get-verified.css';

/** Resolve a value that might be a country name OR a country code to a valid code */
const resolveCountryCode = (value: string, countries: CountryInfo[]): string => {
    if (!value) return '';
    // Already a valid code?
    const byCode = countries.find((c) => (c.CountryCode ?? c.countryCode ?? '') === value);
    if (byCode) return value;
    // Match by name (case-insensitive)
    const upper = value.toUpperCase();
    const byName = countries.find((c) => {
        const name = (c.CountryName ?? c.countryName ?? '').toUpperCase();
        return name === upper;
    });
    if (byName) return byName.CountryCode ?? byName.countryCode ?? '';
    return value; // return as-is if no match
};

const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];
const ACCEPTED_EXT = ['.jpg', '.jpeg', '.png'];

const isValidImageFile = (file: File): boolean => {
    if (!ACCEPTED_TYPES.includes(file.type)) return false;
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    return ACCEPTED_EXT.includes(ext);
};

const emptyFormData: VerificationFormData = {
    countryOfIssuance: '',
    idType: '',
    idNumber: '',
    firstName: '',
    middleName: '',
    lastName: '',
    nationality: '',
    dateOfBirth: '',
    placeOfBirth: '',
    genderTypeId: 0,
    issuerName: '',
    issuanceDate: '',
    expirationDate: '',
};

export const GetVerified: React.FC = () => {
    const { user } = useAuth();
    const { t } = useLanguage();

    // Wizard state
    const [step, setStep] = useState<WizardStep>(1);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [alreadyVerified, setAlreadyVerified] = useState(false);

    // Reference data
    const [countries, setCountries] = useState<CountryInfo[]>([]);
    const [idTypes, setIdTypes] = useState<CountryIdentificationType[]>([]);
    const [customer, setCustomer] = useState<CustomerGetData | null>(null);
    const [, setAttachments] = useState<FileAttachmentInfoItem[]>([]);

    // Step 1 state
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedIdType, setSelectedIdType] = useState<CountryIdentificationType | null>(null);
    const [frontFile, setFrontFile] = useState<File | null>(null);
    const [backFile, setBackFile] = useState<File | null>(null);

    // Step 2 state
    const [selfieFile, setSelfieFile] = useState<File | null>(null);

    // Step 3 review state
    const [formData, setFormData] = useState<VerificationFormData>(emptyFormData);

    // Step 4 confirmation state
    const [vlinkId, setVlinkId] = useState('');
    const [vlinkReference, setVlinkReference] = useState('');
    const [frontAttachmentId, setFrontAttachmentId] = useState('');

    // OCR properties from upload
    const [, setOcrProperties] = useState<Record<string, string>>({});

    const customerId = user?.organizationId ?? '';

    // ── Initialize: load customer, countries, attachments ──
    const initialize = useCallback(async () => {
        if (!customerId) return;
        setLoading(true);
        setError(null);

        try {
            const [customerData, countryList, attachmentList] = await Promise.all([
                verificationService.getCustomer(customerId),
                verificationService.getCountryList(),
                verificationService.getFileAttachmentInfoList(customerId),
            ]);

            setCustomer(customerData);
            setCountries(countryList);
            setAttachments(attachmentList);

            // Check if already verified
            if (customerData.WKYCLevel >= 2) {
                setAlreadyVerified(true);
                setLoading(false);
                return;
            }

            // Detect current wizard step
            const detectedStep = detectWizardStep(attachmentList);
            setStep(detectedStep);

            // If we have a front file, extract its data for the review form
            const frontAtt = attachmentList.find(
                (a) => (a.FileAttachmentTypeId ?? a.fileAttachmentTypeId) === FileAttachmentTypeId.ProofOfIdentityFront,
            );
            if (frontAtt) {
                setFrontAttachmentId(frontAtt.FileAttachmentId);

                // Extract from OCR Properties
                const props = frontAtt.Properties ?? frontAtt.properties;
                if (props) {
                    setOcrProperties(props);
                    const mapped = mapOcrToFormData(props);
                    // Resolve country name→code before setting
                    if (mapped.countryOfIssuance) {
                        mapped.countryOfIssuance = resolveCountryCode(mapped.countryOfIssuance, countryList);
                    }
                    if (mapped.nationality) {
                        mapped.nationality = resolveCountryCode(mapped.nationality, countryList);
                    }
                    setFormData((prev) => ({ ...prev, ...mapped }));
                }

                // Also extract from Description string (has country_of_issuance, id_type, etc.)
                const desc = frontAtt.Description ?? frontAtt.description ?? '';
                if (desc) {
                    const descProps = parseDescriptionProperties(desc);
                    console.log('[Init] Front file description properties:', descProps);
                    setFormData((prev) => ({
                        ...prev,
                        countryOfIssuance: prev.countryOfIssuance || resolveCountryCode(descProps['country_of_issuance'] || '', countryList),
                        idType: prev.idType || descProps['id_type'] || '',
                        idNumber: prev.idNumber || descProps['account/id_number'] || '',
                        issuerName: prev.issuerName || descProps['issuer_name'] || '',
                        issuanceDate: prev.issuanceDate || descProps['issuance_date'] || '',
                        expirationDate: prev.expirationDate || descProps['expiry_date'] || '',
                    }));
                }
            }

            // Pre-populate form from customer data
            const custCountry = resolveCountryCode(customerData.IdentificationCountryCode || '', countryList);
            const custNationality = resolveCountryCode(customerData.Nationality || '', countryList);
            setFormData((prev) => ({
                ...prev,
                firstName: prev.firstName || customerData.CustomerFirstName || '',
                middleName: prev.middleName || customerData.CustomerMiddleName || '',
                lastName: prev.lastName || customerData.CustomerLastName || '',
                nationality: prev.nationality || custNationality,
                dateOfBirth: prev.dateOfBirth || customerData.DateOfBirth || '',
                placeOfBirth: prev.placeOfBirth || customerData.CityOfBirth || '',
                genderTypeId: prev.genderTypeId || customerData.GenderTypeId || 0,
                countryOfIssuance: prev.countryOfIssuance || custCountry,
            }));
            console.log('[Init] Customer data:', JSON.stringify(customerData, null, 2));
            console.log('[Init] Detected step:', detectedStep, 'Front attachment ID:', frontAtt?.FileAttachmentId);

            // If step 4 (already submitted), extract vlink info from description
            if (detectedStep === 4 && frontAtt) {
                const desc = frontAtt.Description ?? frontAtt.description ?? '';
                const descProps = parseDescriptionForVLink(desc);
                if (descProps.vlinkId) setVlinkId(descProps.vlinkId);
                if (descProps.vlinkReference) setVlinkReference(descProps.vlinkReference);
            }
        } catch (err) {
            console.error('Initialization error:', err);
            setError(err instanceof Error ? err.message : t('verification.loadError'));
        } finally {
            setLoading(false);
        }
    }, [customerId, t]);

    useEffect(() => {
        initialize();
    }, [initialize]);

    // ── Load ID types when country changes ──
    useEffect(() => {
        if (!selectedCountry) {
            setIdTypes([]);
            return;
        }
        const loadIdTypes = async () => {
            try {
                const types = await verificationService.getIdTypes(selectedCountry);
                setIdTypes(types);
                setSelectedIdType(null);
            } catch (err) {
                console.error('Failed to load ID types:', err);
                setIdTypes([]);
            }
        };
        loadIdTypes();
    }, [selectedCountry]);

    // ── Step 1: Upload ID Documents ──
    const handleStep1Upload = async () => {
        if (!frontFile || !selectedCountry || !selectedIdType) return;
        setProcessing(true);
        setError(null);

        try {
            const frontBase64 = await fileToBase64(frontFile);

            // Upload front file
            const frontResult = await verificationService.uploadFile({
                ParentObjectId: customerId,
                ParentObjectTypeId: 21,
                SourceIP: '',
                FileAttachmentTypeId: FileAttachmentTypeId.ProofOfIdentityFront,
                FileAttachmentSubTypeId: 0,
                SumSubTypeId: selectedIdType.CountryIdentificationTypeID,
                FileName: frontFile.name,
                GroupName: '',
                Properties: null,
                IsPrimary: true,
                ContainsFront: true,
                ContainsBack: false,
                ViewableByBanker: true,
                ViewableByCustomer: true,
                DeletableByCustomer: false,
                Description: 'documentType: Proof of Identity',
                BypassFileAnalysis: false,
                FileData: frontBase64,
            });

            setFrontAttachmentId(frontResult.FileAttachmentId);
            let mergedProps = frontResult.Properties ?? {};

            // Upload back file if required
            if (selectedIdType.RequireBackSide && backFile) {
                const backBase64 = await fileToBase64(backFile);
                const backResult = await verificationService.uploadFile({
                    ParentObjectId: customerId,
                    ParentObjectTypeId: 21,
                    SourceIP: '',
                    FileAttachmentTypeId: FileAttachmentTypeId.ProofOfIdentityBack,
                    FileAttachmentSubTypeId: 0,
                    SumSubTypeId: selectedIdType.CountryIdentificationTypeID,
                    FileName: backFile.name,
                    GroupName: '',
                    Properties: null,
                    IsPrimary: true,
                    ContainsFront: false,
                    ContainsBack: true,
                    ViewableByBanker: true,
                    ViewableByCustomer: true,
                    DeletableByCustomer: false,
                    Description: 'documentType: Proof of Identity',
                    BypassFileAnalysis: false,
                    FileData: backBase64,
                });

                mergedProps = mergeOcrProperties(frontResult.Properties, backResult.Properties);
            }

            setOcrProperties(mergedProps);

            // Map OCR to form data
            const mapped = mapOcrToFormData(mergedProps);
            setFormData((prev) => ({
                ...prev,
                ...mapped,
                countryOfIssuance: mapped.countryOfIssuance || selectedCountry,
                idType: mapped.idType || selectedIdType.CountryIdentificationTypeEnglishName,
            }));

            // Update customer with OCR extracted data (uses bank token)
            if (Object.keys(mapped).length > 0) {
                try {
                    await verificationService.updateCustomer({
                        CustomerId: customerId,
                        FirstName: mapped.firstName || customer?.CustomerFirstName || '',
                        MiddleName: mapped.middleName || customer?.CustomerMiddleName || '',
                        LastName: mapped.lastName || customer?.CustomerLastName || '',
                        Nationality: mapped.nationality || customer?.Nationality || '',
                        GenderTypeId: mapped.genderTypeId ?? customer?.GenderTypeId ?? 0,
                        DateOfBirth: mapped.dateOfBirth || customer?.DateOfBirth || null,
                        CityOfBirth: mapped.placeOfBirth || customer?.CityOfBirth || '',
                        CountryOfBirthCode: customer?.CountryOfBirthCode || '',
                        CountryCode: mapped.countryOfIssuance || customer?.CountryCode || '',
                        IdentificationTypeId: selectedIdType.IdentificationTypeID,
                        IdentificationNumber: mapped.idNumber || '',
                        IdentificationIssuer: mapped.issuerName || '',
                        IdentificationCountryCode: mapped.countryOfIssuance || selectedCountry,
                        IdentificationExpirationDate: mapped.expirationDate || null,
                    });
                } catch (err) {
                    console.warn('Customer update with OCR data failed (non-blocking):', err);
                }
            }

            // Update front file description with ID metadata
            const descData: VerificationFormData = {
                ...emptyFormData,
                ...mapped,
                countryOfIssuance: mapped.countryOfIssuance || selectedCountry,
                idType: mapped.idType || selectedIdType.CountryIdentificationTypeEnglishName,
            };
            await verificationService.updateFileAttachment({
                FileAttachmentId: frontResult.FileAttachmentId,
                GroupName: '',
                FileAttachmentTypeId: FileAttachmentTypeId.ProofOfIdentityFront,
                ViewableByBanker: true,
                ViewableByCustomer: true,
                DeletableByCustomer: false,
                Description: buildIdDescription(descData),
            });

            // Pre-fill form with customer + OCR data for step 3
            setFormData((prev) => ({
                ...prev,
                firstName: mapped.firstName || customer?.CustomerFirstName || prev.firstName,
                middleName: mapped.middleName || customer?.CustomerMiddleName || prev.middleName,
                lastName: mapped.lastName || customer?.CustomerLastName || prev.lastName,
                nationality: mapped.nationality || customer?.Nationality || prev.nationality,
                dateOfBirth: mapped.dateOfBirth || customer?.DateOfBirth || prev.dateOfBirth,
                placeOfBirth: mapped.placeOfBirth || customer?.CityOfBirth || prev.placeOfBirth,
                genderTypeId: mapped.genderTypeId ?? customer?.GenderTypeId ?? prev.genderTypeId,
            }));

            setStep(2);
        } catch (err) {
            console.error('Step 1 upload error:', err);
            setError(err instanceof Error ? err.message : t('verification.uploadIdError'));
        } finally {
            setProcessing(false);
        }
    };

    // ── Step 2: Upload Selfie ──
    const handleStep2Upload = async () => {
        if (!selfieFile) return;
        setProcessing(true);
        setError(null);

        try {
            const selfieBase64 = await fileToBase64(selfieFile);
            await verificationService.uploadFile({
                ParentObjectId: customerId,
                ParentObjectTypeId: 21,
                SourceIP: '',
                FileAttachmentTypeId: FileAttachmentTypeId.SelfiePhoto,
                FileAttachmentSubTypeId: 0,
                SumSubTypeId: 0,
                FileName: selfieFile.name,
                GroupName: '',
                Properties: null,
                IsPrimary: true,
                ContainsFront: false,
                ContainsBack: false,
                ViewableByBanker: true,
                ViewableByCustomer: true,
                DeletableByCustomer: false,
                Description: 'documentType: Selfie',
                BypassFileAnalysis: true,
                FileData: selfieBase64,
            });

            setStep(3);
        } catch (err) {
            console.error('Step 2 upload error:', err);
            setError(err instanceof Error ? err.message : t('verification.uploadSelfieError'));
        } finally {
            setProcessing(false);
        }
    };

    // ── Step 3: Submit Verification ──
    const handleStep3Submit = async () => {
        if (!isStep3Valid()) return;
        setProcessing(true);
        setError(null);

        try {
            // 1. Update front file description with corrected metadata
            const updateAttachmentReq1 = {
                FileAttachmentId: frontAttachmentId,
                GroupName: '',
                FileAttachmentTypeId: FileAttachmentTypeId.ProofOfIdentityFront,
                ViewableByBanker: true,
                ViewableByCustomer: true,
                DeletableByCustomer: false,
                Description: buildIdDescription(formData),
            };
            console.log('[Step3] 1/5 updateFileAttachment request:', JSON.stringify(updateAttachmentReq1, null, 2));
            await verificationService.updateFileAttachment(updateAttachmentReq1);
            console.log('[Step3] 1/5 updateFileAttachment OK');

            // 2. Update customer with corrected profile data (bank token)
            const identTypeId = selectedIdType?.IdentificationTypeID ?? customer?.IdentificationTypeId ?? 0;
            const countryOfBirthCode = formData.nationality || customer?.CountryOfBirthCode || formData.countryOfIssuance;
            const updateCustomerReq = {
                CustomerId: customerId,
                FirstName: formData.firstName,
                MiddleName: formData.middleName,
                LastName: formData.lastName,
                Nationality: formData.nationality,
                GenderTypeId: formData.genderTypeId,
                DateOfBirth: formData.dateOfBirth || null,
                CityOfBirth: formData.placeOfBirth,
                CountryOfBirthCode: countryOfBirthCode,
                CountryCode: formData.countryOfIssuance,
                IdentificationTypeId: identTypeId,
                IdentificationNumber: formData.idNumber,
                IdentificationIssuer: formData.issuerName,
                IdentificationCountryCode: formData.countryOfIssuance,
                IdentificationExpirationDate: formData.expirationDate || null,
            };
            console.log('[Step3] 2/5 updateCustomer request:', JSON.stringify(updateCustomerReq, null, 2));
            await verificationService.updateCustomer(updateCustomerReq);
            console.log('[Step3] 2/5 updateCustomer OK');

            // 3. Create VLink
            const customerName = `${formData.firstName} ${formData.lastName}`.trim();
            const createVlinkReq = {
                VerifiedLinkTypeId: 3,
                VerifiedLinkName: customerName,
                CustomerId: customerId,
                GroupName: '',
                MinimumWKYCLevel: 0,
                Message: `Identity verification request for ${customerName}`,
                PublicMessage: '',
                BlockchainMessage: '',
                SharedWithName: '',
                WebsiteUrl: '',
                VerifiedLinkUrl: '',
                VerifiedLinkShortUrl: '',
                SelectedAccountAlias: '',
                ShareAccountAlias: false,
                ShareBirthCity: true,
                ShareBirthCountry: true,
                ShareBirthDate: true,
                ShareFirstName: true,
                ShareMiddleName: true,
                ShareLastName: true,
                ShareGender: true,
                ShareNationality: true,
                ShareIdExpirationDate: true,
                ShareIdNumber: true,
                ShareIdType: true,
                ShareIdFront: true,
                ShareIdBack: true,
                ShareSelfie: true,
                IsPrimary: true,
            };
            console.log('[Step3] 3/5 createVerifiedLink request:', JSON.stringify(createVlinkReq, null, 2));
            const vlinkResult = await verificationService.createVerifiedLink(createVlinkReq);
            console.log('[Step3] 3/5 createVerifiedLink OK:', JSON.stringify(vlinkResult, null, 2));

            setVlinkId(vlinkResult.VerifiedLinkId);
            setVlinkReference(vlinkResult.VerifiedLinkReference);

            // 4. Update VLink with URL
            const verifyUrl = `${window.location.origin}/verify/${vlinkResult.VerifiedLinkId}`;
            const updateVlinkReq = {
                VerifiedLinkId: vlinkResult.VerifiedLinkId,
                VerifiedLinkTypeId: 3,
                VerifiedLinkName: customerName,
                GroupName: '',
                MinimumWKYCLevel: 0,
                Message: `Identity verification request for ${customerName}`,
                PublicMessage: '',
                BlockchainMessage: '',
                SharedWithName: '',
                WebsiteUrl: '',
                VerifiedLinkUrl: verifyUrl,
                VerifiedLinkShortUrl: verifyUrl,
                SelectedAccountAlias: '',
                AgeConfirmOver: 0,
                AgeConfirmUnder: 0,
                ShareAccountAlias: false,
                ShareBirthCity: true,
                ShareBirthCountry: true,
                ShareBirthDate: true,
                ShareFirstName: true,
                ShareMiddleName: true,
                ShareLastName: true,
                ShareGlobalFirstName: false,
                ShareGlobalMiddleName: false,
                ShareGlobalLastName: false,
                ShareGender: true,
                ShareNationality: true,
                ShareSuffix: false,
                ShareIdExpirationDate: true,
                ShareIdNumber: true,
                ShareIdType: true,
                ShareIdFront: true,
                ShareIdBack: true,
                ShareSelfie: true,
                ShareAgeConfirmOver: false,
                ShareAgeConfirmUnder: false,
                AdditionalData: '',
                IsWalletLocked: false,
                WalletAddress: '',
                TokenId: '',
                NFTReference: '',
                NFTChain: '',
                IsPrimary: true,
            };
            console.log('[Step3] 4/5 updateVerifiedLink request:', JSON.stringify(updateVlinkReq, null, 2));
            await verificationService.updateVerifiedLink(updateVlinkReq);
            console.log('[Step3] 4/5 updateVerifiedLink OK');

            // 5. Append verification metadata to front file description
            const currentDescription = buildIdDescription(formData);
            const fullDescription = appendVerificationMetadata(
                currentDescription,
                user?.userId ?? '',
                user?.userName ?? '',
                `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim(),
                vlinkResult.VerifiedLinkId,
                vlinkResult.VerifiedLinkReference,
            );

            const updateAttachmentReq5 = {
                FileAttachmentId: frontAttachmentId,
                GroupName: '',
                FileAttachmentTypeId: FileAttachmentTypeId.ProofOfIdentityFront,
                ViewableByBanker: true,
                ViewableByCustomer: true,
                DeletableByCustomer: false,
                Description: fullDescription,
            };
            console.log('[Step3] 5/5 updateFileAttachment (metadata) request:', JSON.stringify(updateAttachmentReq5, null, 2));
            await verificationService.updateFileAttachment(updateAttachmentReq5);
            console.log('[Step3] 5/5 updateFileAttachment (metadata) OK');

            setStep(4);
        } catch (err) {
            const axiosErr = err as { response?: { status?: number; data?: unknown } };
            console.error('[Step3] FAILED:', err);
            if (axiosErr.response) {
                console.error('[Step3] Response status:', axiosErr.response.status);
                console.error('[Step3] Response data:', JSON.stringify(axiosErr.response.data, null, 2));
            }
            const serverMsg = axiosErr.response?.data
                ? (typeof axiosErr.response.data === 'object'
                    ? ((axiosErr.response.data as Record<string, unknown>).Message ?? (axiosErr.response.data as Record<string, unknown>).message) as string | undefined
                    : undefined)
                : undefined;
            setError(serverMsg || (err instanceof Error ? err.message : t('verification.submitError')));
        } finally {
            setProcessing(false);
        }
    };

    // ── Validation ──
    const isStep1Valid = (): boolean =>
        !!selectedCountry &&
        !!selectedIdType &&
        !!frontFile &&
        (!selectedIdType.RequireBackSide || !!backFile);

    const isStep3Valid = (): boolean =>
        !!formData.countryOfIssuance &&
        !!formData.idType &&
        !!formData.idNumber &&
        !!formData.firstName &&
        !!formData.lastName &&
        !!formData.nationality &&
        !!formData.dateOfBirth &&
        !!formData.placeOfBirth &&
        formData.genderTypeId >= 1 &&
        !!formData.issuerName &&
        !!formData.issuanceDate &&
        !!formData.expirationDate;

    const handleFormChange = (field: keyof VerificationFormData, value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleFileSelect = (
        setter: React.Dispatch<React.SetStateAction<File | null>>,
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!isValidImageFile(file)) {
            setError(t('verification.invalidFileType'));
            return;
        }
        setError(null);
        setter(file);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).catch(() => {});
    };

    // ── Loading state ──
    if (loading) {
        return (
            <div className="get-verified-page">
                <div className="gv-loading">
                    <div className="spinner" />
                    <p>{t('verification.loading')}</p>
                </div>
            </div>
        );
    }

    // ── Already verified ──
    if (alreadyVerified) {
        return (
            <div className="get-verified-page">
                <div className="gv-card gv-verified">
                    <div className="gv-verified-icon">&#x2705;</div>
                    <h2>{t('verification.alreadyVerifiedTitle')}</h2>
                    <p>{t('verification.alreadyVerifiedMessage')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="get-verified-page">
            <h1 className="gv-title">{t('verification.title')}</h1>

            {/* Step indicator */}
            <div className="gv-steps">
                {[1, 2, 3, 4].map((s) => (
                    <div
                        key={s}
                        className={`gv-step-indicator ${s === step ? 'active' : ''} ${s < step ? 'completed' : ''}`}
                    >
                        <span className="gv-step-number">{s < step ? '\u2713' : s}</span>
                        <span className="gv-step-label">{t(`verification.step${s}Label`)}</span>
                    </div>
                ))}
            </div>

            {error && (
                <div className="gv-error">
                    <p>{error}</p>
                </div>
            )}

            {/* ── Step 1: Upload ID Documents ── */}
            {step === 1 && (
                <div className="gv-card">
                    <h2>{t('verification.step1Title')}</h2>
                    <p className="gv-hint">{t('verification.step1Hint')}</p>

                    <div className="gv-form-group">
                        <label>{t('verification.countryOfIssuance')}</label>
                        <select
                            value={selectedCountry}
                            onChange={(e) => setSelectedCountry(e.target.value)}
                        >
                            <option value="">{t('verification.selectCountry')}</option>
                            {countries.map((c) => {
                                const code = c.CountryCode ?? c.countryCode ?? '';
                                const name = c.CountryName ?? c.countryName ?? code;
                                return (
                                    <option key={code} value={code}>
                                        {name}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    {selectedCountry && (
                        <div className="gv-form-group">
                            <label>{t('verification.idType')}</label>
                            <select
                                value={selectedIdType?.CountryIdentificationTypeID ?? ''}
                                onChange={(e) => {
                                    const id = parseInt(e.target.value, 10);
                                    setSelectedIdType(idTypes.find((t) => t.CountryIdentificationTypeID === id) ?? null);
                                    setBackFile(null);
                                }}
                            >
                                <option value="">{t('verification.selectIdType')}</option>
                                {idTypes.map((idt) => (
                                    <option key={idt.CountryIdentificationTypeID} value={idt.CountryIdentificationTypeID}>
                                        {idt.CountryIdentificationTypeEnglishName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {selectedIdType && (
                        <>
                            <div className="gv-form-group">
                                <label>{t('verification.frontFile')}</label>
                                <div className="gv-file-input">
                                    <input
                                        type="file"
                                        accept=".jpg,.jpeg,.png"
                                        onChange={(e) => handleFileSelect(setFrontFile, e)}
                                    />
                                    {frontFile && <span className="gv-file-name">{frontFile.name}</span>}
                                </div>
                            </div>

                            {selectedIdType.RequireBackSide && (
                                <div className="gv-form-group">
                                    <label>{t('verification.backFile')}</label>
                                    <div className="gv-file-input">
                                        <input
                                            type="file"
                                            accept=".jpg,.jpeg,.png"
                                            onChange={(e) => handleFileSelect(setBackFile, e)}
                                        />
                                        {backFile && <span className="gv-file-name">{backFile.name}</span>}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <div className="gv-actions">
                        <button
                            className="primary-btn"
                            disabled={!isStep1Valid() || processing}
                            onClick={handleStep1Upload}
                        >
                            {processing ? (
                                <><div className="spinner spinner-sm" /> {t('verification.uploading')}</>
                            ) : (
                                t('verification.uploadDocuments')
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* ── Step 2: Upload Selfie ── */}
            {step === 2 && (
                <div className="gv-card">
                    <h2>{t('verification.step2Title')}</h2>
                    <p className="gv-hint">{t('verification.step2Hint')}</p>

                    <div className="gv-form-group">
                        <label>{t('verification.selfieFile')}</label>
                        <div className="gv-file-input">
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png"
                                onChange={(e) => handleFileSelect(setSelfieFile, e)}
                            />
                            {selfieFile && <span className="gv-file-name">{selfieFile.name}</span>}
                        </div>
                    </div>

                    <div className="gv-actions">
                        <button
                            className="primary-btn"
                            disabled={!selfieFile || processing}
                            onClick={handleStep2Upload}
                        >
                            {processing ? (
                                <><div className="spinner spinner-sm" /> {t('verification.uploading')}</>
                            ) : (
                                t('verification.uploadSelfie')
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* ── Step 3: Review & Submit ── */}
            {step === 3 && (
                <div className="gv-card">
                    <h2>{t('verification.step3Title')}</h2>
                    <p className="gv-hint">{t('verification.step3Hint')}</p>

                    <div className="gv-review-form">
                        <div className="gv-form-row">
                            <div className="gv-form-group">
                                <label>{t('verification.countryOfIssuance')}</label>
                                <select
                                    value={formData.countryOfIssuance}
                                    onChange={(e) => handleFormChange('countryOfIssuance', e.target.value)}
                                >
                                    <option value="">{t('verification.selectCountry')}</option>
                                    {countries.map((c) => {
                                        const code = c.CountryCode ?? c.countryCode ?? '';
                                        const name = c.CountryName ?? c.countryName ?? code;
                                        return (
                                            <option key={code} value={code}>{name}</option>
                                        );
                                    })}
                                </select>
                            </div>
                            <div className="gv-form-group">
                                <label>{t('verification.idType')}</label>
                                <input
                                    type="text"
                                    value={formData.idType}
                                    onChange={(e) => handleFormChange('idType', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="gv-form-row">
                            <div className="gv-form-group">
                                <label>{t('verification.idNumber')}</label>
                                <input
                                    type="text"
                                    value={formData.idNumber}
                                    onChange={(e) => handleFormChange('idNumber', e.target.value)}
                                />
                            </div>
                            <div className="gv-form-group">
                                <label>{t('verification.issuerName')}</label>
                                <input
                                    type="text"
                                    value={formData.issuerName}
                                    onChange={(e) => handleFormChange('issuerName', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="gv-form-row">
                            <div className="gv-form-group">
                                <label>{t('verification.firstName')}</label>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => handleFormChange('firstName', e.target.value)}
                                />
                            </div>
                            <div className="gv-form-group">
                                <label>{t('verification.middleName')}</label>
                                <input
                                    type="text"
                                    value={formData.middleName}
                                    onChange={(e) => handleFormChange('middleName', e.target.value)}
                                />
                            </div>
                            <div className="gv-form-group">
                                <label>{t('verification.lastName')}</label>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => handleFormChange('lastName', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="gv-form-row">
                            <div className="gv-form-group">
                                <label>{t('verification.nationality')}</label>
                                <select
                                    value={formData.nationality}
                                    onChange={(e) => handleFormChange('nationality', e.target.value)}
                                >
                                    <option value="">{t('verification.selectCountry')}</option>
                                    {countries.map((c) => {
                                        const code = c.CountryCode ?? c.countryCode ?? '';
                                        const name = c.CountryName ?? c.countryName ?? code;
                                        return (
                                            <option key={code} value={code}>{name}</option>
                                        );
                                    })}
                                </select>
                            </div>
                            <div className="gv-form-group">
                                <label>{t('verification.dateOfBirth')}</label>
                                <input
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => handleFormChange('dateOfBirth', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="gv-form-row">
                            <div className="gv-form-group">
                                <label>{t('verification.placeOfBirth')}</label>
                                <input
                                    type="text"
                                    value={formData.placeOfBirth}
                                    onChange={(e) => handleFormChange('placeOfBirth', e.target.value)}
                                />
                            </div>
                            <div className="gv-form-group">
                                <label>{t('verification.gender')}</label>
                                <select
                                    value={formData.genderTypeId}
                                    onChange={(e) => handleFormChange('genderTypeId', parseInt(e.target.value, 10))}
                                >
                                    <option value={0}>{t('verification.genderNA')}</option>
                                    <option value={1}>{t('verification.genderMale')}</option>
                                    <option value={2}>{t('verification.genderFemale')}</option>
                                </select>
                            </div>
                        </div>

                        <div className="gv-form-row">
                            <div className="gv-form-group">
                                <label>{t('verification.issuanceDate')}</label>
                                <input
                                    type="date"
                                    value={formData.issuanceDate}
                                    onChange={(e) => handleFormChange('issuanceDate', e.target.value)}
                                />
                            </div>
                            <div className="gv-form-group">
                                <label>{t('verification.expirationDate')}</label>
                                <input
                                    type="date"
                                    value={formData.expirationDate}
                                    onChange={(e) => handleFormChange('expirationDate', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="gv-actions">
                        <button
                            className="primary-btn"
                            disabled={!isStep3Valid() || processing}
                            onClick={handleStep3Submit}
                        >
                            {processing ? (
                                <><div className="spinner spinner-sm" /> {t('verification.submitting')}</>
                            ) : (
                                t('verification.submitVerification')
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* ── Step 4: Confirmation ── */}
            {step === 4 && (
                <div className="gv-card gv-confirmation">
                    <div className="gv-success-icon">&#x2705;</div>
                    <h2>{t('verification.step4Title')}</h2>
                    <p className="gv-hint">{t('verification.step4Hint')}</p>

                    <div className="gv-confirmation-details">
                        <div className="gv-detail-row">
                            <span className="gv-detail-label">{t('verification.referenceNumber')}</span>
                            <span className="gv-detail-value">
                                {vlinkReference}
                                <button className="gv-copy-btn" onClick={() => copyToClipboard(vlinkReference)}>
                                    {t('verification.copy')}
                                </button>
                            </span>
                        </div>
                        <div className="gv-detail-row">
                            <span className="gv-detail-label">{t('verification.verificationId')}</span>
                            <span className="gv-detail-value">
                                {vlinkId}
                                <button className="gv-copy-btn" onClick={() => copyToClipboard(vlinkId)}>
                                    {t('verification.copy')}
                                </button>
                            </span>
                        </div>
                    </div>

                    <div className="gv-summary">
                        <h3>{t('verification.submittedDetails')}</h3>
                        <div className="gv-summary-grid">
                            <div><strong>{t('verification.firstName')}:</strong> {formData.firstName}</div>
                            <div><strong>{t('verification.lastName')}:</strong> {formData.lastName}</div>
                            <div><strong>{t('verification.idNumber')}:</strong> {formData.idNumber}</div>
                            <div><strong>{t('verification.nationality')}:</strong> {formData.nationality}</div>
                            <div><strong>{t('verification.dateOfBirth')}:</strong> {formData.dateOfBirth}</div>
                            <div><strong>{t('verification.expirationDate')}:</strong> {formData.expirationDate}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper to extract VLink info from description string
function parseDescriptionForVLink(description: string): { vlinkId: string; vlinkReference: string } {
    const props: Record<string, string> = {};
    const pairs = description.split(',').map((s) => s.trim());
    for (const pair of pairs) {
        const colonIdx = pair.indexOf(':');
        if (colonIdx > 0) {
            const key = pair.slice(0, colonIdx).trim();
            const value = pair.slice(colonIdx + 1).trim();
            props[key] = value;
        }
    }
    return {
        vlinkId: props['get_verified_vlink_id'] ?? '',
        vlinkReference: props['get_verified_vlink_reference'] ?? '',
    };
}
