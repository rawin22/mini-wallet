namespace GPWebApi.DTO;

public class UserAccessRightTemplateLinkRequest
{
    public Guid UserId { get; set; }
    public Guid AccessRightTemplateId { get; set; }
}

public class UserAccessRightTemplateLinkResponse : DTOResponseBase
{
}