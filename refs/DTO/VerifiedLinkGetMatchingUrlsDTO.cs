namespace GPWebApi.DTO;

public class VerifiedLinkGetMatchingUrlsResponse : DTOResponseBase
{
    public List<VerifiedLinkGetMatchingUrlsData> VerifiedLinks { get; set; }
}

public class VerifiedLinkGetMatchingUrlsData
{
    public Guid VerifiedLinkId { get; set; }
    public string VerifiedLinkReference { get; set; }
    public string WebsiteUrl { get; set; }
    public string VerifiedLinkUrl { get; set; }
    public string VerifiedLinkShortUrl { get; set; }
    public string BranchName { get; set; }
    public string BranchCountryCode { get; set; }
    public int TrustScore { get; set; }
    public string? LastLiveVerificationDate { get; set; }

}

