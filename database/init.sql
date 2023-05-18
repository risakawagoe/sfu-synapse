CREATE DATABASE IF NOT EXISTS synapse_app;

USE synapse_app;

-- excluded for submission purposes
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Admins;
DROP TABLE IF EXISTS Connections;
DROP TABLE IF EXISTS `Groups`;
DROP TABLE IF EXISTS Courses;
DROP TABLE IF EXISTS Communities;
DROP TABLE IF EXISTS DirectMessages;
DROP TABLE IF EXISTS GroupMessages;
DROP TABLE IF EXISTS AuthCodes;


CREATE TABLE Users (
	user_id VARCHAR(64),
	username VARCHAR(50) NOT NULL, -- uniqueness checked before inserting or updating in controllers
	first_name VARCHAR(50) NOT NULL,
	last_name VARCHAR(50) NOT NULL,
	email VARCHAR(64) UNIQUE NOT NULL,
    userpass VARCHAR(128) NOT NULL,
    photo VARCHAR(1024) DEFAULT '/images/default/default-user-photo.png',
	bio TINYTEXT,
	status BOOL NOT NULL DEFAULT 1,
	PRIMARY KEY (user_id)
);

CREATE TABLE Admins (
	admin_id VARCHAR(64),
	adminname VARCHAR(50) UNIQUE NOT NULL,
	adminpass VARCHAR(128) NOT NULL,
	PRIMARY KEY (admin_id)
);

CREATE TABLE Connections (
	connection_id VARCHAR(64),
	userA_id VARCHAR(64) NOT NULL,
	userB_id VARCHAR(64) NOT NULL,
	status CHAR(10) NOT NULL  DEFAULT 'pending',
	PRIMARY KEY (connection_id),
	FOREIGN KEY (userA_id) REFERENCES Users (user_id),
	FOREIGN KEY (userB_id) REFERENCES Users (user_id)
);

CREATE TABLE `Groups` (
	group_id VARCHAR(64),
	group_name VARCHAR(50) NOT NULL,
	group_description TINYTEXT,
	photo VARCHAR(1024) DEFAULT '/images/default/community/default-community-photo1.png',
	PRIMARY KEY (group_id)
);
-- using “Groups” as the table name gives an error. Apparently because groups is a reserved keyword in mysql. Use backticks (`) to refer to this table


CREATE TABLE Courses (
	course_id VARCHAR(64),
	offered_year CHAR(10) NOT NULL,
	offered_term CHAR(10) NOT NULL,
	dep CHAR(10) NOT NULL,
	num CHAR(10) NOT NULL,
	section CHAR(10) NOT NULL,
	title VARCHAR(128) NOT NULL,
	PRIMARY KEY (course_id),
	FOREIGN KEY (course_id) REFERENCES `Groups` (group_id) ON DELETE CASCADE
);

CREATE TABLE Communities (
	community_id VARCHAR(64),
	created_by VARCHAR(64) NOT NULL,
	visibility CHAR(10) NOT NULL DEFAULT 'public',
	PRIMARY KEY (community_id),
	FOREIGN KEY (community_id) REFERENCES `Groups` (group_id) ON DELETE CASCADE,
	FOREIGN KEY (created_by) REFERENCES Users (user_id)
);

CREATE TABLE DirectMessages (
	id BIGINT(20) AUTO_INCREMENT,
	sender_id VARCHAR(64) NOT NULL,
    receiver_id VARCHAR(64) NOT NULL,
	message TEXT NOT NULL,
    timestamp DATETIME NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (sender_id) REFERENCES Users (user_id),
	FOREIGN KEY(receiver_id) REFERENCES Users (user_id)
);

CREATE TABLE GroupMessages (
	id BIGINT(20) AUTO_INCREMENT,
	group_id VARCHAR(64) NOT NULL,
	user_id VARCHAR(64) NOT NULL,
	message TEXT NOT NULL,
	timestamp DATETIME NOT NULL,
	PRIMARY KEY(id),
	FOREIGN KEY (group_id) REFERENCES `Groups` (group_id) ON DELETE CASCADE,
	FOREIGN KEY (user_id) REFERENCES Users (user_id)
);

CREATE TABLE MemberOf (
	group_id VARCHAR(64),
	user_id VARCHAR(64),
	PRIMARY KEY (group_id, user_id),
	FOREIGN KEY (group_id) REFERENCES `Groups` (group_id) ON DELETE CASCADE,
	FOREIGN KEY (user_id) REFERENCES Users (user_id)
);

CREATE TABLE AuthCodes (
	email VARCHAR(64) NOT NULL,
	code CHAR(8) NOT NULL,
	expires DATETIME NOT NULL
);

INSERT INTO Admins (admin_id, adminname, adminpass) VALUES ('01', 'default-admin', 'defAdmin@synapse');

-- connect to database using docker for dev
-- mysql -h localhost -P 3306 -u root -p


flush privileges;