namespace GPWebApi.DTO;

public class FileAttachmentAddFileRequest
{
	public Guid ParentObjectId { get; set; }
	public int ParentObjectTypeId { get; set; } = 0;
	public string SourceIP { get; set; } = String.Empty;
	public int FileAttachmentTypeId { get; set; } = 0;
	public int FileAttachmentSubTypeId { get; set; } = 0;
	public int SumSubTypeId { get; set; } = 0;
	public string FileName { get; set; } = String.Empty;
	public string GroupName { get; set; } = String.Empty;
	public Dictionary<string, string>? Properties { get; set; }
	public bool IsPrimary { get; set; } = false;
	public bool ContainsFront { get; set; } = false;
	public bool ContainsBack { get; set; } = false;
	public bool ViewableByBanker { get; set; } = false;
	public bool ViewableByCustomer { get; set; } = false;
	public bool DeletableByCustomer { get; set; } = false;
	public string Description { get; set; } = String.Empty;
	public bool BypassFileAnalysis { get; set; } = false;
	public byte[]? FileData { get; set; }
}

public class FileAttachmentAddFileResponse : DTOResponseBase
{
	public FileAttachmentAddFileData FileAttachment { get; set; } = null;
}

public class FileAttachmentAddFileData
{
	public Guid FileAttachmentId { get; set; }
	public SortedDictionary<string, string>? Properties { get; set; } = null;
}


