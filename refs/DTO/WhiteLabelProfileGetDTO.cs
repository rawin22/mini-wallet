using System.Runtime.Serialization;

namespace GPWebApi.DTO
{
    public class WhiteLabelProfileGetResponse : DTOResponseBase
    {
        public WhiteLabelProfileGetData Profile { get; set; }

    }

    [DataContract]
    public class WhiteLabelProfileGetData
    {
        public Guid WhiteLabelProfileId { get; set; } 
        public string WhiteLabelProfileName { get; set; } = string.Empty;
        public string AppTheme { get; set; } = string.Empty;
        public string TimeZoneName { get; set; } = string.Empty;
        public string EmailProfileName { get; set; } = string.Empty;
        public string BankName { get; set; } = string.Empty;
        public string AddressLine1 { get; set; } = string.Empty;
        public string AddressLine2 { get; set; } = string.Empty;
        public string AddressLine3 { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Fax { get; set; } = string.Empty;
        public string BankUrl { get; set; } = string.Empty;
        public string BankLoginUrl { get; set; } = string.Empty;
        public string LoginPageLogoUrl { get; set; } = string.Empty;
        public byte[]? LoginPageLogo { get; set; }
        public string EmailLogoUrl { get; set; } = string.Empty;
        public byte[]? ReportLogo { get; set; }
    }
}
