namespace GPWebApi.DTO;

public class FileAttachmentExtractDataResponse : DTOResponseBase
{
    public FileAttachmentExtractDataData FileAttachment { get; set; } = null;
}

public class FileAttachmentExtractDataData
{
    public Guid FileAttachmentId { get; set; } 
    public Dictionary<string, string>? Properties { get; set; } = null;
}


