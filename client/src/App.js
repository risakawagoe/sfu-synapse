import React from 'react'
import { Routes, Route } from 'react-router-dom'

import MainLayout from './components/MainLayout'
import Home from './pages/Home/Home'
import ConnectionsLayout from './components/ConnectionsLayout/ConnectionsLayout'
import GroupsLayout from './components/GroupsLayout/GroupsLayout'
import SettingsLayout from './components/SettingsLayout/SettingsLayout'
import LoginSignupWindow from './components/LoginSignupWindow/LoginSignupWindow'
import AdminLogin from './pages/Login/AdminLogin'
import Chat from './pages/Chat/Chat'
import Discover from './pages/Discover/Discover'
import EditProfile from './pages/EditProfile/EditProfile'
import ChangePassword from './pages/ChangePassword/ChangePassword'
import Disconnect from './pages/Disconnect/Disconnect'
import GroupsSettings from './pages/GroupsSettings/GroupsSettings'
import Join from './pages/Join/Join'

import './App.css'
import Admin from './pages/Admin/Admin'
import AccountSetup from './pages/Signup/AccountSetup'
import EditCourseEnrollment from './pages/EditCourseEnrollment/EditCourseEnrollment'
import DevDatabaseManager from './pages/DEV_DB/DevDatabaseManager'
import Logout from './pages/Logout/Logout'
import DeleteAccount from './pages/DeleteAccount/DeleteAccount'

export default function App() {
    return (
        <div>
            <main className='main'>
                <Routes>
                    <Route path='/login' element={<LoginSignupWindow />} />
                    <Route path='/signup' element={<LoginSignupWindow />} />
                    <Route path='/signup/setup' element={<AccountSetup />} />
                    <Route path='/' element={<MainLayout />}>
                        <Route index element={<Home />} />
                        <Route path='connections' element={<ConnectionsLayout />} >
                            {/* Nested route relative to "/connection" */}
                            <Route path=':connectionId' element={<Chat />} />
                            <Route path=':connectionId/settings' element={<Disconnect />} />
                        </Route>
                        <Route path='groups' element={<GroupsLayout />} >
                            {/* Nested route relative to "/groups" */}
                            <Route path=':groupId' element={<Chat />} />
                            <Route path=':groupId/discover' element={<Discover />} />
                            <Route path=':groupId/settings' element={<GroupsSettings />} />
                        </Route>
                        <Route path='setting' element={<SettingsLayout />} >
                            {/* Nested route relative to "/setting" */}
                            <Route path='edit-profile' element={<EditProfile />} />
                            <Route path='change-password' element={<ChangePassword />} />
                            <Route path='edit-course-enrollment' element={<EditCourseEnrollment />} />
                            <Route path='delete-account' element={<DeleteAccount />} />
                            <Route path='logout' element={<Logout />} />
                        </Route>
                        <Route path='invite' element={<GroupsLayout />} >
                            {/* Nested route relative to "/invite" */}
                            <Route path=':groupId' element={<Join />} />
                        </Route>
                    </Route>

                    {/* Admin pages */}
                    <Route path='/admin/login' element={<AdminLogin />} />
                    <Route path='/admin' element={<Admin />} />
                    <Route path='/admin/database-manager' element={<DevDatabaseManager />} />
                </Routes>
            </main>
        </div>
    )
}
