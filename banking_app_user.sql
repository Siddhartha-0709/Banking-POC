select 1 from DUAL;

-- create a user and grant privileges to the user for banking related operations
-- grant necessary privileges to the user for creating tables, views, and other database objects and insert, update, delete operations
-- ensure the user has the necessary permissions to perform banking operations
-- this user will be used by the application to connect to the database
-- replace 'application_user' and 'banking_password' with actual user credentials

CREATE USER application_user IDENTIFIED BY sys123;
GRANT CONNECT, RESOURCE TO application_user;
GRANT CREATE SESSION TO application_user;
GRANT CREATE TABLE TO application_user;
GRANT CREATE VIEW TO application_user;
GRANT CREATE SEQUENCE TO application_user;
GRANT CREATE PROCEDURE TO application_user;
GRANT CREATE TRIGGER TO application_user;

SELECT * FROM dba_users WHERE username = 'APPLICATION_USER';

-- Procedures for banking operations
COMMIT;

SELECT 1 FROM DUAL;