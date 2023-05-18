const express = require('express')
const cors = require('cors')
const app = express()
const path = require('path')
const bodyParser = require('body-parser')
const Routes = express.Router()
const dotenv = require('dotenv')
// For building server with socketio
const http = require('http')
const { Server } = require('socket.io')
dotenv.config()


// controllers
const { getHomeContent, getApp, fetchInfo } = require('./controller/home.controller')
const { getCurrentLoginUser } = require('./controller/chat-operation/current-user.controller')
const { getUserDetails } = require('./controller/chat-operation/user-details.controller')
const { getExistingConnection, getPendingConnections, createPendingConnection, updatePendingToActive, 
    checkExistingPending, getActiveConnections, getInactiveConnections, endConnection, 
    updateActiveToInactive, updateInactiveToActive} = require('./controller/connections.controller')
const { getDirectMessages } = require('./controller/chat-operation/direct-messages.controller')
const { getGroupMessages } = require('./controller/chat-operation/group-messages.controller')
const { getLatestMessage } = require('./controller/chat-operation/latest-message.controller')
const { getGroupMembers } = require('./controller/chat-operation/group-members.controller')
const { getUnconnectedGroupMembers } = require('./controller/discover.controller')
const { userLeaveGroup, joinInviteLink, getGroupDescriptionFromID, getGroupNameFromID, getGroupInviteLink, getCourseGroups, createGroup } = require('./controller/groups.controller')
const { verifyLogin, verifyAdminLogin } = require('./controller/login.controller')
const { addSection, addCourse, deleteCourse, deleteSection, adminLogout } = require('./controller/admin.controller')
const { getSettings, updateSettings, deleteAccount, updatePassoword } = require('./controller/setting.controller')
const { createUser } = require('./controller/signup.controller')
const { fetchCourseInfo } = require('./controller/course-list.controller')
const { getDepartments, getCourses, getSections, getEnrolledCourses, addUserToCourse, removeUserFromCourse } = require('./controller/db-operation/db-courses.controller');
const { getTableData } = require('./controller/dev.controller');
const { setProfileBio } = require('./controller/account-setup.controller');
const { setUserPhoto, getUserPhoto, deleteUserPhoto } = require('./controller/db-operation/db-users.controller');
const { checkLoginStatus, logout } = require('./middleware/express-session.middleware');
const { createCommunity } = require('./controller/add-communities.controller');
const { getCommunities , joinCommunity, getCommunityDetails } = require('./controller/browse-communities.controller');
const socketController = require('./controller/chat-operation/socket-io.controller')
const session = require('express-session');
const { SendVerificationEmail } = require('./controller/email-authentication.controller')
const { getJoinedCommunities, updateCommunity, deleteCommunity, getCommunityPhotoFromId, getCommunityFromID, getCommunityVisibilityFromID, checkUserIsCommunityCreator, getCommunityPhoto, setCommunityPhoto, deleteCommunityPhoto, passOwnership, getMembers } = require('./controller/db-operation/db-communities.controller')


// socket.io to enable bidirectional communication
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
})
socketController(io)

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));
app.use('/images', express.static('public/images')) // for serving profile images stored in server
app.use(bodyParser.json())
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://sfu-synapse.uc.r.appspot.com/");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(cors({
    origin: '*',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
}))

app.use(session({
    name: 'synapse-login',
    secret: process.env.SESSION_SECRET_STRING,
    resave: false,
    maxAge: 24 * 60 * 60 * 1000,
    saveUninitialized: false
}))

// log to console [DEV]
// app.use('/', function(req,res,next){
//     console.log(req.method, 'request: ', req.url, JSON.stringify(req.body))
//     next()
// })


// Route: main
Routes.route('/')
    .get(getApp)
Routes.route('/home/:year/:term')
    .get(getHomeContent)
Routes.route('/home/info/:type/:id')
    .get(fetchInfo)

// Route: connections
Routes.route('/connections')
    .get(getPendingConnections)
    .post(createPendingConnection)
Routes.route('/connections/disconnect/:connectionId')
    .get(getExistingConnection)
Routes.route('/connections/check-pending/:sender_id/:receiver_id')
    .get(checkExistingPending)
Routes.route('/connections/inactive-connections')
    .get(getInactiveConnections)
Routes.route('/connections/active-connections/:connectionId')
    .get(getActiveConnections)
    .put(updatePendingToActive) 
Routes.route('/connections/update-inactive')
    .put(updateActiveToInactive)
