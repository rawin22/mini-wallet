using System.Runtime.Serialization;

namespace GPWebApi.DTO
{

	public class Problem
	{
		public int ProblemCode { get; protected set; } = 0;
		public ProblemType ProblemType { get; protected set; }
		public string Message { get; protected set; } = string.Empty;
		public string MessageDetails { get; protected set; } = string.Empty;
		public string FieldName { get; protected set; } = string.Empty;
		public string FieldValue { get; protected set; } = string.Empty;

		public Problem(int problemCode, ProblemType problemType, string message, string messageDetails)
		{
			ProblemType = problemType;
			ProblemCode = problemCode;
			Message = message;
			MessageDetails = messageDetails;
			FieldName = string.Empty;
			FieldValue = string.Empty;
		}

		public Problem(int problemCode, ProblemType problemType, string message, string messageDetails, string fieldName, string fieldValue)
		{
			ProblemType = problemType;
			ProblemCode = problemCode;
			Message = message;
			MessageDetails = messageDetails;
			FieldName = fieldName;
			FieldValue = fieldValue;
		}
	}

	public enum ProblemType
	{
		[EnumMember]
		Information = 0,
		[EnumMember]
		Error = 1,
		[EnumMember]
		Warning = 2,
	}

	public class MyProblem
	{
		public int ProblemCode { get; set; }
		public ProblemType ProblemType { get; set; }
		public string Message { get; set; }
		public string MessageDetails { get; set; }
		public string FieldName { get; set; }
		public string FieldValue { get; set; }



		//public Guid ItemNoteId { get; set; }
		//public string NoteText { get; set; }
		//public bool ViewableByCustomer { get; set; }
		//public string CreatedTime { get; set; }
		//public string CreatedBy { get; set; }
		//public string CreatedByName { get; set; }
	}

	public class ProblemsWrapper
	{
		public List<MyProblem> Problems { get; set; }
	}
}
