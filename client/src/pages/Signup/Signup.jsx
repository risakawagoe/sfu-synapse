import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './Signup.css'

var md5 = require('md5');


export default function Signup() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('')
    const [fname, setFname] = useState('')
    const [lname, setLname] = useState('')
    const [email, setEmail] = useState('');
    const [isSfuEmail, setIsSfuEmail] = useState(false);
    const [isSamePassword, setIsSamePassword] = useState(true);
    const [password, setPassword] = useState('');
    const [confirmPasssword, setConfirmPassword] = useState('');
    const [passContainsUppercase, setPassContainsUppercase] = useState(false);
    const [passContainsLowercase, setPassContainsLowercase] = useState(false);
    const [passContainsNumber, setPassContainsNumber] = useState(false);
    const [passContainsSymbol, setPassContainsSymbol] = useState(false);
    const [passContainsEightChars, setPassContainsEightChars] = useState(false);
    const [passErrorVisible, setPassErrorVisible] = useState(true);
    const [code, setCode] = useState('')

    useEffect(() => {
        if (email.endsWith('@sfu.ca') && email.length > '@sfu.ca'.length && !(email.indexOf(' ') >= 0)) {
            // ends with @sfu.ca display success
            setIsSfuEmail(true);
        } else {
            // does not end with @sfu.ca display failure
            setIsSfuEmail(false);
        }
    }, [email])

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

    useEffect(() => {
        if (confirmPasssword !== '' && password !== confirmPasssword) {
            setIsSamePassword(false);
        } else if (password === confirmPasssword) {
            setIsSamePassword(true);
        }
        containsUppercase(password) ? setPassContainsUppercase(true) : setPassContainsUppercase(false);
        containsLowercase(password) ? setPassContainsLowercase(true) : setPassContainsLowercase(false);
        containsNumber(password) ? setPassContainsNumber(true) : setPassContainsNumber(false);
        containsSymbol(password) ? setPassContainsSymbol(true) : setPassContainsSymbol(false);
        containsEightChars(password) ? setPassContainsEightChars(true) : setPassContainsEightChars(false);

    }, [password, confirmPasssword]);

    useEffect(() => {
        if (passContainsUppercase && passContainsLowercase && passContainsNumber && passContainsSymbol && passContainsEightChars)
            setPassErrorVisible(false);
        else
            setPassErrorVisible(true);
    }, [passContainsUppercase, passContainsLowercase, passContainsNumber, passContainsSymbol, passContainsEightChars]);
    

    function handleEmailChange(event) {
        setEmail(event.target.value.trim());
    }

    async function sendEmailCode() {
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        }
        const response = await fetch('/api/auth', options)
        const data = await response.json()

        if(response !== 200) {
            return alert(data)
        }

        // console.log(data)
    }

    function handleUsernameChange(event) {
        setUsername(event.target.value)
    }
    function handleFnameChange(event) {
        setFname(event.target.value)
    }
    function handleLnameChange(event) {
        setLname(event.target.value)
    }
    function handlePasswordChange(event) {
        setPassword(event.target.value);
    }

    function handleConfirmPasswordChange(event) {
        setConfirmPassword(event.target.value);
    }

    function handleCodeChange(event) {
        setCode(event.target.value)
    }

    async function handleSignup() {
        if (!isSamePassword || confirmPasssword === '' || !isSfuEmail || passErrorVisible) {
            return;
        }
        const username = document.getElementById("username").value;
        const firstName = document.getElementById("fname").value;
        const lastName = document.getElementById("lname").value;

        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, userpass: md5(password), first_name: firstName, last_name: lastName, email: email.trim(), code: code })
        }

        const response = await fetch('/api/signup', options)
        const data = await response.json()
        if(response.status !== 200) {
            alert(data)
            return
        }

        navigate("/signup/setup", {replace: true})
    }

    return (
        <>
            <div>
                <label htmlFor="username">Username</label>
                <input type="text" id="username" onChange={handleUsernameChange}/>
                <p className="err-msg"></p>
            </div>
            <div>
                <label htmlFor="password">Password</label>
                <input type="password" id="password" onChange={handlePasswordChange}/>
                {passErrorVisible && <div className="pass-error-box">
                    {passErrorVisible && <div className="pass-error-text"><b>Your password needs to:</b></div>}
                    {!passContainsUppercase && <div><li>Contain an uppercase letter</li></div>}
                    {!passContainsLowercase && <div><li>Contain a lowercase letter</li></div>}
                    {!passContainsNumber && <div><li>Contain a number</li></div>}
                    {!passContainsSymbol && <div><li>Contain a symbol</li></div>}
                    {!passContainsEightChars && <div><li>Be at least 8 characters</li></div>}
                </div>}
                <p className="err-msg"></p>
            </div>
            <div>
                <label htmlFor="confirmedPassword">Confirm password</label>
                <input type="password" id="confirmedPassword" onChange={handleConfirmPasswordChange}/>
                {!isSamePassword && <div className="confirm-pass-error-box"><li>Passwords do not match</li></div>}
            </div>
            <div>
                <label htmlFor="fname">First name</label>
                <input type="text" id="fname" onChange={handleFnameChange}/>
                <p className="err-msg"></p>
            </div>
            <div>
                <label htmlFor="lname">Last name</label>
                <input type="text" id="lname" onChange={handleLnameChange}/>
                <p className="err-msg"></p>
            </div>
            <div>
                <label htmlFor="email">Email <span>*valid SFU email required</span></label>
                <input type="email" id="email" onChange={handleEmailChange}/>
                <p className="err-msg"></p>
            </div>
            <section className="email-req-details">
                <h5>SFU Email Requirement</h5>
                <p>SFU Synapse is a place for SFU students to build long lasting connections. We require that every user has a valid SFU email. Click on Send code below and enter the code sent to your email address.</p>
                <div className="input-box">
                    <p className="inline-label">CODE</p>
                    <input type="number" id="code" onChange={handleCodeChange} />
                </div>
                <p className="send-code-btn-wrapper">
                    <button type="button" id="sendCodeBtn" onClick={sendEmailCode} disabled={!isSfuEmail}>Send code</button>
                    {isSfuEmail ? <span></span> : <span className="err-msg"><br></br>Invalid email</span>}
                </p>
            </section>
            <button type="button" id="signupBtn" onClick={handleSignup} disabled={!isSfuEmail || code.length === 0 || username.trim().length === 0 || fname.trim().length === 0 || lname.trim().length === 0 || passErrorVisible || confirmPasssword.length === 0 || !isSamePassword}>Sign up</button>
            <small>Already have an account? <a href="/login">Log in</a></small>
        </>
    )
}
