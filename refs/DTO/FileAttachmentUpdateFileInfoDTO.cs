namespace GPWebApi.DTO;

public class FileAttachmentUpdateFileInfoRequest
{
	public Guid FileAttachmentId { get; set; }
	public int FileAttachmentTypeId { get; set; } = 0;
	public int FileAttachmentSubTypeId { get; set; } = 0;
	public int SumSubTypeId { get; set; } = 0;
	public string FileName { get; set; } = String.Empty;
	public string GroupName { get; set; } = String.Empty;
	public bool IsPrimary { get; set; } = false;
	public bool ContainsFront { get; set; } = false;
	public bool ContainsBack { get; set; } = false;
	public bool ViewableByBanker { get; set; } = false;
	public bool ViewableByCustomer { get; set; } = false;
	public bool DeletableByCustomer { get; set; } = false;
	public string Description { get; set; } = String.Empty;
}

public class FileAttachmentUpdateFileInfoResponse : DTOResponseBase
{
}

