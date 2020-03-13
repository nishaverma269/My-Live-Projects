USE [DATABASE]
GO
/****** Object:  StoredProcedure [dbo].[aspnet_Users_CreateFavorites]    Script Date: 2/20/2020 5:06:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Nisha Verma
-- Create date: 02/20/2020
-- Description:	Create User Favorites
-- =============================================
ALTER PROCEDURE [Users_CreateFavorites] 
	-- Add the parameters for the stored procedure here
	@Url nvarchar(50) = null, 
	@Title nvarchar(50) = null,
	@ActionTypeId TINYINT,
	@UserId UNIQUEIDENTIFIER
AS
	DECLARE @UtcNow DATETIME = GETUTCDATE(), @ActionType TINYINT;
BEGIN
	-- Check if the URL already exists in Database for the User
    IF( EXISTS( SELECT [Url] FROM userFavorites WHERE @Url = [Url] AND @UserId = WhoCreated) )
	BEGIN
		IF @ActionTypeId = 1  
			RETURN -1
		ELSE IF @ActionTypeId = 2
			BEGIN 
				SET @ActionType = 2
				UPDATE userFavorites SET Title = @Title Where @Url = [Url] AND @UserId = WhoCreated

				RETURN 0
			END	
		ELSE IF @ActionTypeId = 3
			BEGIN 
				SET @ActionType = 3 
				UPDATE userFavorites SET WhenDeleted = @UtcNow Where @Url = [Url] AND @UserId = WhoCreated AND WhenDeleted IS NULL 

				RETURN 0
			END	
	END
	
	-- If Url doesn't exists in Database for the User
    INSERT userFavorites ([Url], Title, WhenCreated, WhoCreated, WhenDeleted)
    VALUES (@Url, @Title, @UtcNow, @UserId, NULL)


    RETURN 0
END