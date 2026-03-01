namespace GPWebApi.DTO;

public class FileAttachmentPropertyListUpdateRequest
{
    public Guid FileAttachmentId { get; set; }
    public Dictionary<string, string?>? Properties { get; set; }
    public bool ReplaceAll { get; set; } = false;
}

public class FileAttachmentPropertiesListUpdateResponse : DTOResponseBase
{
}


