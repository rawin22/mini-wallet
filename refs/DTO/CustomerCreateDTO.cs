using Swashbuckle.AspNetCore.Filters;

namespace GPWebApi.DTO;

public class CustomerCreateRequest
{
	public int CustomerTypeId { get; set; }
	public string CustomerName { get; set; } = string.Empty;
	public string CustomerNamePrefix { get; set; } = string.Empty;
	public string FirstName { get; set; } = string.Empty;
	public string MiddleName { get; set; } = string.Empty;
	public string LastName { get; set; } = string.Empty;
	public string CustomerNameSuffix { get; set; } = string.Empty;
	public string GlobalCustomerName { get; set; } = string.Empty;
	public string GlobalFirstName { get; set; } = string.Empty;
	public string GlobalMiddleName { get; set; } = string.Empty;
	public string GlobalLastName { get; set; } = string.Empty;
	public string ContactName { get; set; } = string.Empty;
	public string MailingAddressLine1 { get; set; } = string.Empty;
	public string MailingAddressLine2 { get; set; } = string.Empty;
	public string MailingDepartment { get; set; } = string.Empty;
	public string MailingSubDepartment { get; set; } = string.Empty;
	public string MailingStreetName { get; set; } = string.Empty;
	public string MailingBuildingNumber { get; set; } = string.Empty;
	public string MailingBuildingName { get; set; } = string.Empty;
	public string MailingFloor { get; set; } = string.Empty;
	public string MailingPostBox { get; set; } = string.Empty;
	public string MailingRoom { get; set; } = string.Empty;
	public string MailingCity { get; set; } = string.Empty;
	public string MailingTownLocationName { get; set; } = string.Empty;
	public string MailingDistrictName { get; set; } = string.Empty;
	public string MailingStateOrProvince { get; set; } = string.Empty;
	public string MailingPostalCode { get; set; } = string.Empty;
	public string GlobalAddressLine1 { get; set; } = string.Empty;
	public string GlobalAddressLine2 { get; set; } = string.Empty;
	public string GlobalDepartment { get; set; } = string.Empty;
	public string GlobalSubDepartment { get; set; } = string.Empty;
	public string GlobalStreetName { get; set; } = string.Empty;
	public string GlobalBuildingNumber { get; set; } = string.Empty;
	public string GlobalBuildingName { get; set; } = string.Empty;
	public string GlobalFloor { get; set; } = string.Empty;
	public string GlobalPostBox { get; set; } = string.Empty;
	public string GlobalRoom { get; set; } = string.Empty;
	public string GlobalCity { get; set; } = string.Empty;
	public string GlobalTownLocationName { get; set; } = string.Empty;
	public string GlobalDistrictName { get; set; } = string.Empty;
	public string GlobalStateOrProvince { get; set; } = string.Empty;
	public string GlobalPostalCode { get; set; } = string.Empty;
	public string CountryCode { get; set; } = string.Empty;
	public string Phone { get; set; } = string.Empty;
	public string CellPhone { get; set; } = string.Empty;
	public string SMS { get; set; } = string.Empty;
	public string Fax { get; set; } = string.Empty;
	public string WKYCId { get; set; } = string.Empty;
	public int WKYCLevel { get; set; } = 0;
	public string Email { get; set; } = string.Empty;
	public Guid BranchId { get; set; }
	public Guid AccountRepresentativeId { get; set; }
	public string AccountNumber { get; set; } = string.Empty;
	public string TaxId { get; set; } = string.Empty;
	public int OccupationTypeId { get; set; }
	public string OccupationDescription { get; set; } = string.Empty;
	public string? DateOfBirth { get; set; }
	public string CityOfBirth { get; set; } = string.Empty;
	public string CountryOfBirthCode { get; set; } = string.Empty;
	public int IdentificationTypeId { get; set; }
	public string IdentificationNumber { get; set; } = string.Empty;
	public string IdentificationIssuer { get; set; } = string.Empty;
	public string IdentificationCountryCode { get; set; } = string.Empty;
	public string? IdentificationExpirationDate { get; set; }
	public string CompanyName { get; set; } = string.Empty;
	public string CompanyRegistrationNumber { get; set; } = string.Empty;
	public string CompanyRegistrationCountryCode { get; set; } = string.Empty;
	public string JobTitle { get; set; } = string.Empty;
	public string Department { get; set; } = string.Empty;
	public string ExternalReference { get; set; } = string.Empty;
	public string LegalEntityIdentification { get; set; } = string.Empty;
	public string BusinessStructureTypeCode { get; set; } = string.Empty;
	public string WholesaleOrRetail { get; set; } = string.Empty;
	public string AvoxId { get; set; } = string.Empty;
	public decimal AMLRisk { get; set; }
	public string ABN { get; set; } = string.Empty;
	public string ACN { get; set; } = string.Empty;
	public string ARBN { get; set; } = string.Empty;
	public bool IsEnabled { get; set; }
	public bool IsApproved { get; set; } = true;
	public bool IsBank { get; set; }
	public bool IsBusinessAccount { get; set; }
	public bool IsAutoCoverEnabled { get; set; }
	public bool IsDualControlEnabled { get; set; } = false;
	public bool IsPaymentEnabled { get; set; }
	public bool IsFXTradingEnabled { get; set; }
	public bool IsCurrencyCalculatorEnabled { get; set; }
	public bool IsCashIn { get; set; }
	public bool IsCashOut { get; set; }
	public bool IsWKYCVerifier { get; set; }
	public bool AllowThirdPartyPayments { get; set; }
	public bool IsCharity { get; set; }
	public string WebsiteUrl { get; set; } = string.Empty;
	public string Nationality { get; set; } = string.Empty;
	public short GenderTypeId { get; set; }
	public bool? IsUSPerson { get; set; }
	public string ReferredByPlatform { get; set; } = string.Empty;
	public string ReferredByName { get; set; } = string.Empty;
	public string ElectronicDataSource { get; set; } = string.Empty;
	public string TraderNotes { get; set; } = string.Empty;
	public string Memo { get; set; } = string.Empty;
	public string BusinessActivity { get; set; } = string.Empty;
	public string BaseCurrencyCode { get; set; } = string.Empty;
	public string LimitCurrencyCode { get; set; } = string.Empty;
	public decimal FXDealLimit { get; set; }
	public decimal FXContractLimit { get; set; }
	public decimal MarginPercent { get; set; }
	public decimal MarginCallPercent { get; set; }
	public Guid FXDealTypeTemplateId { get; set; }
	public Guid SettlementTypeTemplateId { get; set; }
	public Guid FeeTemplateId { get; set; }
	public Guid CurrencyPairAccessTemplateId { get; set; }
	public Guid CashSpreadTemplateId { get; set; }
	public Guid TomsSpreadTemplateId { get; set; }
	public Guid SpotSpreadTemplateId { get; set; }
	public Guid ForwardOutrightSpreadTemplateId { get; set; }
	public Guid ForwardWindowSpreadTemplateId { get; set; }
	public Guid CashCoverRateSpreadTemplateId { get; set; }
	public Guid TomsCoverRateSpreadTemplateId { get; set; }
	public Guid SpotCoverRateSpreadTemplateId { get; set; }
	public Guid ForwardOutrightCoverRateSpreadTemplateId { get; set; }
	public Guid ForwardWindowCoverRateSpreadTemplateId { get; set; }
	public Guid IncomingPaymentSpreadTemplateId { get; set; }
	public Guid IncomingPaymentCoverRateSpreadTemplateId { get; set; }
	public int MaximumContractLengthDays { get; set; } = 0;
	public int MaximumForwardDays { get; set; } = 0;
	public decimal InterestRate { get; set; } = decimal.Zero;
	public decimal MaxOverdraftAmountPerCurrency { get; set; } = decimal.Zero;
	public decimal MaxAggregateOverdraftAmount { get; set; } = decimal.Zero;
	public string OnQuoteFXDealEmailNotify { get; set; } = string.Empty;
	public string OnQuoteFXDealEmailNotifyBcc { get; set; } = string.Empty;
	public string OnBookFXDealEmailNotify { get; set; } = string.Empty;
	public string OnBookFXDealEmailNotifyBcc { get; set; } = string.Empty;
	public string OnPostIncomingWireEmailNotify { get; set; } = string.Empty;
	public string OnPostIncomingWireEmailNotifyBcc { get; set; } = string.Empty;
	public Guid? WhiteLabelProfileId { get; set; }
	public Guid ReferrerId { get; set; }
	public bool IgnoreWarningsOnCreate { get; set; }
}

public class CustomerCreateResponse : DTOResponseBase
{
	public CustomerCreateData Customer { get; set; }
}

public class CustomerCreateData
{
	public Guid CustomerId { get; set; }
	public string Timestamp { get; set; }
}


