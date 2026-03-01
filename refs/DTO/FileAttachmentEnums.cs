using System.Runtime.Serialization;

namespace GPWebApi.DTO;

public enum FileAttachmentType
{
	[EnumMember]
	None = 0,
	[EnumMember]
	ProofOfIdentityFront = 1,
	[EnumMember]
	ProofOfIdentityBack = 2,
	[EnumMember]
	SelfiePhoto = 3,
	[EnumMember]
	SelfieVideo = 4,
	[EnumMember]
	ProfilePhoto = 5,
	[EnumMember]
	LiveVerificationPhoto = 6
}

public enum FileAttachmentSubType
{
	[EnumMember]
	Unknown = 0,
	[EnumMember]
	Passport = 1,
	[EnumMember]
	DriverLicense = 2
}
