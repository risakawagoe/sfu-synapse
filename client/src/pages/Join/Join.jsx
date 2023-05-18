import React from 'react';
import { useState, useEffect } from 'react';
import { Typography, Box } from "@mui/material";
import ChatTopBar from "../../components/ChatTopBar/ChatTopBar";
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import { useParams, useNavigate, useOutletContext } from "react-router-dom";

import './Join.css'

export default function Join() {
    const navigate = useNavigate();
    const [modalOpen, setModalOpen] = useState(false);
    const [groupName, setGroupName] = useState("")
    const [communityPhoto, setCommunityPhoto] = useState("");
    const [joinSuccess, setJoinSuccess] = useState("Pending")
    const { groupId } = useParams();
    const { notifyModalClosure } = useOutletContext();

    function fetchCommunityPhoto() {
        const options = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        }

        fetch(`/api/community-photo/${groupId}`, options).then(res => {
            if(res.status === 200) {
                res.json().then(data => {
                    setCommunityPhoto(data[0].photo)
                })
            } else {
                setCommunityPhoto("Error getting group photo")
            }
        })
    }

    function fetchGroupName() {
        const options = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        }

        fetch(`/api/groups/name/${groupId}`, options).then(res => {
            if(res.status === 200) {
                res.json().then(data => {
                    setGroupName(data[0].group_name)
                })
            } else {
                setGroupName("Error getting group name")
            }
        })
    }

    useEffect(()=>{
        fetchGroupName();
        fetchCommunityPhoto();
    })

    function joinGroupViaLink() {
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }

        fetch(`/api/join/${groupId}`, options).then(res => {
            if(res.status === 200) {
                res.json().then(data => {
                    setJoinSuccess("Success")
                })
            } else {
                setJoinSuccess("Fail")
            }
        })
    }
    
    const handleModalOpen = () => {
        joinGroupViaLink();
        setModalOpen(true);
    }
    const handleModelClose = () => {
        setModalOpen(false);
        notifyModalClosure();
        navigate("/groups", { replace: true });
    }
    

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };
    

    return (
        <>
            <ChatTopBar inviteGroupName={groupName} inviteGroupPic={communityPhoto}/>
            <div className='groups-settings-container'>
                <Button sx={{ml: 4, mt: 4, background: "#5E9697",  "&:hover":{backgroundColor: "#11515D" }}} variant="contained" onClick={handleModalOpen}>Join Group</Button>
            </div>
            <Modal
                open={modalOpen}
                onClose={handleModelClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        {groupName}
                    </Typography>
                        {
                            joinSuccess === "Fail" ? <Typography id="modal-modal-description" sx={{ mt: 2 }}>Failed to join group. You may already be a member of this group.</Typography> :
                            joinSuccess === "Success" ? <Typography id="modal-modal-description" sx={{ mt: 2 }}>Successfully joined group!</Typography> :
                            <Typography id="modal-modal-description" sx={{ mt: 2 }}>Joining group... </Typography>
                        }
                </Box>
            </Modal>
        </>
    )
}