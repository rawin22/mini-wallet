using System.ComponentModel;
using System.Runtime.Serialization;

namespace GPWebApi.DTO;

public class VerifiedLinkSearchRequest
{
	[DefaultValue("0")]
	public int PageIndex { get; set; } = 0;
	[DefaultValue("25")]
	public int PageSize { get; set; } = 0;
	public string VerifiedLinkReference { get; set; } = string.Empty;
	public VerifiedLinkSearchStatusType VerifiedLinkSearchStatusType { get; set; }
	public string CustomerName { get; set; } = string.Empty;
	public string AccountNumber { get; set; } = string.Empty;
	public string BranchName { get; set; } = string.Empty;
	public int VerifiedLinkTypeId { get; set; } = 0;
	public int MinimumWKYCLevel { get; set; } = 0;
	[DefaultValue(0)]
	public decimal AmountMin { get; set; } = decimal.Zero;
	public decimal AmountMax { get; set; } = decimal.Zero;
	public DateTime AvailableTimeMin { get; set; } = DateTime.MinValue;
	public DateTime AvailableTimeMax { get; set; } = DateTime.MaxValue;
	public DateTime ExpirationTimeMin { get; set; } = DateTime.MinValue;
	public DateTime ExpirationTimeMax { get; set; } = DateTime.MaxValue;
	public string CurrencyCode { get; set; } = string.Empty;
	[DefaultValue(VerifiedLinkSearchSortBy.Reference)]
	public VerifiedLinkSearchSortBy SortBy { get; set; } = VerifiedLinkSearchSortBy.None;
	[DefaultValue(VerifiedLinkSearchSortDirection.Descending)]
	public VerifiedLinkSearchSortDirection SortDirection { get; set; } = VerifiedLinkSearchSortDirection.Descending;
}


public enum VerifiedLinkSearchStatusType
{
	[EnumMember]
	All = 0,
	[EnumMember]
	Pending = 1,
	[EnumMember]
	Active = 2,
	[EnumMember]
	Expired = 3,
	[EnumMember]
	Voided = 4
}

public enum VerifiedLinkSearchSortBy
{
	[EnumMember]
	None = 0,
	[EnumMember]
	Reference = 1,
	[EnumMember]
	Name = 2,
	[EnumMember]
	Amount = 3,
	[EnumMember]
	CurrencyCode = 4,
	[EnumMember]
	CreatedTime = 5,
	[EnumMember]
	VerifiedLinkType = 6,
	[EnumMember]
	MinimumWKYCLevel = 7,

}

public enum VerifiedLinkSearchSortDirection
{
	Ascending = 0,
	Descending = 1
}

public class VerifiedLinkSearchResponse : DTOResponseBase
{
	public VerifiedLinkSearchData Records { get; set; }
}

public class VerifiedLinkSearchData : SearchRecords
{
	public List<VerifiedLinkSearchRecord> VerifiedLinks { get; set; }
}

public class VerifiedLinkSearchRecord
{
	public Guid VerifiedLinkId { get; set; }
	public string VerifiedLinkReference { get; set; }
	public int VerifiedLinkSequenceNumber { get; set; }
	public string VerifiedLinkName { get; set; }
	public int VerifiedLinkTypeId { get; set; } = 0;
	public string VerifiedLinkTypeName { get; set; }
	public int VerifiedLinkStatusTypeId { get; set; }
	public string VerifiedLinkStatusTypeName { get; set; }
	//public string ThirdPartyId { get; set; }
	public Guid CustomerId { get; set; }
	public string CustomerName { get; set; }
	public int MinimumWKYCLevel { get; set; }
	public decimal Amount { get; set; }
	public string AmountCurrencyCode { get; set; }
	public string AmountText { get; set; }
	public string AmountTextWithCommas { get; set; }
	public string AmountTextWithCurrencyCode { get; set; }
	public string AmountTextWithCommasAndCurrencyCode { get; set; }
	public string AmountTextSwift { get; set; }
	public bool IsPrimary { get; set; } = false;
	public string AvailableTime { get; set; }
	public string ExpirationTime { get; set; }
	public string CreatedTime { get; set; }
	public string CreatedBy { get; set; }
	public string CreatedByFullName { get; set; }
	public bool IsDeleted { get; set; }
}