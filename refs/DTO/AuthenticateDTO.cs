namespace GPWebApi.DTO;
public class AuthenticateRequest
{
	public string LoginId { get; set; }
	public string Password { get; set; }
	public string CallerId { get; set; }
	public string IpAddress { get; set; } = String.Empty;
	public string Geolocation { get; set; } = String.Empty;
	public bool IncludeUserSettingsInResponse { get; set; } = false;
	public bool IncludeAccessRightsWithUserSettings { get; set; } = false;
}

public class AuthenticateResponse : DTOResponseBase
{
	public Tokens Tokens { get; set; }
	public UserSettingsData UserSettings { get; set; }
}

public class Tokens
{
	public string AccessToken { get; set; }
	public int AccessTokenExpiresInMinutes { get; set; }
	public string RefreshToken { get; set; }
	public int RefreshTokenExpiresInHours { get; set; }
}

public class RefreshRequest
{
	public string AccessToken { get; set; }
	public string RefreshToken { get; set; }
}

public class RevokeRequest
{
	public string? RefreshToken { get; set; }
}
