namespace GPWebApi.DTO;

public class ItemNoteCreateRequest
{
	public Guid ItemId { get; set; }
	public ItemType? ItemType { get; set; }
	public string? NoteText { get; set; }
	public string CreatedByAlias { get; set; } = string.Empty;
	public bool? ViewableByCustomer { get; set; }
}

public enum ItemType
{
	AccountNumber = 1,
	GLEntry = 2,
	FXDealsALL = 3,
	FXDealCash = 4,
	FXDealToms = 5,
	FXDealSpot = 6,
	FXDealForwardOutright = 7,
	FXDealForwardWindow = 8,
	Payment = 9,
	Deposit = 10,
	Draft = 11,
	IncomingWire = 12,
	EndOfDay = 13,
	AccountHold = 14,
	DownloadFile = 15,
	FXDealQuote = 16,
	CustomerAccountNumber = 17,
	PaymentBatch = 18,
	PaymentTemplate = 19,
	User = 20,
	Customer = 21,
	DiscountedBA = 22,
	ACHBatch = 23,
	ACHEntry = 24,
	SWIFTMessage = 25,
	InstantPayment = 26,
	FileAttachment = 27,
	VerifiedLink = 28
}

public class ItemNoteCreateResponse : DTOResponseBase
{
}

