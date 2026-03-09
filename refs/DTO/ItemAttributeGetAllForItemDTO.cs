namespace GPWebApi.DTO;

public class ItemAttributeGetAllForItemResponse : DTOResponseBase
{
    public List<ItemAttributeData> Attributes { get; set; } 

}

public class ItemAttributeData
{
    public Guid ItemAttributeId { get; set; } 
    public string AttributeKey { get; set; }
    public string AttributeValue { get; set; }
}


