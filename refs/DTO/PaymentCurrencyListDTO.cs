namespace GPWebApi.DTO;

public class PaymentCurrencyListResponse : DTOResponseBase
{
	public List<CurrencyData> Currencies { get; set; } = new List<CurrencyData>();
}