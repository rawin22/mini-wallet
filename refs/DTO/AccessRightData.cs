namespace GPWebApi.DTO
{
	public class AccessRightData
	{
		public int AccessRightId { get; set; }
		public string AccessRightName { get; set; }
		public string AccessRightCategoryName { get; set; }
		public string AccessRightDescription { get; set; }
		public long LimitAmount { get; set; }
		public bool UsesLimitAmount { get; set; }
		public bool UsesDualControl { get; set; }
		public bool CanOverrideDualControl { get; set; }
	}
}
