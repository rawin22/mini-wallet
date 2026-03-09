namespace GPWebApi.DTO;

public class CurrencyAmountResponse
{
    public decimal Amount { get; set; }
    public string CurrencyCode { get; set; }
    public int CurrencyScale { get; set; }
    public string AmountText {  get; set; }
    public string AmountTextWithCommas { get; set; }
    public string AmountTextWithCCY { get; set; }
    public string AmountTextWithCommasAndCCY { get; set; }
}

public class CurrencyAmountRequest
{
    public decimal Amount { get; set; } = 0;
    public string CurrencyCode { get; set; } = string.Empty;
}