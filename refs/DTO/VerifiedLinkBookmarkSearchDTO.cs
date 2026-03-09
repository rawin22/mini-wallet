using System.ComponentModel;
using System.Runtime.Serialization;

namespace GPWebApi.DTO;

public class VerifiedLinkBookmarkSearchRequest
{
    [DefaultValue("0")]
    public int PageIndex { get; set; } = 0;
    [DefaultValue("200")]
    public int PageSize { get; set; } = 0;
    public Guid? FolderId { get; set; } = null;
    public string BookmarkName { get; set; } = string.Empty;
    public string BookmarkUrl { get; set; } = string.Empty;
    public VerifiedLinkBookmarkSearchSortBy SortBy { get; set; } = VerifiedLinkBookmarkSearchSortBy.None;
    public VerifiedLinkBookmarkSearchSortDirection SortDirection { get; set; } = VerifiedLinkBookmarkSearchSortDirection.Descending;

}

public enum VerifiedLinkBookmarkSearchSortBy
{
    [EnumMember]
    None = 0,
    [EnumMember]
    Position = 1,
    [EnumMember]
    BookmarkName = 2,
    [EnumMember]
    BookmarkUrl = 3,
}

public enum VerifiedLinkBookmarkSearchSortDirection
{
    [EnumMember]
    Ascending = 0,
    [EnumMember]
    Descending = 1
}

public class VerifiedLinkBookmarkSearchResponse : DTOResponseBase
{
    public int RecordCount { get; set; } = 0;
    public int TotalRecords { get; set; } = 0;
    public Guid? ParentFolderId { get; set; } = null;   
    public List<VerifiedLinkBookmarkSearchData> Bookmarks { get; set; } 
}

public class VerifiedLinkBookmarkSearchData
{
    public Guid VerifiedLinkBookmarkId { get; set; }
    public bool IsFolder { get; set; } = false;
    public string BookmarkName { get; set; } = string.Empty;
    public string BookmarkUrl { get; set; } = string.Empty;
    public int Position { get; set; } 
}