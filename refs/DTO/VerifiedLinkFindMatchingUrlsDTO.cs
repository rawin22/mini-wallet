namespace GPWebApi.DTO;

public class VerifiedLinkFindMatchingUrlsResponse : DTOResponseBase
{
	public List<VerifiedLinkFindMatchingUrlsData> VerifiedLinks { get; set; }
}

public class VerifiedLinkFindMatchingUrlsData
{
	public Guid VerifiedLinkId { get; set; }
	public int VerifiedLinkTypeId { get; set; }
	public string VerifiedLinkTypeName { get; set; }
	public string VerifiedLinkReference { get; set; }
	public string WebsiteUrl { get; set; }
	public string VerifiedLinkUrl { get; set; }
	public string VerifiedLinkShortUrl { get; set; }
	public string BranchName { get; set; }
	public string BranchCountryCode { get; set; }
	public int CustomerTypeId { get; set; }
	public string CustomerTypeName { get; set; }
	public int TrustScore { get; set; }
	public string? LastLiveVerificationDate { get; set; }

}
