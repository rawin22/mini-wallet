namespace GPWebApi.DTO;

public class CustomerAccountBalanceGetResponse : DTOResponseBase
{
    public List<CustomerBalanceData> Balances { get; set; } = new List<CustomerBalanceData>();
}

public class CustomerBalanceData
{
    public Guid AccountId { get; set; }
    public string AccountNumber { get; set; } = string.Empty;
    public string CurrencyCode { get; set; } = string.Empty;
    public decimal Balance { get; set; } = decimal.Zero;
    public string BalanceText { get; set; } = string.Empty;
    public string BalanceTextWithCurrencyCode { get; set; } = string.Empty;
    public decimal ActiveHoldsTotal { get; set; } = decimal.Zero;
    public string ActiveHoldsTotalText {  get; set; } = string.Empty;   
    public string ActiveHoldsTotalTextWithCurrencyCode { get; set; } = string.Empty;
    public decimal BalanceAvailable { get; set; } = decimal.Zero;
    public string BalanceAvailableText {  get; set; } = string.Empty;
    public string BalanceAvailableTextWithCurrencyCode { get; set; } = string.Empty;
    public string BaseCurrencyCode { get; set; } = string.Empty;
    public decimal BalanceAvailableBase { get; set; } = decimal.Zero;
    public string BalanceAvailableBaseText { get; set; } = string.Empty;
    public string BalanceAvailableBaseTextWithCurrencyCode { get; set; } = string.Empty;
}