import React, { useEffect, useState } from "react"
import { useParams } from 'react-router-dom';
import './PopupWindow.css'

export default function PopupWindow({notifyClosure, notifyChange}) {

    const isGroupSettingsPage = window.location.href.split("/")[3] === "groups"
    const isSettingsPage = window.location.href.split("/")[3] === "setting"

    const views = {
        menu: { name: 'options', heading: 'Change photo' },
        select: { name: 'select', heading: 'Select new photo' },
        remove: { name: 'remove', heading: 'Remove current photo' }
    }
    const [view, setView] = useState(views.menu)
    const [newPhoto, setNewPhoto] = useState({})
    const [isInitialized, setIsInitialized] = useState(false)
    const { groupId } = useParams();

    useEffect(()=>{
        if(!isInitialized && isGroupSettingsPage) {
            setViewOptionsMenu()
            setIsInitialized(true);
        }  
    })

    // view controllers
    function setViewRemovePhoto() {
        console.log('setViewRemovePhoto')
        setView(views.remove)
    }
    function setViewSelectPhoto() {
        console.log('setViewSelectPhoto')
        setView(views.select)
    }
    function setViewOptionsMenu() {
        console.log('setViewOptionsMenu')
        setNewPhoto({})
        setView(views.menu)
    }

    function closePopupWindow() {
        notifyClosure()
    }

    useEffect(() => {
        const close = (e) => {
          if(e.keyCode === 27){
            closePopupWindow()
          }
        }
        window.addEventListener('keydown', close)
      return () => window.removeEventListener('keydown', close)
    },[])


    // templates
    const optionsMenu = () => {
        return (
            <menu className="options-menu-view">
                <ul>
                    <li onClick={setViewSelectPhoto}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-image" viewBox="0 0 16 16">
                        <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                        <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
                        </svg>
                        <button type="button" >{views.select.heading}</button>
                    </li>
                    <li className="red" onClick={setViewRemovePhoto}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-trash3" viewBox="0 0 16 16">
                        <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
                        </svg>
                        <button type="button">{views.remove.heading}</button>
                    </li>
                </ul>
            </menu>
        )
    }

    const selectPhoto = () => {
        return (
            <div className="select-photo-view">
                <div className="preview-area">
                    <p>Preview</p>
                    <img src={newPhoto.preview} alt="" />
                </div>
                <input type="file" className="form-control" accept="images/*" onChange={handleFileChange} />
                <p><small>The maximum file size allowed is 200KB.</small></p>
                <button type="button" className="btn" onClick={updatePhoto} disabled={!newPhoto.data}>Confirm</button>
                <button type="button" className="btn" onClick={setViewOptionsMenu}>Cancel</button>
            </div>
        )
    }
    const removePhoto = () => {
        return (
            <div className="remove-photo-view">
                {isSettingsPage ? <p>Are you sure you want to remove the current profile photo?</p> : <p>Are you sure you want to remove the current community photo?</p>}
                <div className="controllers">
                    <button type="button" className="btn" onClick={deletePhoto}>Confirm</button>
                    <button type="button" className="btn" onClick={setViewOptionsMenu}>Cancel</button>
                </div>
            </div>
        )
    }


    // event handlers
    function handleFileChange(event) {
        if(event.target.files && event.target.files[0]) {
            const file = event.target.files[0]

            if(sizeInKB(file.size) <= 200) {
                const img = {
                    preview: URL.createObjectURL(file),
                    data: file
                }
                setNewPhoto(img)
                console.log(newPhoto)
            }else {
                setNewPhoto({})
                event.target.value = ''
                alert('[File size: ' + sizeInKB(file.size) + ' KB] The maximum file size allowed is 200KB.')
            }
        }else {
            setNewPhoto({})
        }
    }

    async function updatePhoto() {
        if (!newPhoto.data) return

        const data = new FormData()
        let response = {}
        let result = {}
        if(newPhoto.data && isSettingsPage) {
            data.append('file', newPhoto.data)

            const options = {
                method: 'POST',
                body: data
            }
            response = await fetch('/api/user-photo', options)
            result = await response.json()
        }
        else if(newPhoto.data && isGroupSettingsPage) {
            data.append('file', newPhoto.data)
            data.append('community_id', groupId)

            const options = {
                method: 'POST',
                body: data
            }
            response = await fetch('/api/community-photo', options)
            result = await response.json()
        }

        if(response.status !== 200) {
            alert(result)
            return
        }

        notifyChange(result) // update edit profile view
        console.log('Photo updated!')

        // close window
        closePopupWindow()
    }
    
    async function deletePhoto() {
        let response = {};
        let result = {};
        if (isSettingsPage) {
            response = await fetch('/api/user-photo', { method: 'DELETE' })
            result = await response.json()
        }
        else if (isGroupSettingsPage) {
            const options = {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ community_id:  groupId})
            }
            response = await fetch('/api/community-photo', options)
            result = await response.json()
        }
        
        if(response.status !== 200) {
            alert(result)
            return
        }
        
        notifyChange(result)


        console.log('Current photo deleted! Now it is just the default photo')

        // close window
        closePopupWindow()
    }


    // helper functions
    function sizeInKB(bytes, decimals = 2) {
        const k = 1024
        const dm = decimals < 0 ? 0 : decimals
        return parseFloat((bytes / k).toFixed(dm))
    }

    return (
        <div className="popup-window-change-photo">
            <div className="window-body">
                <div id="closeBtn" onClick={closePopupWindow}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" className="bi bi-x-circle" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                    </svg>
                </div>
                <h2>{view.heading}</h2>
                {view.name === views.menu.name && optionsMenu()}
                {view.name === views.select.name && selectPhoto()}
                {view.name === views.remove.name && removePhoto()}
            </div>
        </div>
    )
}