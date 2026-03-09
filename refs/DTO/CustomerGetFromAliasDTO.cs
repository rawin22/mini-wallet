namespace GPWebApi.DTO;

public class CustomerGetFromAliasRequest
{
    public string Alias { get; set; }
}

public class CustomerGetFromAliasResponse : DTOResponseBase
{
    public CustomerGetData Customer { get; set; } = null;
}