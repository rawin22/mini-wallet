namespace GPWebApi.DTO;

public class DTOResponseBase
{
	List<Problem> _problems = new List<Problem>();

	public List<Problem>? Problems
	{
		get { return _problems != null && _problems.Count > 0 ? _problems : null; }
	}

	internal bool HasErrors
	{
		get { return _problems != null ? _problems.Any(n => n.ProblemType == ProblemType.Error) : false; }
	}
	internal bool HasWarnings
	{
		get { return _problems != null ? _problems.Any(n => n.ProblemType == ProblemType.Warning) : false; }
	}

}
