namespace GPWebApi.DTO;

public class CustomerAccountAliasListGetResponse : DTOResponseBase
{
    public List<CustomerAccountAliasData> Aliases { get; set; }
}

public class CustomerAccountAliasData
{
    public string AccountAlias { get; set; } = string.Empty;
    public int AccountAliasTypeId { get; set; }
    public string AccountAliasTypeName { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
}