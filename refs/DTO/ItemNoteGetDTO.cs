namespace GPWebApi.DTO;

public class ItemNoteGetRequest
{
    public Guid ItemId { get; set; }
    public Guid ItemNoteId { get; set; }
}

public class ItemNoteGetResponse : DTOResponseBase
{
    public ItemNoteData Note { get; set; }

}

public class ItemNoteData
{
    public Guid ItemNoteId { get; set; } 
    public string NoteText { get; set; } 
    public bool ViewableByCustomer { get; set; }
    public string CreatedTime { get; set; } 
    public string CreatedBy { get; set; } 
    public string CreatedByName { get; set; }
}

