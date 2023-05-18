import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './ChangePassword.css'

var md5 = require('md5');

export default function ChangePassword() {
    const navigate = useNavigate()
    const [photo, setPhoto] = useState('/images/default/default-user-photo.png')
    const [username, setUsername] = useState('')

    // form data
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('');
    const [confirmPasssword, setConfirmPassword] = useState('');
    
    // password conditions
    const [uppercase, validateUppercase] = useState(false)
    const [lowercase, validateLowercase] = useState(false)
    const [number, validateNumber] = useState(false)
    const [symbol, validateSymbol] = useState(false)
    const [passlength, validatePasslength] = useState(false)
    
    // new password validity
    const [validNewPassword, validateNewPassword] = useState(false)
    const [isMatching, setIsMatching] = useState(true);

    useEffect(()=> {
        
        async function init() {
            // get user info
            const response = await fetch('/api/setting')
            const data = await response.json()

            if(response.status !== 200) {
                return alert(data)
            }

            // console.log(data[0].username, data[0].photo)
            setUsername(data[0].username)
            setPhoto(data[0].photo)
        }
        init()
    }, [])


    // state changes
    useEffect(() => {
        validateNewPassword(uppercase && lowercase && number && symbol && passlength)
    }, [uppercase, lowercase, number, symbol, passlength])

    useEffect(() => {
        validateUppercase(containsUppercase(newPassword))
        validateLowercase(containsLowercase(newPassword))
        validateNumber(containsNumber(newPassword))
        validateSymbol(containsSymbol(newPassword))
        validatePasslength(containsEightChars(newPassword))
    }, [newPassword])

    useEffect(() => {
        if(confirmPasssword !== '') {
            setIsMatching(newPassword === confirmPasssword)
        }
    }, [confirmPasssword])


    function handleOldPasswordChange(event) {
        setOldPassword(event.target.value)
    }

    function handleNewPasswordChange(event) {
        setNewPassword(event.target.value);
    }

    function handleConfirmPasswordChange(event) {
        setConfirmPassword(event.target.value);
    }

    // password validators
    function containsUppercase(str) {
        return /[A-Z]/.test(str);
    }

    function containsLowercase(str) {
        return /[a-z]/.test(str);
    }

    function containsNumber(str) {
        return /[0-9]/.test(str);
    }

    function containsSymbol(str) {
        return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(str);
    }

    function containsEightChars(str) {
        return str.length >= 8;
    }


    async function handleBtnClick() {
        const options = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ oldPassword: md5(oldPassword), newPassword: md5(newPassword) })
        }

        const response = await fetch('/api/change-password', options)
        const data = await response.json()

        if(response.status === 400) {
            navigate('/login')
        }else if(response.status !== 200) {
            return alert(data)
        }

        alert(data)
        reset()
    }
    
    function reset() {
        document.getElementById('old-password').value = ''
        document.getElementById('new-password').value = ''
        document.getElementById('confirm-password').value = ''
        validateUppercase(false)
        validateLowercase(false)
        validateNumber(false)
        validateSymbol(false)
        validatePasslength(false)
    }


    return(
        <div className="change-password">
            <div className="editor-window">
                <div className="left-column profile-image">
                    <img src={photo} alt="" />
                </div>
                <div className="right-column profile-username">
                    <p id="username">{username}</p>
                </div>
                {/* old password */}
                <div className="left-column input-label">
                    <label htmlFor="">Old password</label>
                </div>
                <div className="right-column pass-input">
                    <input type="password" id="old-password" onChange={handleOldPasswordChange}/>
                </div>
                {/* new password */}
                <div className="left-column input-label">
                    <label htmlFor="">New password</label>
                </div>
                <div className="right-column pass-input">
                    <input type="password" id="new-password" onChange={handleNewPasswordChange}/>
                    {!validNewPassword && <div className="change-pass-error-box">
                        <div className="pass-error-text"><b>Your password needs to:</b></div>
                        {!uppercase && <div><li>Contain an uppercase letter</li></div>}
                        {!lowercase && <div><li>Contain a lowercase letter</li></div>}
                        {!number && <div><li>Contain a number</li></div>}
                        {!symbol && <div><li>Contain a symbol</li></div>}
                        {!passlength && <div><li>Be at least 8 characters</li></div>}
                    </div>}
                </div>
                {/* confirm new password */}
                <div className="left-column input-label">
                    <label htmlFor="">Confirm new password</label>
                </div>
                <div className="right-column pass-input">
                    <input type="password" id="confirm-password" onChange={handleConfirmPasswordChange}/>
                    {!isMatching && <div className="pass-match-error">*Passwords do not match</div> }
                    <button type='button' onClick={handleBtnClick} disabled={!validNewPassword || !isMatching || oldPassword === ''}>Change password</button>
                    {/* <p><a href="">Forgot password?</a></p> */}
                </div>
            </div>
        </div>
    )
}