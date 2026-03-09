namespace GPWebApi.DTO;

public class FileAttachmentData
{
	public string FileName { get; set; } = string.Empty;
	public int FileAttachmentTypeId { get; set; } = 0;
	public string FileAttachmentTypeName { get; set; } = string.Empty;
	public int FileAttachmentSubTypeId { get; set; } = 0;
	public string FileAttachmentSubTypeName { get; set; } = string.Empty;
	public long FileSize { get; set; } = 0;
	public string Description { get; set; } = string.Empty;
	public byte[] FileData { get; set; } = new byte[0];
}