using GPLibrary.DataObjects;

namespace GPWebApi.DTO;

public class IdentificationData
{
	public string IdType { get; set; } = String.Empty;
	public string IdNumber { get; set; } = String.Empty;
	public string IdIssuer { get; set; } = String.Empty;
	public string? IssuedDate { get; set; }
	public string? ExpirationDate { get; set; }
}

