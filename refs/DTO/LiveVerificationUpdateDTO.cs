namespace GPWebApi.DTO;

public class LiveVerificationUpdateRequest
{
    public Guid LiveVerificationId { get; set; }
    public LiveVerificationMethod? VerificationMethod { get; set; } = null;
    public LiveVerificationRelationshipType? RelationshipType { get; set; } = null;
    public LiveVerificationRelationshipInteractionsType? RelationshipInteractions { get; set; } = null;
    public int? RelationshipNumberOfDays { get; set; } = null;
    public int? RelationshipNumberOfMonths { get; set; } = null;
    public int? RelationshipNumberOfYears { get; set; } = null;
    public string Address { get; set; } = string.Empty;
}


public class LiveVerificationUpdateResponse : DTOResponseBase
{
}
