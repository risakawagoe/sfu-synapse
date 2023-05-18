import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import './DeleteAccount.css'
var md5 = require('md5');


export default function DeleteAccount() {
    const navigate = useNavigate()
    const [password, setPassword] = useState('')

    async function deleteAccount() {
        const options = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: md5(password) })
        }
        const response = await fetch('/api/setting', options)
        const data = await response.json()

        if(response.status !== 200) {
            return alert(data)
        }

        alert(data)
        navigate('/login')
    }

    function handlePassowordChange(event) {
        setPassword(event.target.value)
    }

    return (
        <div className="delete-account">
            <h2>Delete Synapse Account</h2>
            <div className="warning">
                <div className="warning-heading">Warning!</div>
                <div className="warning-message">Are you sure? Your profile and related account information will be deleted from our site. 
                However, messages will remain visible to other users in the chat.</div>
            </div>
            <p><strong>Enter your password to confirm account deletion.</strong></p>
            <label htmlFor="password">Password</label>
            <div className="grid">
                <input type="password" id="password" className="form-control" onChange={handlePassowordChange} />
                <button type="button" className="btn btn-outline-danger" disabled={password.length === 0} onClick={deleteAccount}>Delete account</button>
            </div>
        </div>
    )
}