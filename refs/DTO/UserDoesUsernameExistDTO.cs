namespace GPWebApi.DTO;

public class UserDoesUsernameExistResponse : DTOResponseBase
{
    public bool Exists { get; set; } = false;
}
