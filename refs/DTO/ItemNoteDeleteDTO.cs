namespace GPWebApi.DTO;

public class ItemNoteDeleteRequest
{
    public Guid ItemId { get; set; }
    public Guid ItemNoteId { get; set; }
}

public class ItemNoteDeleteResponse : DTOResponseBase
{
}

