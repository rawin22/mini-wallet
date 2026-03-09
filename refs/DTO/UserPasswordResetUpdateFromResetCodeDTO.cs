namespace GPWebApi.DTO;

public class UserPasswordResetUpdateFromResetCodeRequest
{
    public string ResetCode { get; set; }
    public string NewPassword { get; set; }
    public string ConfirmPassword { get; set; } 
}

public class UserPasswordResetUpdateFromResetCodeResponse : DTOResponseBase
{     
}
