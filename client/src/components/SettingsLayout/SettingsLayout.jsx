import React from "react"
import { Outlet, useLocation } from "react-router-dom";
import Sidepanel from "../Sidepanel/Sidepanel"

export default function Setting() {
    const path = useLocation().pathname
    return (
        <>
            <Sidepanel settings />
            <Outlet context={{from: path}}/>
        </>
        
    )
}