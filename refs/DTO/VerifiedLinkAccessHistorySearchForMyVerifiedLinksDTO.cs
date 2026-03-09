using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Runtime.Serialization;

namespace GPWebApi.DTO;


public class VerifiedLinkAccessHistorySearchForMyVerifiedLinksRequest
{
	public Guid? VerifiedLinkId { get; set; } = null;
	[DefaultValue("0")]
	public int PageIndex { get; set; } = 0;
	[DefaultValue("200")]
	public int PageSize { get; set; } = 0;
	public DateTime? StartTime { get; set; } = null;
	public DateTime? EndTime { get; set; } = null;
	public VerifiedLinkAccessHistorySearchForMyVerifiedLinksSortBy SortBy { get; set; } = VerifiedLinkAccessHistorySearchForMyVerifiedLinksSortBy.None;
	public VerifiedLinkAccessHistorySearchSortDirection SortDirection { get; set; } = VerifiedLinkAccessHistorySearchSortDirection.Descending;
}

public enum VerifiedLinkAccessHistorySearchForMyVerifiedLinksSortBy
{
	[EnumMember]
	None = 0,
	[EnumMember]
	AccessedTime = 1,
	[EnumMember]
	ResultType = 2,
	[EnumMember]
	DefaultStealthIdName = 3
}


public class VerifiedLinkAccessHistorySearchForMyVerifiedLinksResponse : DTOResponseBase
{
	public VerifiedLinkAccessHistorySearchForMyVerifiedLinksData Records { get; set; }
}

public class VerifiedLinkAccessHistorySearchForMyVerifiedLinksData : SearchRecords
{
	public List<VerifiedLinkAccessHistorySearchForMyVerifiedLinksRecord> AccessRecords { get; set; }
}


public class VerifiedLinkAccessHistorySearchForMyVerifiedLinksRecord
{
	public Guid? VerifiedLinkId { get; set; }
	public string VerifiedLinkReference { get; set; }
	public int VerifiedLinkStatusTypeId { get; set; }
	public string VerifiedLinkStatusTypeName { get; set; }
	public string VerifiedLinkName { get; set; }
	public int VerifiedLinkTypeId { get; set; }
	public string VerifiedLinkTypeName { get; set; }
	public string VerifiedLinkUrl { get; set; }
	public string VerifiedLinkShortUrl { get; set; }
	public int ResultTypeId { get; set; }
	public string ResultTypeName { get; set; }
	public string? AccessedByDefaultStealthIdReference { get; set; }
	public string? AccessedByDefaultStealthIdName { get; set; }
	public string? AccessedByDefaultStealthIdUrl { get; set; }
	public string? AccessedByDefaultStealthIdShortUrl { get; set; }
	public DateTime AccessedTime { get; set; }
}