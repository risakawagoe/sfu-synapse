import React from "react";

import './SidepanelItem.css'
import tempPic from "../../images/temp.png"

export default function SidepanelItem({image=tempPic, title="Title Test", subtitle="Thanks!", indicator="12:00 pm"}) {
    return (
        <div className="sidepanel-item-wrapper">
            <img src={image} alt="user or group" className="sidepanel-item-image"/>
            <div className="sidepanel-item-text">
                <span className="sidepanel-item-title">{title}</span>
                <span className="sidepanel-item-subtitle">{subtitle}</span>
            </div>
            <div className="sidepanel-item-indicator">
                {indicator}
            </div>
        </div>
    )
}