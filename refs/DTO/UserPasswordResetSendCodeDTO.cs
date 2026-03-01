namespace GPWebApi.DTO;

public class UserPasswordResetSendCodeRequest
{
    public string UserName { get; set; }
    public string? PasswordResetUrl { get; set; } 
}

public class UserPasswordResetSendCodeResponse : DTOResponseBase
{
 
}
