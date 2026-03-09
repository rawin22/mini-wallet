using System.ComponentModel;
using System.Runtime.Serialization;

namespace GPWebApi.DTO;


public class VerifiedLinkAccessHistorySearchForMyVisitsRequest
{
	[DefaultValue("0")]
	public int PageIndex { get; set; } = 0;
	[DefaultValue("200")]
	public int PageSize { get; set; } = 0;
	public DateTime? StartTime { get; set; } = null;
	public DateTime? EndTime { get; set; } = null;
	public Guid? VerifiedLinkId { get; set; } = null;
	public string? VerifiedLinkReference { get; set; } = null;
	public int VerifiedLinkTypeId { get; set; } = 0;
	public VerifiedLinkAccessHistorySearchForMyVisitsSortBy SortBy { get; set; } = VerifiedLinkAccessHistorySearchForMyVisitsSortBy.None;
	public VerifiedLinkAccessHistorySearchSortDirection SortDirection { get; set; } = VerifiedLinkAccessHistorySearchSortDirection.Descending;
}


public enum VerifiedLinkAccessHistorySearchForMyVisitsSortBy
{
	[EnumMember]
	None = 0,
	[EnumMember]
	Reference = 1,
	[EnumMember]
	Name = 2,
	[EnumMember]
	AccessedTime = 3,
	[EnumMember]
	VerifiedLinkType = 4
}

public enum VerifiedLinkAccessHistorySearchSortDirection
{
	[EnumMember]
	Ascending = 0,
	[EnumMember]
	Descending = 1
}

public class VerifiedLinkAccessHistorySearchForMyVisitsResponse : DTOResponseBase
{
	public VerifiedLinkAccessHistorySearchForMyVisitsData Records { get; set; }
}

public class VerifiedLinkAccessHistorySearchForMyVisitsData : SearchRecords
{
	public List<VerifiedLinkAccessHistorySearchForMyVisitsRecord> VerifiedLinks { get; set; }
}


public class VerifiedLinkAccessHistorySearchForMyVisitsRecord
{
	public Guid? VerifiedLinkId { get; set; }
	public string VerifiedLinkReference { get; set; }
	public int VerifiedLinkTypeId { get; set; }
	public string VerifiedLinkTypeName { get; set; }
	public int VerifiedLinkStatusTypeId { get; set; }
	public string VerifiedLinkStatusTypeName { get; set; }
	public string VerifiedLinkName { get; set; }
	public string VerifiedLinkUrl { get; set; }
	public string VerifiedLinkShortUrl { get; set; }
	public int ResultTypeId { get; set; }
	public string ResultTypeName { get; set; }
	public DateTime AccessedTime { get; set; }

}