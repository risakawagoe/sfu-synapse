import React from "react";
import { useNavigate } from 'react-router-dom';
import "./Logout.css"

export default function Logout() {
    const navigate = useNavigate()
    
    async function handleLogout() {
        // console.log('Log out')
        const response = await fetch('/api/logout', { method: 'POST' })
        if(response.status !== 200) {
            alert('Something went wrong... Please try again')
            return
        }

        // console.log('Logged out!')
        navigate('/login')
    }

    return (
        <div className="logout">
            <h2>Log out</h2>
            <p>Would you like to log out from your account?</p>
            <button type="button" className="btn btn-outline-danger" onClick={handleLogout}>Log out</button>
        </div>
    )
}