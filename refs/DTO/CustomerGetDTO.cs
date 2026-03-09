namespace GPWebApi.DTO;

public class CustomerGetRequest
{
	public Guid CustomerId { get; set; }
}

public class CustomerGetResponse : DTOResponseBase
{
	public CustomerGetData Customer { get; set; }
}

public class CustomerGetData
{
	public Guid CustomerId { get; set; }
	public int CustomerTypeId { get; set; } = 0;
	public string CustomerTypeName { get; set; }
	public Guid BankId { get; set; }
	public Guid BranchId { get; set; }
	public string BranchName { get; set; }
	public string BranchCountryCode { get; set; }
	public string ContactName { get; set; }
	public string CustomerName { get; set; }
	public string CustomerNamePrefix { get; set; }
	public string CustomerFirstName { get; set; }
	public string CustomerMiddleName { get; set; }
	public string CustomerLastName { get; set; }
	public string CustomerNameSuffix { get; set; }
	public string GlobalCustomerName { get; set; }
	public string GlobalCustomerFirstName { get; set; }
	public string GlobalCustomerMiddleName { get; set; }
	public string GlobalCustomerLastName { get; set; }
	public string WKYCId { get; set; }
	public int WKYCLevel { get; set; }
	public int TrustScore { get; set; }
	public string CompanyName { get; set; }
	public string CompanyRegistrationNumber { get; set; }
	public string CompanyRegistrationCountryCode { get; set; }
	public string JobTitle { get; set; }
	public string Department { get; set; }
	public string ExternalReference { get; set; }
	public string LegalEntityIdentification { get; set; }
	public string AvoxId { get; set; }
	public string SWIFTAddressLine1 { get; set; }
	public string SWIFTAddressLine2 { get; set; }
	public string SWIFTAddressLine3 { get; set; }
	public string MailingAddressLine1 { get; set; }
	public string MailingAddressLine2 { get; set; }
	public string MailingDepartment { get; set; }
	public string MailingSubDepartment { get; set; }
	public string MailingStreetName { get; set; }
	public string MailingBuildingNumber { get; set; }
	public string MailingBuildingName { get; set; }
	public string MailingFloor { get; set; }
	public string MailingPostBox { get; set; }
	public string MailingRoom { get; set; }
	public string MailingCity { get; set; }
	public string MailingTownLocationName { get; set; }
	public string MailingDistrictName { get; set; }
	public string MailingStateOrProvince { get; set; }
	public string MailingPostalCode { get; set; }
	public string GlobalAddressLine1 { get; set; }
	public string GlobalAddressLine2 { get; set; }
	public string GlobalDepartment { get; set; }
	public string GlobalSubDepartment { get; set; }
	public string GlobalStreetName { get; set; }
	public string GlobalBuildingNumber { get; set; }
	public string GlobalBuildingName { get; set; }
	public string GlobalFloor { get; set; }
	public string GlobalPostBox { get; set; }
	public string GlobalRoom { get; set; }
	public string GlobalCity { get; set; }
	public string GlobalTownLocationName { get; set; }
	public string GlobalDistrictName { get; set; }
	public string GlobalStateOrProvince { get; set; }
	public string GlobalPostalCode { get; set; }
	public string CountryCode { get; set; }
	public string Phone { get; set; }
	public string CellPhone { get; set; }
	public string SMS { get; set; }
	public string Fax { get; set; }
	public string Email { get; set; }
	public string WebsiteURL { get; set; }
	public string Nationality { get; set; }
	public short GenderTypeId { get; set; }
	public string GenderTypeName { get; set; }
	public bool? IsUSPerson { get; set; } = null;
	public string CityOfBirth { get; set; }
	public string DateOfBirth { get; set; }
	public string CountryOfBirthCode { get; set; }
	public string ReferredByPlatform { get; set; }
	public string ReferredByName { get; set; }
	public int OccupationTypeId { get; set; }
	public string OccupationTypeName { get; set; }
	public string OccupationDescription { get; set; }
	public int IdentificationTypeId { get; set; }
	public string IdentificationTypeName { get; set; }
	public string IdentificationNumber { get; set; }
	public string IdentificationIssuer { get; set; }
	public string IdentificationCountryCode { get; set; }
	public string IdentificationIssuedDate { get; set; }
	public string IdentificationExpirationDate { get; set; }
	public List<IdentificationData> AttachedIds { get; set; }
	public string ElectronicDataSource { get; set; }
	public string BusinessStructureTypeCode { get; set; }
	public string BusinessStructureTypeName { get; set; }
	public string WholesaleOrRetail { get; set; }
	public bool IsCharity { get; set; } = false;
	public string ABN { get; set; }
	public string ACN { get; set; }
	public string ARBN { get; set; }
	public string TaxId { get; set; }
	public string AccountNumber { get; set; }
	public string BaseCurrencyCode { get; set; }
	public Guid? AccountRepresentativeId { get; set; }
	public string AccountRepresentativeName { get; set; }
	public bool IsEnabled { get; set; } = false;
	public bool IsApproved { get; set; } = true;
	public bool IsBank { get; set; } = false;
	public bool IsBusinessAccount { get; set; } = false;
	public bool IsCurrencyCalculatorEnabled { get; set; } = false;
	public bool IsCashIn { get; set; }
	public bool IsCashOut { get; set; }
	public bool IsWKYCVerifier { get; set; }
	public bool IsAutoCoverEnabled { get; set; } = false;
	public bool IsDualControlEnabled { get; set; } = false;
	public bool IsPaymentEnabled { get; set; } = false;
	public bool IsFXTradingEnabled { get; set; } = false;
	public bool AllowThirdPartyPayments { get; set; } = false;
	public Guid? FeeTemplateId { get; set; }
	public Guid? SettlementTypeTemplateId { get; set; }
	public Guid? FXDealTypeTemplateId { get; set; }
	public Guid? CashSpreadTemplateId { get; set; }
	public Guid? TomsSpreadTemplateId { get; set; }
	public Guid? SpotSpreadTemplateId { get; set; }
	public Guid? ForwardOutrightSpreadTemplateId { get; set; }
	public Guid? ForwardWindowSpreadTemplateId { get; set; }
	public Guid? CashCoverRateSpreadTemplateId { get; set; }
	public Guid? TomsCoverRateSpreadTemplateId { get; set; }
	public Guid? SpotCoverRateSpreadTemplateId { get; set; }
	public Guid? ForwardOutrightCoverRateSpreadTemplateId { get; set; }
	public Guid? ForwardWindowCoverRateSpreadTemplateId { get; set; }
	public Guid? IncomingPaymentSpreadTemplateId { get; set; }
	public Guid? IncomingPaymentCoverRateSpreadTemplateId { get; set; }
	public Guid? CurrencyPairAccessTemplateId { get; set; }
	public string LimitCurrencyCode { get; set; }
	public decimal FXDealLimit { get; set; }
	public decimal FXContractLimit { get; set; }
	public decimal MarginPercent { get; set; }
	public decimal MarginCallPercent { get; set; }
	public int MaximumContractLengthDays { get; set; } = 0;
	public int MaximumForwardDays { get; set; } = 0;
	public decimal InterestRate { get; set; }
	public decimal MaxOverdraftAmountPerCurrency { get; set; }
	public decimal MaxAggregateOverdraftAmount { get; set; }
	public decimal AMLRisk { get; set; }
	public string TraderNotes { get; set; }
	public string Memo { get; set; }
	public string BusinessActivity { get; set; }
	public string OnQuoteFXDealEmailNotify { get; set; }
	public string OnQuoteFXDealEmailNotifyBcc { get; set; }
	public string OnBookFXDealEmailNotify { get; set; }
	public string OnBookFXDealEmailNotifyBcc { get; set; }
	public string OnPostIncomingWireEmailNotify { get; set; }
	public string OnPostIncomingWireEmailNotifyBcc { get; set; }
	public Guid? WhiteLabelProfileId { get; set; }
	public Guid? ReferrerId { get; set; }
	public string CreatedTime { get; set; }
	public string Timestamp { get; set; }
}