using GPWebApi.DTO;

public class VerifiedLinkCreateRequest
{
	public int VerifiedLinkTypeId { get; set; }
	public string VerifiedLinkName { get; set; } = String.Empty;
	public Guid CustomerId { get; set; }
	public string GroupName { get; set; } = String.Empty;
	public CurrencyAmountRequest? Amount { get; set; } = new CurrencyAmountRequest();
	public int MinimumWKYCLevel { get; set; }
	public string Message { get; set; } = String.Empty;
	public string PublicMessage { get; set; } = String.Empty;
	public string BlockchainMessage { get; set; } = String.Empty;
	public string SharedWithName { get; set; } = String.Empty;
	public string WebsiteUrl { get; set; } = String.Empty;
	public string VerifiedLinkUrl { get; set; } = String.Empty;
	public string VerifiedLinkShortUrl { get; set; } = String.Empty;
	public string SelectedAccountAlias { get; set; } = String.Empty;
	public int AgeConfirmOver { get; set; } = 0;
	public int AgeConfirmUnder { get; set; } = 0;
	public bool ShareAccountAlias { get; set; } = false;
	public bool ShareBirthCity { get; set; } = false;
	public bool ShareBirthCountry { get; set; } = false;
	public bool ShareBirthDate { get; set; } = false;
	public bool ShareFirstName { get; set; } = false;
	public bool ShareMiddleName { get; set; } = false;
	public bool ShareLastName { get; set; } = false;
	public bool ShareGlobalFirstName { get; set; } = false;
	public bool ShareGlobalMiddleName { get; set; } = false;
	public bool ShareGlobalLastName { get; set; } = false;
	public bool ShareGender { get; set; } = false;
	public bool ShareNationality { get; set; } = false;
	public bool ShareSuffix { get; set; } = false;
	public bool ShareIdExpirationDate { get; set; } = false;
	public bool ShareIdNumber { get; set; } = false;
	public bool ShareIdType { get; set; } = false;
	public bool ShareIdFront { get; set; } = false;
	public bool ShareIdBack { get; set; } = false;
	public bool ShareSelfie { get; set; } = false;
	public bool ShareAgeConfirmOver { get; set; } = false;
	public bool ShareAgeConfirmUnder { get; set; } = false;
	public Dictionary<string, VerifiedLinkTypeFieldValue>? FieldValues { get; set; }
	public Dictionary<string, string>? Properties { get; set; }
	public string? AdditionalData { get; set; }
	public bool IsWalletLocked { get; set; } = false;
	public string? WalletAddress { get; set; } = String.Empty;
	public string? TokenId { get; set; } = String.Empty;
	public string? NFTReference { get; set; } = String.Empty;
	public string? NFTChain { get; set; } = String.Empty;
	public bool IsPrimary { get; set; } = false;
	public DateTime? AvailableTime { get; set; }
	public DateTime? ExpirationTime { get; set; }
}


public class VerifiedLinkCreateResponse : DTOResponseBase
{
	public VerifiedLinkCreateData VerifiedLink { get; set; }
}

public class VerifiedLinkCreateData
{
	public string VerifiedLinkId { get; set; }
	public string VerifiedLinkReference { get; set; }
	public string Timestamp { get; set; }
}

