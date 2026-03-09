namespace GPLibrary.DataObjects
{
	public class CurrencyAmount
	{
		public decimal Amount { get; set; }
		public string AmountText { get; set; }
		public string AmountTextWithCommas { get; set; }
		public string AmountTextWithCCY { get; set; }
		public string AmountTextWithCommasAndCCY { get; set; }
		public string AmountTextSWIFT { get; set; }
		public int CurrencyId { get; set; }
		public int CurrencyScale { get; set; }
		public string CurrencyCode { get; set; }
	}
}