// // get a user with the username(?)
// const a_user = 'SELECT * FROM Users WHERE username=?'
// // get all users in a course (?)
// const users_in_course = 'SELECT * FROM Users U, MemberOf M WHERE M.user_id=U.user_id AND M.group_id=?'



// // INSERTION
// const add_user = 'INSERT INTO Users (user_id, username, first_name, last_name, email, userpass, photo, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
// const add_member = 'INSERT INTO MemberOf(group_id, user_id) VALUES (?, ?)'
// const add_group = 'INSERT INTO `Groups`(group_id, group_name, group_description) VALUES(?, ?, ?)'
// const add_course = 'INSERT INTO Courses(course_id, duration) VALUES (?, ?)'
// const add_community = 'INSERT INTO Courses(community_id, created_by, visibility) VALUES (?, ?, ?)'