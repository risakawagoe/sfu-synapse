import React, { useEffect, useState } from 'react'
import './EditProfile.css'
import PopupWindow from '../../components/PopupWindow/PopupWindow'

export default function EditProfile() {
    const wordLimit = 150

    const [photo, setPhoto] = useState('/images/default/default-user-photo.png')
    const [username, setUsername] = useState('')
    const [currentUsername, setCurrentUsername] = useState('')
    const [bio, setBio] = useState('')

    const [popupWindowState, setPopupWindowState] = useState(false)

    function showPopupWindow() {
        setPopupWindowState(true)
    }

    const closePopupWindow = () => {
        setPopupWindowState(false)
    }

    useEffect(() => {
        async function init() {
            // get user info
            const response = await fetch('/api/setting')
            const data = await response.json()

            if(response.status !== 200) {
                return alert(data)
            }

            // console.log(data[0].username, data[0].bio, data[0].photo)
            setCurrentUsername(data[0].username)
            setUsername(data[0].username)
            setPhoto(data[0].photo)
            if(data[0].bio) {
                setBio(data[0].bio)
            }
        }

        init()
    }, [])

    function handleBioChange(event) {
        setBio(event.target.value)
    }

    function handleUsernameChange(event) {
        setUsername(event.target.value)
    }

    function updatePhoto(path) {
        setPhoto(path)
    }

    async function handleSaveSettings() {
        // console.log(username, bio)

        const options = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, bio: bio })
        }

        const response = await fetch('/api/setting', options)
        const data = await response.json()

        if(response.status !== 200) {
            return alert(data)
        }

        setCurrentUsername(username)
        alert(data)
        
    }


    return(
        <div className="edit-profile">
            <div className="editor-window">
                <div className="left-column profile-image">
                    <img src={photo} alt="user profile photo" />
                </div>
                <div className="right-column profile-username">
                    <p>{currentUsername}</p>
                    <a onClick={showPopupWindow}>Change profile photo</a>
                </div>
                <div className="left-column profile-input-label">
                <label htmlFor="">Username</label>
                </div>
                <div className="right-column profile-input">
                    <input type="text" defaultValue={username} onChange={handleUsernameChange} />
                </div>
                <div className="left-column profile-textarea-label">
                    <label htmlFor="">Bio</label>
                </div>
                <div className="right-column profile-textarea">
                    <textarea cols="30" rows="5" defaultValue={bio} onChange={handleBioChange}></textarea>
                    <small><span className={bio.length <= wordLimit ? 'valid-length' : 'invalid-length'}>{bio.length}</span> / {wordLimit}</small>
                    <button type='button' id='saveProfileBtn' disabled={bio.length > wordLimit || username.length === 0} onClick={handleSaveSettings}>Save</button>
                </div>
            </div>

            {popupWindowState && <PopupWindow notifyClosure={closePopupWindow} notifyChange={updatePhoto} />}
        </div>
    )
}