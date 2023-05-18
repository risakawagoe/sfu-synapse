import React, { useEffect, useState } from "react"
import { requiresLogin } from "../../services/authentication.service";
import { useNavigate } from "react-router-dom";
import './DevDatabaseManager.css'


export default function DevDatabaseManager() {
    const navigate = useNavigate()
    const [users, setUsers] = useState([])
    const [admins, setAdmins] = useState([])
    const [connections, setConnections] = useState([])
    const [groups, setGroups] = useState([])
    const [courses, setCourses] = useState([])
    const [communities, setCommunities] = useState([])
    // const [directMessages, setDirectMessages] = useState([])
    // const [groupMessages, setGroupMessages] = useState([])
    const [memberOf, setMemberOf] = useState([])
    // const [authCodes, setAuthCodes] = useState([])

    useEffect(() => {
        const tables = [
            'Users',
            'Admins',
            'Connections',
            '`Groups`',
            'Courses',
            'DirectMessages',
            'GroupMessages',
            'MemberOf',
            'Communities',
            'AuthCodes'
        ]

        const apiBaseUrl = '/api/dev/db/'
        async function getAllData() {

            const login = await requiresLogin('admin') // logged in: false
            if(login) {
                return navigate('/admin/login', { replace: true })
            }

            // get Users tables
            // console.log(`${apiBaseUrl + tables[0]}`)
            const res1 = await fetch(`${apiBaseUrl + tables[0]}`)
            if(res1.status !== 200) return
            const data1 = await res1.json()
            // console.log(data1)
            setUsers(data1)
            
            // get Admins tables
            const res2 = await fetch(`${apiBaseUrl + tables[1]}`)
            if(res2.status !== 200) return
            const data2 = await res2.json()
            // console.log(data2)
            setAdmins(data2)
            
            
            // get Connections tables
            const res3 = await fetch(`${apiBaseUrl + tables[2]}`)
            if(res3.status !== 200) return
            const data3 = await res3.json()
            // console.log(data3)
            setConnections(data3)
            
            
            // get `Groups` tables
            const res4 = await fetch(`${apiBaseUrl + tables[3]}`)
            if(res4.status !== 200) return
            const data4 = await res4.json()
            // console.log(data4)
            setGroups(data4)
            
            
            // get Courses tables
            const res5 = await fetch(`${apiBaseUrl + tables[4]}`)
            if(res5.status !== 200) return
            const data5 = await res5.json()
            // console.log(data5)
            setCourses(data5)
            
            
            // get DirectMessages tables
            // const res6 = await fetch(`${apiBaseUrl + tables[5]}`)
            // if(res6.status !== 200) return
            // const data6 = await res6.json()
            // console.log(data6)
            // setDirectMessages(data6)
            
            
            // get GroupMessages tables
            // const res7 = await fetch(`${apiBaseUrl + tables[6]}`)
            // if(res7.status !== 200) return
            // const data7 = await res7.json()
            // console.log(data7)
            // setGroupMessages(data7)
            
            
            // get MemberOf tables
            const res8 = await fetch(`${apiBaseUrl + tables[7]}`)
            if(res8.status !== 200) return
            const data8 = await res8.json()
            // console.log(data8)
            setMemberOf(data8)
            
            // get Communities tables
            const res9 = await fetch(`${apiBaseUrl + tables[8]}`)
            if(res9.status !== 200) return
            const data9 = await res9.json()
            // console.log(data9)
            setCommunities(data9)

            // get AuthCodes tables
            // const res10 = await fetch(`${apiBaseUrl + tables[9]}`)
            // if(res10.status !== 200) return
            // const data10 = await res10.json()
            // console.log(data10)
            // setAuthCodes(data10)
        }
        getAllData()
    }, [])
    
    
    
    return (
        <div className="dev-database-manager" id="topOfPage">
            <h1>DATABASE MANAGER</h1>

            <h5>Links to tables</h5>
            <div className="links-to-tables">
                <button type="button" className="btn btn-light"><a href="#users">Users</a></button>
                <button type="button" className="btn btn-light"><a href="#admins">Admins</a></button>
                <button type="button" className="btn btn-light"><a href="#connections">Connections</a></button>
                <button type="button" className="btn btn-light"><a href="#groups">Groups</a></button>
                <button type="button" className="btn btn-light"><a href="#courses">Courses</a></button>
                <button type="button" className="btn btn-light"><a href="#communities">Communities</a></button>
                {/* <button type="button" className="btn btn-light"><a href="#directMessages">DirectMessages</a></button> */}
                {/* <button type="button" className="btn btn-light"><a href="#groupMessages">GroupMessages</a></button> */}
                {/* <button type="button" className="btn btn-light"><a href="#authCodes">AuthCodes</a></button> */}
                <button type="button" className="btn btn-light"><a href="#memberOf">MemberOf</a></button>
            </div>
            <div className="navigate-button">
                <button type="button" className="btn btn-outline-dark" onClick={() => navigate('/admin')}>Edit added course groups</button>
            </div>

            <button type="button" className="to-top-floating-btn btn btn-dark">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-bar-up" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M3.646 11.854a.5.5 0 0 0 .708 0L8 8.207l3.646 3.647a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 0 0 0 .708zM2.4 5.2c0 .22.18.4.4.4h10.4a.4.4 0 0 0 0-.8H2.8a.4.4 0 0 0-.4.4z"/>
                </svg>
                <a href="#topOfPage">To page top</a>
            </button>

            {/* Users */}
            <h2 id="users">Users</h2>
            <table class="table table-hover">
                <thead> 
                    <tr>
                    <th scope="col">#</th>
                    <th scope="col">user_id</th>
                    <th scope="col">username</th>
                    <th scope="col">first_name</th>
                    <th scope="col">last_name</th>
                    <th scope="col">email</th>
                    {/* <th scope="col">userpass</th> */}
                    <th scope="col">photo</th>
                    <th scope="col">bio</th>
                    <th scope="col">status</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((item, index) => (
                        <tr>
                        <th scope="row">{index+1}</th>
                        <td>{item.user_id}</td>
                        <td>{item.username}</td>
                        <td>{item.first_name}</td>
                        <td>{item.last_name}</td>
                        <td>{item.email}</td>
                        {/* <td>{item.userpass}</td> */}
                        <td>{item.photo}</td>
                        <td>{item.bio}</td>
                        <td>{item.status ? 'active' : 'deleted'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            
            {/* Admins */}
            <h2 id="admins">Admins</h2>
            <table class="table table-hover">
                <thead> 
                    <tr>
                    <th scope="col">#</th>
                    <th scope="col">admin_id</th>
                    <th scope="col">adminname</th>
                    <th scope="col">adminpass</th>
                    </tr>
                </thead>
                <tbody>
                    {admins.map((item, index) => (
                        <tr>
                        <th scope="row">{index+1}</th>
                        <td>{item.admin_id}</td>
                        <td>{item.adminname}</td>
                        <td>{item.adminpass}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Connections */}
            <h2 id="connections">Connections</h2>
            <table class="table table-hover">
                <thead> 
                    <tr>
                    <th scope="col">#</th>
                    <th scope="col">connection_id</th>
                    <th scope="col">userA_id</th>
                    <th scope="col">userB_id</th>
                    <th scope="col">status</th>
                    </tr>
                </thead>
                <tbody>
                    {connections.map((item, index) => (
                        <tr>
                        <th scope="row">{index+1}</th>
                        <td>{item.connection_id}</td>
                        <td>{item.userA_id}</td>
                        <td>{item.userB_id}</td>
                        <td>{item.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>


                
            {/* Groups */}
            <h2 id="groups">Groups</h2>
            <table class="table table-hover">
                <thead> 
                    <tr>
                    <th scope="col">#</th>
                    <th scope="col">group_id</th>
                    <th scope="col">group_name</th>
                    <th scope="col">group_description</th>
                    <th scope="col">photo</th>
                    </tr>
                </thead>
                <tbody>
                    {groups.map((item, index) => (
                        <tr>
                        <th scope="row">{index+1}</th>
                        <td>{item.group_id}</td>
                        <td>{item.group_name}</td>
                        <td>{item.group_description}</td>
                        <td>{item.photo}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Courses */}
            <h2 id="courses">Courses</h2>
            <table class="table table-hover">
                <thead> 
                    <tr>
                    <th scope="col">#</th>
                    <th scope="col">course_id</th>
                    <th scope="col">offered_year</th>
                    <th scope="col">offered_term</th>
                    <th scope="col">dep</th>
                    <th scope="col">num</th>
                    <th scope="col">section</th>
                    <th scope="col">title</th>
                    </tr>
                </thead>
                <tbody>
                    {courses.map((item, index) => (
                        <tr>
                        <th scope="row">{index+1}</th>
                        <td>{item.course_id}</td>
                        <td>{item.offered_year}</td>
                        <td>{item.offered_term}</td>
                        <td>{item.dep}</td>
                        <td>{item.num}</td>
                        <td>{item.section}</td>
                        <td>{item.title}</td>
                        </tr>
                    ))}
                </tbody>
            </table>


            {/* Communities */}
            <h2 id="communities">Communities</h2>
            <table class="table table-hover">
                <thead> 
                    <tr>
                    <th scope="col">#</th>
                    <th scope="col">community_id</th>
                    <th scope="col">created_by</th>
                    <th scope="col">visibility</th>
                    </tr>
                </thead>
                <tbody>
                    {communities.map((item, index) => (
                        <tr>
                        <th scope="row">{index+1}</th>
                        <td>{item.community_id}</td>
                        <td>{item.created_by}</td>
                        <td>{item.visibility}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* DirectMessages -- confidential */}
            {/* <h2 id="directMessages">DirectMessages</h2>
            <table class="table table-hover">
                <thead> 
                    <tr>
                    <th scope="col">#</th>
                    <th scope="col">id</th>
                    <th scope="col">sender_id</th>
                    <th scope="col">receiver_id</th>
                    <th scope="col">message</th>
                    </tr>
                </thead>
                <tbody>
                    {directMessages.map((item, index) => (
                        <tr>
                        <th scope="row">{index+1}</th>
                        <td>{item.id}</td>
                        <td>{item.sender_id}</td>
                        <td>{item.receiver_id}</td>
                        <td>{item.message}</td>
                        </tr>
                    ))}
                </tbody>
            </table> */}

            {/* GroupMessages -- confidential */}
            {/* <h2 id="groupMessages">GroupMessages</h2>
            <table class="table table-hover">
                <thead> 
                    <tr>
                    <th scope="col">#</th>
                    <th scope="col">id</th>
                    <th scope="col">group_id</th>
                    <th scope="col">user_id</th>
                    <th scope="col">message</th>
                    </tr>
                </thead>
                <tbody>
                    {groupMessages.map((item, index) => (
                        <tr>
                        <th scope="row">{index+1}</th>
                        <td>{item.id}</td>
                        <td>{item.group_id}</td>
                        <td>{item.user_id}</td>
                        <td>{item.message}</td>
                        </tr>
                    ))}
                </tbody>
            </table> */}

            {/* MemberOf */}
            <h2 id="memberOf">MemberOf</h2>
            <table class="table table-hover">
                <thead> 
                    <tr>
                    <th scope="col">#</th>
                    <th scope="col">group_id</th>
                    <th scope="col">user_id</th>
                    </tr>
                </thead>
                <tbody>
                    {memberOf.map((item, index) => (
                        <tr>
                        <th scope="row">{index+1}</th>
                        <td>{item.group_id}</td>
                        <td>{item.user_id}</td>
                        </tr>
                    ))}
                </tbody>
            </table>


            {/* AuthCodes - confidential */}
            {/* <h2 id="authCodes">AuthCodes</h2>
            <table class="table table-hover">
                <thead> 
                    <tr>
                    <th scope="col">#</th>
                    <th scope="col">email</th>
                    <th scope="col">code</th>
                    <th scope="col">expires</th>
                    </tr>
                </thead>
                <tbody>
                    {authCodes.map((item, index) => (
                        <tr>
                        <th scope="row">{index+1}</th>
                        <td>{item.email}</td>
                        <td>{item.code}</td>
                        <td>{item.expires}</td>
                        </tr>
                    ))}
                </tbody>
            </table> */}
        </div>
    )
}