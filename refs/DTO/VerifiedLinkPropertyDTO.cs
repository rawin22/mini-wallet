
namespace GPWebApi.DTO;

public class VerifiedLinkPropertyCreateOrUpdateRequest
{
    public Guid VerifiedLinkId { get; set; } 
    public string Key { get; set; } 
    public string Value { get; set; }
}

public class VerifiedLinkPropertyCreateOrUpdateResponse : DTOResponseBase
{
}

