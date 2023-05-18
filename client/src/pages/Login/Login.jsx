import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { requiresLogin } from "../../services/authentication.service";
import './Login.css';

var md5 = require('md5');

export default function Login() {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [userpass, setPassword] = useState('')

    useEffect(() => {
        async function init() {
            // check login status
            const login = await requiresLogin('user')
            if(!login) {
                navigate('/', { replace: true })
            }
        }
        init()
    }, [])

    function handleUsernameChange(event) {
        setUsername(event.target.value)
    }

    function handlePasswordChange(event) {
        setPassword(event.target.value)
    }

    
    async function validateLogin() {
        // console.log('validating login')

        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, userpass: md5(userpass)})
        }

        const response = await fetch('/api/login', options)
        const data = await response.json()

        if(response.status !== 200) {
            return alert(data)
        }

        navigate("/", { replace: true })
    }


    return (
        <>
            <div>
                <label htmlFor="username">Username</label>
                <input type="text" id="username" value={username} onChange={handleUsernameChange}/>
                <p className="err-msg"></p>
            </div>
            <div>
                <label htmlFor="password">Password</label>
                <input type="password" id="password" value={userpass} onChange={handlePasswordChange}/>
                <p className="err-msg"></p>
            </div>

            <button type="button" id="loginBtn" onClick={validateLogin}>Log in</button>
            <small>Don't have an account? <a href="/signup">Sign up</a></small>
        </>
    )
}
