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
	,AssignedUserId uniqueidentifier
	,CreatedByUser nvarchar(4000)
	,CreatedByUserId uniqueidentifier
	,AffectedUser nvarchar(4000)
	,AffectedUserId uniqueidentifier
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
	,PrimaryOwner nvarchar(256)
	,PrimaryOwnerId uniqueidentifier
	,SourceId uniqueidentifier
	,ScheduledStartDate datetime
	,ScheduledEndDate datetime
	,EffortRemaining float
	,EffortEstimate float
	,EffortCompleted float
	,PlannedCost float
	,ActualCost float
	,ActualDowntimeEndDate datetime
	,ActualDowntimeStartDate datetime
	,ActualEndDate datetime
	,ActualStartDate datetime
	,ContactMethod nvarchar(256)
	,Description nvarchar(4000)
	,DisplayName nvarchar(4000)
	,FirstAssignedDate datetime
	,FirstResponseDate datetime
	,IsDowntime bit
	,RequiredByDate datetime
	,ScheduledDowntimeEndDate datetime
	,ScheduledDowntimeStartDate datetime
	,ResolvedDate datetime
	,ApprovalCondition uniqueidentifier
	,ApprovalPercentage int
	,BackoutPlan nvarchar(4000)
	,ClosedDate datetime
	,Comments nvarchar(256)
	,CompletedDate datetime
	,Escalated bit
	,Impact uniqueidentifier
	,ImplementationPlan nvarchar(4000)
	,ImplementationResults uniqueidentifier
	,PostImplementationReview nvarchar(4000)
	,Reason nvarchar(4000)
	,Resolution uniqueidentifier
	,ResolutionCategory uniqueidentifier
	,ResolutionDescription nvarchar(4000)
	,Risk uniqueidentifier
	,RiskAssessmentPlan nvarchar(4000)
	,Skip bit
	,TestPlan nvarchar(4000)
	,Urgency uniqueidentifier
	,Workarounds nvarchar(4000)
);


INSERT INTO @P_SupportGroupIds 
EXEC spGet_SupportGroupIds @Id = @P_Id;

INSERT INTO @P_TeamGroupIds
EXEC spGet_TeamGroupIds @Id = @P_Id;

INSERT INTO @O_Results
EXEC [dbo].[spGet_MyRequests]
	 @UserId = @P_Id
	,@ShowInactiveItems = @P_ShowInactiveItems

-- DISPLAY Results
SELECT
	 Results.Id
	,Results.Title
	,Results.WorkItemId
	,StatusDS.DisplayString As [Status]
	,Results.PriorityId
	,Results.AssignedUser
	,Results.AssignedUserId
	,Results.CreatedByUser
	,Results.CreatedByUserId
	,Results.AffectedUser
	,Results.AffectedUserId
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
	,Results.PrimaryOwner
	,Results.PrimaryOwnerId
	,Results.SourceId
	,Results.ScheduledStartDate
	,Results.ScheduledEndDate
	,Results.EffortRemaining
	,Results.EffortEstimate
	,Results.EffortCompleted
	,Results.PlannedCost
	,Results.ActualCost
	,Results.ActualDowntimeEndDate
	,Results.ActualDowntimeStartDate
	,Results.ActualEndDate
	,Results.ActualStartDate
	,Results.ContactMethod
	,Results.Description
	,Results.DisplayName
	,Results.FirstAssignedDate
	,Results.FirstResponseDate
	,Results.IsDowntime
	,Results.RequiredByDate
	,Results.ScheduledDowntimeEndDate
	,Results.ScheduledDowntimeStartDate
	,Results.ResolvedDate
	,Results.ApprovalCondition
	,Results.ApprovalPercentage
	,Results.BackoutPlan
	,Results.ClosedDate
	,Results.Comments
	,Results.CompletedDate
	,Results.Escalated
	,Results.Impact
	,Results.ImplementationPlan
	,Results.ImplementationResults
	,Results.PostImplementationReview
	,Results.Reason
	,Results.Resolution
	,Results.ResolutionCategory
	,Results.ResolutionDescription
	,Results.Risk
	,Results.RiskAssessmentPlan
	,Results.Skip
	,Results.TestPlan
	,Results.Urgency
	,Results.Workarounds
FROM
	@O_Results As Results
LEFT JOIN DisplayString StatusDS On Results.StatusId = StatusDS.ElementID
LEFT JOIN DisplayString TierDS On Results.TierId = TierDS.ElementID
ORDER BY SupportGroup, Created DESC