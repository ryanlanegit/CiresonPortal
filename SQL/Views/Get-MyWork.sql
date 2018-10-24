USE ServiceManagement;

-- Analyst Query
DECLARE @P_UserNameQuery nvarchar(256) = 'ryanl%';
DECLARE @P_UserDomain nvarchar(256) = 'DOMAIN';
-- View Options
DECLARE @P_IncludeTeamItems bit = 'true';
DECLARE @P_ShowActivities bit = 'true';
DECLARE @P_ShowInactiveItems bit = 'true';

-- Do Not Modify
DECLARE @P_IncludeSupportGroupItems bit = 'false';
DECLARE @P_SupportGroupIds AS IndexedStringTableType;
DECLARE @P_TeamGroupIds AS IndexedGuidTableType;
DECLARE @P_IsScoped bit = 'false';
DECLARE @P_Id uniqueidentifier;
SELECT @P_Id = (
	SELECT TOP (1)
		 [Id]
	FROM CI$User
	WHERE
		CI$User.UserName LIKE @P_UserNameQuery AND
		DOMAIN = @P_UserDomain
);

DECLARE @O_Results table (
	 Id uniqueidentifier
	,Title nvarchar(1024)
	,WorkItemId nvarchar(25)
	,StatusId uniqueidentifier
	,PriorityId nvarchar(36)
	,AssignedUser nvarchar(4000)
	,NULL1 int
	,CreatedByUser nvarchar(4000)
	,NULL2 int
	,AffectedUser nvarchar(4000)
	,NULL3 int
	,CategoryId uniqueidentifier
	,TierId uniqueidentifier
	,LastModified datetime
	,Created datetime
	,ClassId uniqueidentifier
	,IsParent bit
	,ParentWorkItemId nvarchar(25)
	,ParentWorkItemType nvarchar(32)
	,SoonestSLOBreachTime datetime
	,SoonestSLOWarningTime datetime
	,SLOStatus nvarchar(36)
	,NULL4 int
	,NULL5 int
	,NULL6 int
	,ScheduledStartDate datetime
	,ScheduledEndDate datetime
);


INSERT INTO @P_SupportGroupIds 
EXEC spGet_SupportGroupIds @Id = @P_Id;

INSERT INTO @P_TeamGroupIds VALUES (@P_Id)

INSERT INTO @O_Results
EXEC [dbo].[spGet_GridWorkItems]
	 @Id = @P_Id
	,@SupportGroupIds = @P_SupportGroupIds
	,@TeamGroupIds = @P_TeamGroupIds
	,@IncludeSupportGroupItems = @P_IncludeSupportGroupItems
	,@IncludeTeamItems = @P_IncludeTeamItems
	,@ShowActivities = @P_ShowActivities
	,@ShowInactiveItems = @P_ShowInactiveItems
	,@IsScoped = @P_IsScoped

-- DISPLAY Results
SELECT
	 Results.Id
	,Results.WorkItemId
	,Results.Title
	,StatusDS.DisplayString As [Status]
	,Results.PriorityId
	,Results.AssignedUser
	,Results.CreatedByUser
	,Results.AffectedUser
	,Results.CategoryId
	,TierDS.DisplayString As [SupportGroup]
	,Results.LastModified
	,Results.Created
	,Results.ClassId
	,Results.IsParent
	,Results.ParentWorkItemId
	,Results.ParentWorkItemType
	,Results.SoonestSLOBreachTime
	,Results.SoonestSLOWarningTime
	,Results.SLOStatus
	,Results.ScheduledStartDate
	,Results.ScheduledEndDate
FROM
	@O_Results As Results
LEFT JOIN DisplayString StatusDS On Results.StatusId = StatusDS.ElementID
LEFT JOIN DisplayString TierDS On Results.TierId = TierDS.ElementID
ORDER BY SupportGroup, Created DESC