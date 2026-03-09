namespace GPWebApi.DTO;

public class UserAccessRightTemplateApplyRequest
{
    public Guid UserId { get; set; }
    public Guid AccessRightTemplateId { get; set; }
}

public class UserAccessRightTemplateApplyResponse : DTOResponseBase
{
}