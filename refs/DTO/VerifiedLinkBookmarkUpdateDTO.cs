namespace GPWebApi.DTO;

public class VerifiedLinkBookmarkUpdateRequest
{
    public Guid VerifiedLinkBookmarkId { get; set; } = Guid.Empty;
    public Guid? FolderId { get; set; }
    public string? BookmarkName { get; set; } = string.Empty;
    public string? BookmarkUrl { get; set; } = string.Empty;
    public int Position { get; set; }
}

public class VerifiedLinkBookmarkUpdateResponse : DTOResponseBase
{
}

