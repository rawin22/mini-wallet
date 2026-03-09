namespace GPWebApi.DTO;

public class CurrencyData
{
    public string CurrencyCode { get; set; } = string.Empty;
    public string CurrencyName { get; set; } = string.Empty;
    public int CurrencyAmountScale { get; set; } = 0;
    public int CurrencyRateScale { get; set; } = 0;
    public string Symbol { get; set; } = string.Empty;
    public string PaymentCutoffTime { get; set; } = string.Empty;
    public int SettlementDaysToAdd { get; set; } = 0;
}

