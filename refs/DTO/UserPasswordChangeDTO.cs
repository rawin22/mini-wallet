using Swashbuckle.AspNetCore.Filters;

namespace GPWebApi.DTO;

public class UserPasswordChangeRequest
{
	public Guid UserId { get; set; }
	public string OldPassword { get; set; }
	public string NewPassword { get; set; }
}

//public class UserPasswordChangeResponse : DTOResponseBase
public class UserPasswordChangeResponse
{
	public List<MyProblem> Problems { get; set; }
}

public class UserPasswordChangeRequestExample : IExamplesProvider<UserPasswordChangeRequest>
{
	public UserPasswordChangeRequest GetExamples()
	{
		return new UserPasswordChangeRequest()
		{
			UserId = new Guid("aa862573-8098-ee11-8e67-2c0da7d75de7"),
			OldPassword = "^9TJkxAW",
			NewPassword = "xGY4&^yC"
		};
	}
}
