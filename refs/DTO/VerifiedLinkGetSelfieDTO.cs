namespace GPWebApi.DTO;

public class VerifiedLinkGetSelfieRequest
{
	public string VerifiedLinkReference { get; set; }
}

public class VerifiedLinkGetSelfieResponse : DTOResponseBase
{
	public VerifiedLinkGetSelfieData VerifiedLink { get; set; }
}

public class VerifiedLinkGetSelfieData
{
	public Guid VerifiedLinkId { get; set; }
	public string VerifiedLinkReference { get; set; }
	public string WebsiteUrl { get; set; }
	public string VerifiedLinkUrl { get; set; }
	public string VerifiedLinkShortUrl { get; set; }
	public string MemberFirstName { get; set; }
	public byte[] Selfie { get; set; }
}

