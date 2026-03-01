namespace GPWebApi.DTO;

public class VerifiedLinkTypeFieldGetResponse : DTOResponseBase
{
	public List<VerifiedLinkTypeFieldData> VerifiedLinkTypeFields { get; set; } = new List<VerifiedLinkTypeFieldData>();
}

public class VerifiedLinkTypeFieldData
{
	public string FieldName { get; set; }
	public string FieldLabel { get; set; }
	public string FieldType { get; set; }
	public int DisplayOrder { get; set; }
	public bool IsRequired { get; set; }
	public int? MaxLength { get; set; }
	public string DefaultValue { get; set; }
	public string ValidationType { get; set; }
	public string ValidationRegEx { get; set; }
	public string ValidationMessage { get; set; }
	public List<VerifiedLinkTypeFieldOption> Options { get; set; }
}

public class VerifiedLinkTypeFieldOption
{
	public string Value { get; set; }
	public string Text { get; set; }
}

public class VerifiedLinkTemplateFieldValue
{
	public string FieldValue { get; set; }
	public bool ShareField { get; set; } = false;
}