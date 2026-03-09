namespace GPWebApi.DTO;

public class CountryIdentificationTypeListGetResponse : DTOResponseBase
{
	public List<CountryIdentificationTypeData> IdentificationTypes { get; set; } = new List<CountryIdentificationTypeData>();
}

public class CountryIdentificationTypeData
{
	public int CountryIdentificationTypeID { get; set; }
	public string CountryIdentificationTypeName { get; set; } = "";
	public string CountryIdentificationTypeEnglishName { get; set; } = "";
	public int IdentificationTypeID { get; set; }
	public string IdentificationTypeName { get; set; }
	public string CountryCode { get; set; } = "";
	public string StateOrProvince { get; set; } = "";
	public string Description { get; set; } = "";
	public bool HasFullSpread { get; set; }
	public bool HasBioDataPage { get; set; }
	public bool RequireFrontSide { get; set; }
	public bool RequireBackSide { get; set; }
	public string Notes { get; set; } = "";
	public int SortOrder { get; set; }
}


