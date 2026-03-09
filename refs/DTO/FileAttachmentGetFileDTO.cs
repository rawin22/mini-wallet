namespace GPWebApi.DTO;

public class FileAttachmentGetResponse : DTOResponseBase
{
	public FileAttachmentGetData FileAttachment { get; set; }
}

public class FileAttachmentGetData
{
	public Guid FileAttachmentId { get; set; }
	public int FileAttachmentTypeId { get; set; } = 0;
	public string FileAttachmentTypeName { get; set; } = string.Empty;
	public string FileAttachmentTypeDescription { get; set; } = string.Empty;
	public int FileAttachmentSubTypeId { get; set; } = 0;
	public string FileAttachmentSubTypeName { get; set; } = string.Empty;
	public string FileAttachmentSubTypeDescription { get; set; } = string.Empty;
	public int SumSubTypeId { get; set; } = 0;
	public string SumSubTypeName { get; set; } = string.Empty;
	public string SumSubTypeDescription { get; set; } = string.Empty;
	public string FileName { get; set; }
	public string FileDescription { get; set; }
	public long FileSize { get; set; }
	public string GroupName { get; set; }
	public bool IsPrimary { get; set; } = false;
	public bool ContainsFront { get; set; } = false;
	public bool ContainsBack { get; set; } = false;
	public bool ViewableByBanker { get; set; }
	public bool ViewableByCustomer { get; set; }
	public bool DeletableByCustomer { get; set; }
	public Dictionary<string, string>? Properties { get; set; }
	public string AttachedTime { get; set; }
	public Guid AttachedBy { get; set; }
	public string AttachedByName { get; set; }
	public bool IsDeleted { get; set; }
	public string? DeletedTime { get; set; }
	public Guid? DeletedBy { get; set; }
	public string? DeletedByName { get; set; }
	public byte[] ImageThumbnail { get; set; }
	public byte[] ImageFaceOnly { get; set; }
	public byte[] FileData { get; set; }

	public List<ItemAttributeData> Attributes = new List<ItemAttributeData>();
}