namespace GPWebApi.DTO;

public class VerifiedLinkBookmarkCreateRequest
{
    public Guid? FolderId { get; set; }
    public bool IsFolder { get; set; } = false;
    public string BookmarkName { get; set; } = string.Empty;
    public string BookmarkUrl { get; set; } = string.Empty;
    public int Position { get; set; }
}

public class VerifiedLinkBookmarkCreateResponse : DTOResponseBase
{
    public VerifiedLinkBookmarkCreateData Bookmark { get; set; }
}

public class VerifiedLinkBookmarkCreateData
{
    public Guid VerifiedLinkBookmarkId { get; set; } 
}

