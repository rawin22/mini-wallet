using GPLibrary.DataObjects;

namespace GPWebApi.DTO;

public class LiveVerificationGetSingleRequest
{

}

public class LiveVerificationGetSingleResponse : DTOResponseBase
{
	public LiveVerificationData LiveVerification { get; set; }
}

public class LiveVerificationData
{
	public Guid LiveVerificationId { get; set; } = Guid.Empty;
	public string LiveVerificationReference { get; set; } = string.Empty;
	public int LiveVerificationStatusTypeId { get; set; } = 1;
	public string LiveVerificationStatusTypeName { get; set; } = string.Empty;
	//public LiveVerificationMethod VerificationMethod { get; set; } = LiveVerificationMethod.None;
	public Guid VerifierBranchId { get; set; }
	public string VerifierBranchName { get; set; }
	public Guid VerifierCustomerId { get; set; }
	public string VerifierCustomerName { get; set; }
	public Guid? VerifierDefaultStealthId { get; set; }
	public string? VerifierDefaultStealthIdReference { get; set; }
	public string? VerifierDefaultStealthIdName { get; set; }
	public string? VerifierDefaultStealthIdUrl { get; set; }
	public string? VerifierDefaultStealthIdShortUrl { get; set; }
	public Guid SubjectBranchId { get; set; }
	public string SubjectBranchName { get; set; }
	public Guid SubjectCustomerId { get; set; }
	public string SubjectCustomerName { get; set; }
	public Guid? SubjectVerifiedLinkId { get; set; }
	public string? SubjectVerifiedLinkReference { get; set; }
	//public Guid? SubjectUserId { get; set; }
	//public LiveVerificationRelationshipType? RelationshipType { get; set; }
	//public LiveVerificationRelationshipInteractionsType? RelationshipInteractions { get; set; }
	public int? RelationshipNumberOfDays { get; set; }
	public int? RelationshipNumberOfMonths { get; set; }
	public int? RelationshipNumberOfYears { get; set; }
	public string Address { get; set; } = string.Empty;
	public string IpAddress { get; set; } = string.Empty;
	public string Geolocation { get; set; } = string.Empty;
	public Guid? LiveVerificationPhotoFileAttachmentId { get; set; }
	public Guid VerifiedBy { get; set; }
	public string VerifiedByName { get; set; }
	public string CreatedTime { get; set; }
	public string? VerifiedTime { get; set; }
}
