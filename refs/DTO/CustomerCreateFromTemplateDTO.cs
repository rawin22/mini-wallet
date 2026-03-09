using System.Text.Json.Serialization;

using Swashbuckle.AspNetCore.Filters;

namespace GPWebApi.DTO;

public class CustomerCreateFromTemplateRequest
{
	public Guid? BranchId { get; set; }
	public Guid AccountRepresentativeId { get; set; }
	public Guid CustomerTemplateId { get; set; }
	public int CustomerTypeId { get; set; }
	public string CustomerName { get; set; } = string.Empty;
	public string CustomerNamePrefix { get; set; } = string.Empty;
	public string FirstName { get; set; } = string.Empty;
	public string MiddleName { get; set; } = string.Empty;
	public string LastName { get; set; } = string.Empty;
	public string CustomerNameSuffix { get; set; } = string.Empty;
	public string GlobalCustomerName { get; set; } = string.Empty;
	public string GlobalFirstName { get; set; } = string.Empty;
	public string GlobalMiddleName { get; set; } = string.Empty;
	public string GlobalLastName { get; set; } = string.Empty;
	public string CountryCode { get; set; } = string.Empty;
	public string MailingAddressLine1 { get; set; } = string.Empty;
	public string MailingAddressLine2 { get; set; } = string.Empty;
	public string MailingDepartment { get; set; } = string.Empty;
	public string MailingSubDepartment { get; set; } = string.Empty;
	public string MailingStreetName { get; set; } = string.Empty;
	public string MailingBuildingNumber { get; set; } = string.Empty;
	public string MailingBuildingName { get; set; } = string.Empty;
	public string MailingFloor { get; set; } = string.Empty;
	public string MailingPostBox { get; set; } = string.Empty;
	public string MailingRoom { get; set; } = string.Empty;
	public string MailingCity { get; set; } = string.Empty;
	public string MailingTownLocationName { get; set; } = string.Empty;
	public string MailingDistrictName { get; set; } = string.Empty;
	public string MailingStateOrProvince { get; set; } = string.Empty;
	public string MailingPostalCode { get; set; } = string.Empty;
	public string Email { get; set; } = string.Empty;
	public string Phone { get; set; } = string.Empty;
	public string CellPhone { get; set; } = string.Empty;
	public string Fax { get; set; } = string.Empty;
	public string WKYCId { get; set; } = string.Empty;
	public string TaxId { get; set; } = string.Empty;
	public string AccountNumber { get; set; } = string.Empty;
	public string ReferredByPlatform { get; set; } = string.Empty;
	public string ReferredByName { get; set; } = string.Empty;
}

public class CustomerCreateFromTemplateResponse : DTOResponseBase
{
	public CustomerCreateFromTemplateData Customer { get; set; }
}

public class CustomerCreateFromTemplateData
{
	public Guid CustomerId { get; set; }
	public string Timestamp { get; set; }
}

public class CustomerCreateFromTemplateErrorResponse
{
	[JsonPropertyName("customer")]
	public object Customer { get; set; }

	[JsonPropertyName("problems")]
	public ErrorProblem[] Problems { get; set; }
}

public class ErrorProblem
{
	[JsonPropertyName("problemCode")]
	public int ProblemCode { get; protected set; } = 0;
	[JsonPropertyName("problemType")]
	public ProblemType ProblemType { get; protected set; }
	[JsonPropertyName("message")]
	public string Message { get; protected set; } = string.Empty;
	[JsonPropertyName("messageDetails")]
	public string MessageDetails { get; protected set; } = string.Empty;
	[JsonPropertyName("fieldName")]
	public string FieldName { get; protected set; } = string.Empty;
	[JsonPropertyName("fieldValue")]
	public string FieldValue { get; protected set; } = string.Empty;
}