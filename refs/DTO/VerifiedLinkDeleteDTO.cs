using Swashbuckle.AspNetCore.Filters;

namespace GPWebApi.DTO;

public class VerifiedLinkDeleteRequest
{
	public Guid VerifiedLinkId { get; set; }
	public string Timestamp { get; set; }
}

public class VerifiedLinkDeleteResponse : DTOResponseBase
{
}

public class VerifiedLinkDeleteRequestExample : IExamplesProvider<VerifiedLinkDeleteRequest>
{
	public VerifiedLinkDeleteRequest GetExamples()
	{
		return new VerifiedLinkDeleteRequest()
		{
			VerifiedLinkId = new Guid("aa862573-8098-ee11-8e67-2c0da7d75de7"),
			Timestamp = "AAAAAAIVi3Q="
		};
	}
}
