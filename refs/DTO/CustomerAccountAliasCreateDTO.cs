namespace GPWebApi.DTO;

public class CustomerAccountAliasCreateRequest
{
    public Guid CustomerId { get; set; }
    public string AccountAlias { get; set; }
    public int AccountAliasType { get; set; }
    public bool SetAsDefault { get; set; }
}

public class CustomerAccountAliasCreateResponse : DTOResponseBase
{
}