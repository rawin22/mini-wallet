namespace GPWebApi.DTO;

public class UserAccountAliasListGetResponse : DTOResponseBase
{
    public List<UserAccountAliasData> AccountAliases { get; set; } = new List<UserAccountAliasData>();
}

public class UserAccountAliasData
{
    public string Alias { get; set; } = string.Empty;
    public bool IsDefault { get; set; } = false;
}