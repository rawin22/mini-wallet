using System.Text.Json.Serialization;

namespace GPWebApi.DTO;

public class VerifyGetMultipleRequest
{
    public List<VerifyGetRequest> VLinks { get; set; } = new List<VerifyGetRequest>();
}

public class VerifyGetMultipleResponse : DTOResponseBase
{
    public List<VerifyData> VLinks { get; set; }
}

