namespace GPWebApi.DTO;

public class CountryListGetPaymentCountriesResponse : DTOResponseBase
{
    public List<CountryData> Countries { get; set; } = new List<CountryData>();
}

public class CountryData
{
    public string CountryCode { get; set; } = string.Empty;
    public string CountryName { get; set; } = string.Empty;
    public bool IsIbanCountry { get; set; } = false;
    public int SortOrder { get; set; } = 0;
    public bool IsEnabled { get; set; } = false;
    public bool IsBlocked { get; set; } = false;
    public bool IsCustomerPostalCodeRequired { get; set; } = false;
    public string Memo { get; set; } = string.Empty;
    public string DefaultCurrencyCode { get; set; } = string.Empty;
    public int BlockStatus { get; set; } = 0;
}