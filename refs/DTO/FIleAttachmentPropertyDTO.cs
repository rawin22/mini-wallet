
namespace GPWebApi.DTO;

public class FileAttachmentPropertyCreateOrUpdateRequest
{
    public Guid FileAttachmentId { get; set; } 
    public string Key { get; set; } 
    public string Value { get; set; }
}

public class FileAttachmentPropertyCreateOrUpdateResponse : DTOResponseBase
{
}

