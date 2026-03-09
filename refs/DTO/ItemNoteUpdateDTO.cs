namespace GPWebApi.DTO;

public class ItemNoteUpdateRequest
{
    public Guid ItemId { get; set; } 
    public Guid ItemNoteId { get; set; }
    public string NoteText { get; set; }
    public bool ViewableByCustomer { get; set; }
}

public class ItemNoteUpdateResponse : DTOResponseBase
{
}

