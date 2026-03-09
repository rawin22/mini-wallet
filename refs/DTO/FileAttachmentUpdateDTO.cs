namespace GPWebApi.DTO;

public class FileAttachmentUpdateRequest
{
	public Guid FileAttachmentId { get; set; } = Guid.Empty;
	public string GroupName { get; set; } = String.Empty;
	public int FileAttachmentTypeId { get; set; } = 0;
	public bool ViewableByBanker { get; set; } = false;
	public bool ViewableByCustomer { get; set; } = false;
	public bool DeletableByCustomer { get; set; } = false;
	public string Description { get; set; } = String.Empty;
}

public class FileAttachmentUpdateResponse : DTOResponseBase
{
}

public class FileAttachmentUpdateData
{
	public Guid FileAttachmentId { get; set; }
}