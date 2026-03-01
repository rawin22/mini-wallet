using Swashbuckle.AspNetCore.Filters;

namespace GPWebApi.DTO;

public class CustomerUserCreateRequest
{
    public Guid CustomerId { get; set; }
    public string UserName { get; set; }
    public string Password { get; set; }
    public string EmailAddress { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public bool IsApproved { get; set; }
    public bool UserMustChangePassword { get; set; }
    public bool EmailPasswordToUser { get; set; }
    public string WKYCId { get; set; }
}

public class CustomerUserCreateResponse : DTOResponseBase
{
    public CustomerUserCreateData User { get; set; }
}

public class CustomerUserCreateData
{
    public string UserId { get; set; }
    public string NewPassword { get; set; }
}
