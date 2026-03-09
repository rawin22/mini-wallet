namespace GPWebApi.DTO;

public class CountryListResponse : DTOResponseBase
{
	public List<CountryInfo> Countries { get; set; } = new List<CountryInfo>();
}

public class CountryInfo
{
	public string CountryCode { get; set; } = string.Empty;
	public string CountryName { get; set; } = string.Empty;
	public bool IsIbanCountry { get; set; } = false;
}