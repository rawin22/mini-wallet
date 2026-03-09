namespace GPWebApi.DTO;

public class ItemNoteGetAllForItemRequest
{
	public Guid ItemId { get; set; }
}

public class ItemNoteGetAllForItemResponse : DTOResponseBase
{
	public List<ItemNoteData> Notes { get; set; }

}


