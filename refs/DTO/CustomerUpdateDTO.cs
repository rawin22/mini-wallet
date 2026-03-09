using Swashbuckle.AspNetCore.Filters;

namespace GPWebApi.DTO;

public class CustomerUpdateRequest
{
	public Guid CustomerId { get; set; }
	public int CustomerTypeId { get; set; }
	public string CustomerName { get; set; }
	public string CustomerNamePrefix { get; set; }
	public string FirstName { get; set; }
	public string MiddleName { get; set; }
	public string LastName { get; set; }
	public string CustomerNameSuffix { get; set; }
	public string GlobalCustomerName { get; set; }
	public string GlobalFirstName { get; set; }
	public string GlobalMiddleName { get; set; }
	public string GlobalLastName { get; set; }
	public string ContactName { get; set; }
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
	public string WKYCId { get; set; }
	public int WKYCLevel { get; set; } = 0;
	public string Email { get; set; }
	public Guid BranchId { get; set; }
	public Guid AccountRepresentativeId { get; set; }
	public string AccountNumber { get; set; }
	public string TaxId { get; set; }
	public int OccupationTypeId { get; set; }
	public string OccupationDescription { get; set; }
	public string? DateOfBirth { get; set; }
	public string CityOfBirth { get; set; }
	public string CountryOfBirthCode { get; set; }
	public int IdentificationTypeId { get; set; }
	public string IdentificationNumber { get; set; }
	public string IdentificationIssuer { get; set; }
	public string IdentificationCountryCode { get; set; }
	public string? IdentificationExpirationDate { get; set; }
	public string CompanyName { get; set; }
	public string CompanyRegistrationNumber { get; set; }
	public string CompanyRegistrationCountryCode { get; set; }
	public string JobTitle { get; set; }
	public string Department { get; set; }
	public string ExternalReference { get; set; }
	public string LegalEntityIdentification { get; set; }
	public string BusinessStructureTypeCode { get; set; }
	public string WholesaleOrRetail { get; set; }
	public string AvoxId { get; set; }
	public decimal AMLRisk { get; set; }
	public string ABN { get; set; }
	public string ACN { get; set; }
	public string ARBN { get; set; }
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
	public string WebsiteUrl { get; set; }
	public string Nationality { get; set; }
	public short GenderTypeId { get; set; }
	public bool? IsUSPerson { get; set; }
	public string ReferredByPlatform { get; set; }
	public string ReferredByName { get; set; }
	public string ElectronicDataSource { get; set; }
	public string TraderNotes { get; set; }
	public string Memo { get; set; }
	public string BusinessActivity { get; set; }
	public string BaseCurrencyCode { get; set; }
	public string LimitCurrencyCode { get; set; }
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
	public string OnQuoteFXDealEmailNotify { get; set; }
	public string OnQuoteFXDealEmailNotifyBcc { get; set; }
	public string OnBookFXDealEmailNotify { get; set; }
	public string OnBookFXDealEmailNotifyBcc { get; set; }
	public string OnPostIncomingWireEmailNotify { get; set; }
	public string OnPostIncomingWireEmailNotifyBcc { get; set; }
	public Guid? WhiteLabelProfileId { get; set; }
	public Guid ReferrerId { get; set; }
	public bool IgnoreWarningsOnCreate { get; set; }
}

public class CustomerUpdateResponse : DTOResponseBase
{
	public CustomerUpdateData Customer { get; set; }
}

public class CustomerUpdateData
{
	public Guid CustomerId { get; set; }
	public string Timestamp { get; set; }
}

