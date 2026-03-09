namespace GPWebApi.DTO;

public class CustomerAccountAliasDoesAliasExistResponse : DTOResponseBase
{
    public bool Exists { get; set; } = false;
}
