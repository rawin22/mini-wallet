using System.ComponentModel;
using System.Runtime.Serialization;

namespace GPWebApi.DTO
{
    public class CustomerUserSearchRequest
    {
        [DefaultValue("0")]
        public int PageIndex { get; set; } = 0;
        [DefaultValue("25")]
        public int PageSize { get; set; } = 0;
        public string UserName { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string WKYCId { get; set; } = string.Empty;
        public string SortBy { get; set; } = string.Empty;
        public CustomerUserSortDirection SortDirection { get; set; } = CustomerUserSortDirection.Descending;
    }

    public enum CustomerUserSortDirection
    {
        [EnumMember]
        Ascending = 0,
        [EnumMember]
        Descending = 1
    }


    public class CustomerUserSearchResponse : DTOResponseBase
    {
        public CustomerUserSearchData Records { get; set; }
    }

    public class CustomerUserSearchData : SearchRecords
    {
        public List<CustomerUserSearchRecord> Users { get; set; }
    }

    public class CustomerUserSearchRecord
    {
        public Guid UserId { get; set; }
        public Guid CustomerId { get; set; }
        public string UserName { get; set; } = String.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string WKYCId { get; set; } = string.Empty;
        public bool IsLockedOut { get; set; }
        public bool IsEnabled { get; set; }
        public string LinkedAccessRightTemplateName { get; set; } = string.Empty;
        public string LastLogin { get; set; } = string.Empty;
    }
}
