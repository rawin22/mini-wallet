using System.ComponentModel;
using System.Runtime.Serialization;

namespace GPWebApi.DTO;

public class LiveVerificationSearchRequest
{
	[DefaultValue("0")]
	public int PageIndex { get; set; } = 0;
	[DefaultValue("25")]
	public int PageSize { get; set; } = 0;
	public string LiveVerificationReference { get; set; } = string.Empty;
	public Guid? VerifierCustomerId { get; set; } = null;
	public Guid? SubjectCustomerId { get; set; } = null;
	public LiveVerificationStatusType? LiveVerificationStatusType { get; set; } = null;
	[DefaultValue(LiveVerificationSearchSortBy.Reference)]
	public LiveVerificationSearchSortBy SortBy { get; set; } = LiveVerificationSearchSortBy.CreatedTime;
	[DefaultValue(LiveVerificationSearchSortDirection.Descending)]
	public LiveVerificationSearchSortDirection SortDirection { get; set; } = LiveVerificationSearchSortDirection.Descending;
}


public enum LiveVerificationStatusType
{
	[EnumMember]
	Voided = 0,
	[EnumMember]
	Incomplete = 1,
	[EnumMember]
	Verified = 2
}

public enum LiveVerificationSearchSortBy
{
	[EnumMember]
	Reference = 1,
	[EnumMember]
	VerifiedTime = 2,
	[EnumMember]
	CreatedTime = 3
}

public enum LiveVerificationSearchSortDirection
{
	[EnumMember]
	Ascending = 0,
	[EnumMember]
	Descending = 1
}

public class LiveVerificationSearchResponse : DTOResponseBase
{
	public LiveVerificationSearchData Records { get; set; }
}

public class LiveVerificationSearchData : SearchRecords
{
	public List<LiveVerificationSearchRecord> LiveVerifications { get; set; }
}

public class LiveVerificationSearchRecord
{
	public Guid LiveVerificationId { get; set; } = Guid.Empty;
	public string LiveVerificationReference { set; get; } = string.Empty;
	public int LiveVerificationStatusTypeId { get; set; } = 1;
	public string LiveVerificationStatusTypeName { get; set; } = string.Empty;

	public LiveVerificationMethod VerificationMethod { get; set; } = LiveVerificationMethod.None;
	public Guid VerifierBranchId { get; set; }
	public string VerifierBranchName { get; set; }
	public Guid VerifierCustomerId { get; set; }
	public string VerifierCustomerName { get; set; }
	public Guid? VerifierDefaultStealthId { get; set; }
	public string? VerifierDefaultStealthIdReference { get; set; }
	public string? VerifierDefaultStealthIdName { get; set; }
	public string? VerifierDefaultStealthIdUrl { get; set; }
	public string? VerifierDefaultStealthIdShortUrl { get; set; }
	public Guid SubjectBranchId { get; set; }
	public string SubjectBranchName { get; set; }
	public Guid SubjectCustomerId { get; set; }
	public string SubjectCustomerName { get; set; }
	public Guid? SubjectVerifiedLinkId { get; set; }
	public string? SubjectVerifiedLinkReference { get; set; }
	public LiveVerificationRelationshipType? RelationshipType { get; set; }
	public LiveVerificationRelationshipInteractionsType? RelationshipInteractions { get; set; }
	public int? RelationshipNumberOfDays { get; set; }
	public int? RelationshipNumberOfMonths { get; set; }
	public int? RelationshipNumberOfYears { get; set; }
	public string Address { get; set; } = string.Empty;
	public string IpAddress { get; set; } = string.Empty;
	public string Geolocation { get; set; } = string.Empty;
	public Guid? LiveVerificationPhotoFileAttachmentId { get; set; }
	public Guid VerifiedBy { get; set; }
	public string VerifiedByName { get; set; }
	public string CreatedTime { get; set; }
	public string VerifiedTime { get; set; }
}
