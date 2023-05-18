// modules
import React from "react";
import { useLocation } from "react-router-dom";

// stylesheet
import './LoginSignupWindow.css'

// components
import Signup from "../../pages/Signup/Signup";
import Login from "../../pages/Login/Login";

// assets
import appLogo from "../../images/app_logo.png"


export default function LoginSignupWindow() {
    const path = useLocation().pathname
    const loginPage = (path === '/login')
    const signupPage = (path === '/signup')

    var header = signupPage ? 'Sign up': 'Log in'

    return (
        <div className="login-signup-layout">
            <section className="login-signup-window">
                <h1>{header}</h1>
                <form>
                    {/* display different cntent depending on path */}
                    {signupPage && <Signup />}
                    {loginPage && <Login />}

                    <div className="logo-area">
                        <img src={appLogo} alt="" id="logoPrint" />
                    </div>
                </form>
            </section>
        </div>
    )
}