Routes.route('/connections/update-active')
    .put(updateInactiveToActive)
Routes.route('/connections/chat/:sender_id/:receiver_id')
    .get(getDirectMessages)
Routes.route('/connections/chat/latest/:sender_id/:receiver_id')
    .get(getLatestMessage)
Routes.route('/connections/:connectionId/settings')
    .delete(endConnection)

// Route: groups
Routes.route('/groups/courses')
    .get(getCourseGroups)
    .post(createGroup)
Routes.route('/groups/invite/:group_id')
    .get(getGroupInviteLink)
Routes.route('/groups/discover/:group_id')
    .get(getUnconnectedGroupMembers)
Routes.route('/groups/chat/:user_id/:group_id')
    .get(getGroupMessages)
Routes.route('/group-members/:group_id')
    .get(getGroupMembers)
Routes.route('/groups/leave/:group_id')
    .post(userLeaveGroup)
Routes.route('/join/:group_id')
    .post(joinInviteLink)
Routes.route('/groups/name/:group_id')
    .get(getGroupNameFromID)
Routes.route('/groups/description/:group_id')
    .get(getGroupDescriptionFromID)

// Route: settings
Routes.route('/setting')
    .get(getSettings)
    .put(updateSettings)
    .delete(deleteAccount)
Routes.route('/change-password')
    .put(updatePassoword)

// Route: signup
Routes.route('/auth')
    .post(SendVerificationEmail)
Routes.route('/signup')
.post(createUser)
// Route: account setup
Routes.route('/course-list/:year/:term')
.get(getDepartments)
Routes.route('/course-list/:year/:term/:dep')
    .get(getCourses)
Routes.route('/course-list/:year/:term/:dep/:course')
    .get(getSections)
Routes.route('/setup/bio')
    .put(setProfileBio)
// photo file CRUD
Routes.route('/user-photo')
    .post(setUserPhoto)
    .get(getUserPhoto)
    .delete(deleteUserPhoto)

// Route: login
Routes.route('/login')
    .post(verifyLogin)
Routes.route('/checkLoginStatus/:userType')
    .get(checkLoginStatus)

Routes.route('/logout')
    .post(logout)


// Route: admin
Routes.route('/admin/login')
    .post(verifyAdminLogin)
Routes.route('/admin/logout')
    .post(adminLogout)
Routes.route('/admin')
    .post(fetchCourseInfo)
Routes.route('/admin/add-section')
    .post(addSection)
Routes.route('/admin/add-course')
    .post(addCourse)
Routes.route('/admin/delete-section')
    .post(deleteSection)
Routes.route('/admin/delete-course')
    .post(deleteCourse)

//Route: community
Routes.route('/community/add')
    .post(createCommunity)
Routes.route('/community/joined')
    .get(getJoinedCommunities)
Routes.route('/community/creator/:group_id')
    .get(checkUserIsCommunityCreator)
Routes.route('/community/visibility/:group_id')
    .get(getCommunityVisibilityFromID)
Routes.route('/community/validate/:group_id')
    .get(getCommunityFromID)
Routes.route('/community/browse')
    .get(getCommunities)
    .post(joinCommunity)
Routes.route('/community/browse/:group_id')
    .get(getCommunityDetails)
Routes.route('/community-photo')
    .get(getCommunityPhoto)
    .post(setCommunityPhoto)
    .delete(deleteCommunityPhoto)
Routes.route('/community-photo/:group_id')
    .get(getCommunityPhotoFromId)
Routes.route('/community/delete')
    .delete(deleteCommunity)
Routes.route('/community/visibility/:group_id')
    .get(getCommunityVisibilityFromID)
Routes.route('/community/')
    .put(updateCommunity)
Routes.route('/community/member-list')
    .post(getMembers)
Routes.route('/community/pass-ownership')
    .put(passOwnership)

// User specific data
Routes.route('/course/:year/:term')
    .get(getEnrolledCourses)
Routes.route('/:year/:term/:dep/:num/:section')
    .delete(removeUserFromCourse)
    .post(addUserToCourse)
Routes.route('/currentuser')
    .get(getCurrentLoginUser)
Routes.route('/userDetails/:userId')
    .get(getUserDetails)

Routes.route('/dev/db/:table')
    .get(getTableData)

app.use('/api', Routes)
app.all('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
})
app.use(express.json());

server.listen(8080, () => console.log(`Server listening on port 8080`))