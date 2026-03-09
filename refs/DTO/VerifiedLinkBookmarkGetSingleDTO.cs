
namespace GPWebApi.DTO;

public class VerifiedLinkBookmarkGetSingleResponse : DTOResponseBase
{
    public VerifiedLinkBookmarkGetSingleData Bookmark { get; set; }
}

public class VerifiedLinkBookmarkGetSingleData
{
    public Guid VerifiedLinkBookmarkId { get; set; }
    public Guid? FolderId { get; set; } = null;
    public bool IsFolder { get; set; } = false;
    public string BookmarkName { get; set; } = string.Empty;
    public string BookmarkUrl { get; set; } = string.Empty;
    public int Position { get; set; }

}