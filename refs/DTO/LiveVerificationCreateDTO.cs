using System.ComponentModel.DataAnnotations;

namespace GPWebApi.DTO;

public class LiveVerificationCreateRequest
{
	public LiveVerificationMethod? VerificationMethod { get; set; } = null;
	public Guid SubjectVerifiedLinkId { get; set; }
	public LiveVerificationRelationshipType? RelationshipType { get; set; } = null;
	public LiveVerificationRelationshipInteractionsType? RelationshipInteractions { get; set; } = null;
	public int? RelationshipNumberOfDays { get; set; }
	public int? RelationshipNumberOfMonths { get; set; }
	public int? RelationshipNumberOfYears { get; set; }
	public string Address { get; set; } = string.Empty;
	public string IpAddress { get; set; } = string.Empty;
	public string Geolocation { get; set; } = string.Empty;
	public Guid? LiveVerificationPhotoFileAttachmentId { get; set; } = null;
}


public class LiveVerificationCreateResponse : DTOResponseBase
{
	public Guid? LiveVerificationId { get; set; }
	public string LiveVerificationReference { get; set; }
}

public enum LiveVerificationMethod
{
	None = 0,
	InPerson = 1,
	Online = 2
}

public enum LiveVerificationRelationshipType
{
	None = 0,
	Acquaintance = 1,
	Personal = 2,
	Professional = 3
}

public enum LiveVerificationRelationshipInteractionsType
{
	[Display(Name = "Never")]
	Never = 0,
	[Display(Name = "A few times (1–10)")]
	OneToTen = 1,
	[Display(Name = "Many times (10+)")]
	TenOrMore = 2
}
