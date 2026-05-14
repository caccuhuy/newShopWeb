create or alter procedure sp_Log 
	@user_id varchar(20) 
	,@action nvarchar(500) 
	,@type varchar(10)
as begin 
set nocount on;
	INSERT INTO ActivityLogs (user_id, action, type) 
	VALUES (@user_id, @action, @type);
end 
go 

create or alter procedure vw_ActivityLog 
as begin
set nocount on;
	SELECT l.*, u.username as [user], u.email
	FROM ActivityLogs l
	LEFT JOIN Users u ON TRIM(l.user_id) = TRIM(u.user_id)
	ORDER BY l.timestamp DESC
end 