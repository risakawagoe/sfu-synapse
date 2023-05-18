import React from 'react';
import { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { Typography, Box, List, ListItem, ListItemIcon, ListItemText, Avatar } from "@mui/material";
import ChatTopBar from "../../components/ChatTopBar/ChatTopBar";
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
import PopupWindow from '../../components/PopupWindow/PopupWindow';
import { useNavigate, useParams, useOutletContext} from "react-router-dom";

import './GroupsSettings.css'

export default function GroupsSettings() {
    const navigate = useNavigate();
    const [linkModalOpen, setLinkModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [leaveModalOpen, setLeaveModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [passModalOpen, setPassModalOpen] = useState(false);
    const [isCommunityCreator, setIsCommunityCreator] = useState(false);
    const [inviteID, setInviteID] = useState("LOADING...");
    const [leaveSuccess, setLeaveSuccess] = useState("");
    const [deleteSuccess, setDeleteSuccess] = useState("");
    const [saveSuccess, setSaveSuccess] = useState("");
    const [groupName, setGroupName] = useState("");
    const [isGroupInfoObtained, setIsGroupInfoObtained] = useState(false);
    const { groupId } = useParams();
    const [groupDescription, setGroupDescription] = useState("");
    const [communityVisibile, setCommunityVisibile] = useState(true);
    const [isCommunity, setIsCommunity] = useState(false);
    const [popupWindowState, setPopupWindowState] = useState(false);
    const [communityPhoto, setCommunityPhoto] = useState('/images/group_profile/community_random_default_1.png');
    const { notifyModalClosure } = useOutletContext();
    const [memberList, setMemberList] = useState([]);

    function showPopupWindow() {
        setPopupWindowState(true)
    }

    const closePopupWindow = () => {
        setPopupWindowState(false)
    }

    function checkIfCommunityCreator() {
        const options = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        }

        fetch(`/api/community/creator/${groupId}`, options).then(res => {
            if(res.status === 200) {
                res.json().then(data => {
                    (data.length === 0) ? setIsCommunityCreator(false) : setIsCommunityCreator(true)
                })
            } else {
                setIsCommunityCreator(false)
            }
        })
    }

    function getGroupInfo() {
        if (!isGroupInfoObtained) {
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

            fetch(`/api/groups/description/${groupId}`, options).then(res => {
                if(res.status === 200) {
                    res.json().then(data => {
                        setGroupDescription(data[0].group_description)
                    })
                } else {
                    setGroupDescription("Error getting group description")
                }
            })

            fetch(`/api/community/visibility/${groupId}`, options).then(res => {
                if(res.status === 200) {
                    res.json().then(data => {
                        if (data[0].visibility === "public")
                            setCommunityVisibile(true)
                        else 
                            setCommunityVisibile(false)
                    })
                } else {
                    setCommunityVisibile(false)
                }
            })

            fetch(`/api/community/validate/${groupId}`, options).then(res => {
                if(res.status === 200) {
                    res.json().then(data => {
                        (data.length === 0) ? setIsCommunity(false) : setIsCommunity(true)
                    })
                } else {
                    setIsCommunity(false)
                }
            })
    
            fetch(`/api/community-photo/${groupId}`, options).then(res => {
                if(res.status === 200) {
                    res.json().then(data => {
                        setCommunityPhoto(data[0].photo)
                    })
                } else {
                    // Error getting group photo
                    setCommunityPhoto('/images/group_profile/community_random_default_1.png')
                }
            })
            setIsGroupInfoObtained(true);
        }
    }

    function updateCommunityPhoto(path) {
        setCommunityPhoto(path)
    }

    useEffect(() => {
        getGroupInfo();
        checkIfCommunityCreator();
    })

    function handleLeaveGroup() {
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }

        fetch(`/api/groups/leave/${groupId}`, options).then(res => {
            if(res.status === 200) {
                res.json().then(data => {
                    data.affectedRows >= 1 ? setLeaveSuccess("Success") : setLeaveSuccess("Fail")
                })
            } else {
                setLeaveSuccess("Fail")
            }
        })
    }

    function getGroupInviteID() {
        const options = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        }

        fetch(`/api/groups/invite/${groupId}`, options).then(res => {
            if(res.status === 200) {
                res.json().then(data => {
                    setInviteID(data[0].group_id);
                })
            } else {
                setInviteID("INVITE-ERROR")
            }
        })
    }
    const handleLinkModalOpen = () => {
        getGroupInviteID();
        setLinkModalOpen(true);
    }
    const handleLinkModalClose = () => setLinkModalOpen(false);

    const handleEditModalOpen = () => {
        setEditModalOpen(true);
    }

    const handleEditModalClose = () => setEditModalOpen(false);

    const handleLeaveModalOpen = () => {
        handleLeaveGroup();
        setLeaveModalOpen(true);
    }

    const handlePassOwnershipModalOpen = () => {
        setPassModalOpen(true);
        getMemberList();
    }

    const handlePassModalClose = () => {
        setPassModalOpen(false);
    }

    const handleLeaveModalClose = () => {
        setLeaveModalOpen(false);
        notifyModalClosure()
        navigate("/", { replace: true });
    }

    const handleDeleteModalOpen = () => {
        handleDeleteCommunity();
        setDeleteModalOpen(true);
    }
    const handleDeleteModalClose = () => {
        setDeleteModalOpen(false);
        navigate("/", { replace: true });
    }
    
    function handleDeleteCommunity() {
        const options = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ group_id: groupId })
        }

        fetch(`/api/community/delete`, options).then(res => {
            if(res.status === 200) {
                res.json().then(data => {
                    // success
                    data.affectedRows >= 1 ? setDeleteSuccess("Success") : setDeleteSuccess("Fail");
                })
            } else {
                setDeleteSuccess("Fail");
            }
        })
    }

    const handleSwitchChange = (event) => {
        setCommunityVisibile(!event.target.checked);
        setSaveSuccess("");
    }

    function handleSaveButton() {
        const communityVisibileString = (communityVisibile ? "public" : "private");
        const options = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ group_id: groupId, group_name: groupName, group_description: groupDescription, visibility: communityVisibileString })
        }

        fetch(`/api/community`, options).then(res => {
            if(res.status === 200) {
                res.json().then(data => {
                    // success
                    data.affectedRows >= 1 ? setSaveSuccess("Success") : setSaveSuccess("Fail");
                })
            } else {
                setSaveSuccess("Fail");
            }
        })
    }

    async function getMemberList() {
        try {
            const response = await fetch('/api/community/member-list', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ community_id:  groupId})
                })
            const data = await response.json()
            setMemberList(data)
        } catch (err) {
            console.log(err)
        }
    }

    async function handlePassOwnership(new_owner_id, username) {

        try {
            const options = {
                method: "PUT",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({new_owner_id: new_owner_id, community_id: groupId})
            }

            const response = await fetch('/api/community/pass-ownership', options)
            if (response.status !== 200) {
                alert("Unable to pass ownership")
                return
            }
            alert(`Successfully passed ownership to ${username}`)
            navigate("/groups", {replace: true})
        } catch (err) {
            console.log(err)
        }
    }

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600,
        bgcolor: 'background.paper',
        // border: '2px solid #000',
        boxShadow: 24,
        p: 4,
        borderRadius: 5
    };

    const AntSwitch = styled(Switch)(({ theme }) => ({
        width: 28,
        height: 16,
        padding: 0,
        display: 'flex',
        '&:active': {
          '& .MuiSwitch-thumb': {
            width: 15,
          },
          '& .MuiSwitch-switchBase.Mui-checked': {
            transform: 'translateX(9px)',
          },
        },
        '& .MuiSwitch-switchBase': {
          padding: 2,
          '&.Mui-checked': {
            transform: 'translateX(12px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
              opacity: 1,
              backgroundColor: theme.palette.mode === 'dark' ? '#177ddc' : '#1890ff',
            },
          },
        },
        '& .MuiSwitch-thumb': {
          boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
          width: 12,
          height: 12,
          borderRadius: 6,
          transition: theme.transitions.create(['width'], {
            duration: 200,
          }),
        },
        '& .MuiSwitch-track': {
          borderRadius: 16 / 2,
          opacity: 1,
          backgroundColor:
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.25)',
          boxSizing: 'border-box',
        },
      }));

    return (
        <>
            <ChatTopBar />
            <div className='groups-settings-container'>
                {popupWindowState && <PopupWindow notifyClosure={closePopupWindow} notifyChange={updateCommunityPhoto}/>}
                {(isCommunity && !communityVisibile) && <Button sx={{ml: 4, mt: 4, background: "#5E9697",  "&:hover":{backgroundColor: "#11515D" }, display: "block"}} variant="contained" onClick={handleLinkModalOpen}>Get Invite Link</Button>}
                {isCommunityCreator && <Button sx={{ml: 4, mt: 4, background: "#5E9697",  "&:hover":{backgroundColor: "#11515D" }, display: "block"}} variant="contained" onClick={handleEditModalOpen}>Edit Community</Button>}
                {isCommunityCreator && <Button sx={{ml: 4, mt: 4, background: "#5E9697",  "&:hover":{backgroundColor: "#11515D" }, display: "block"}} variant="contained" onClick={handlePassOwnershipModalOpen}>Pass Ownership</Button> }
                {!isCommunityCreator ? <Button sx={{ml: 4, mt: 4, background: "#FF6057", "&:hover": {backgroundColor: "#B30000" }}} variant="contained" onClick={handleLeaveModalOpen}>Leave Group</Button> :
                <Button sx={{ml: 4, mt: 4, background: "#FF6057", "&:hover": {backgroundColor: "#B30000" }}} variant="contained" onClick={handleDeleteModalOpen}>Delete Community</Button> 
                }
            </div>
            <Modal
                open={passModalOpen}
                onClose={handlePassModalClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Member List
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }} component="div">
                    <List>
                        {memberList.map((member) => (
                            <ListItem key={member.user_id}>
                                <ListItemIcon>
                                    <Avatar alt={member.username} src={member.photo} />
                                </ListItemIcon>
                                <ListItemText primary={member.username} />
                                <Button 
                                    variant="contained" 
                                    sx={{background: "#5E9697",  "&:hover":{backgroundColor: "#11515D" }}}
                                    onClick={() => handlePassOwnership(member.user_id, member.username)}    
                                >
                                    Confirm passing
                                </Button>
                            </ListItem>
                        ))}
                    </List>
                    </Typography>
                </Box>
            </Modal>
            <Modal
                open={linkModalOpen}
                onClose={handleLinkModalClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Invite Link
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        <input className="url-input" readOnly value={"http://" + window.location.href.split("/")[2] + "/invite/" + inviteID}>
                        </input>
                    </Typography>
                </Box>
            </Modal>
            <Modal
                open={editModalOpen}
                onClose={handleEditModalClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Edit Community
                    </Typography>
                    <div className='edit-community-img-div'>
                        <img className='edit-community-img' src={communityPhoto} alt="user profile photo" />
                        <a className="change-community-photo-link" onClick={showPopupWindow}>Change community photo</a>
                    </div>
                    <TextField
                        id="outlined-controlled"
                        label="Group Name"
                        value={groupName}
                        onChange={(event) => {
                            setGroupName(event.target.value);
                            setSaveSuccess("");
                        }}
                        sx={{width: 530, mt: 3}}
                    />
                    <TextField
                        id="outlined-controlled"
                        label="Group Description"
                        value={groupDescription}
                        onChange={(event) => {
                            setGroupDescription(event.target.value);
                            setSaveSuccess("");
                        }}
                        sx={{width: 530, mt: 3, mb: 3}}
                    />
                    <Typography variant="body2" sx={{mb: 1, color: "#7f7f7f"}}>Group Visibility</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography>Private</Typography>
                        <AntSwitch onClick={handleSwitchChange} checked={!communityVisibile} inputProps={{ 'aria-label': 'ant design' }} />
                        {/* <Typography>Public</Typography> */}
                    </Stack>
                    <Button sx={{mt: 4, background: "#5E9697",  "&:hover":{backgroundColor: "#11515D" }, display: "block"}} variant="contained" onClick={handleSaveButton}>Save</Button>
                    {saveSuccess === "Success" ? <Typography variant="body2" sx={{mt: 1, color: "#11515D"}}>Changes saved.</Typography> : 
                    saveSuccess === "Fail" ? <Typography variant="body2" sx={{mt: 1, color: "#B30000"}}>Changes failed to save or no new changes.</Typography> :
                    null}
                </Box>
            </Modal>
            <Modal
                open={leaveModalOpen}
                onClose={handleLeaveModalClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Leave Group
                    </Typography>
                    {leaveSuccess === "Success" ? <Typography id="modal-modal-description" sx={{ mt: 2 }}>You have left the group.</Typography> :
                    leaveSuccess === "Fail" ? <Typography id="modal-modal-description" sx={{ mt: 2 }}>Unable to leave group. You may not be a member of this group.</Typography> :
                    null
                    }
                </Box>
            </Modal>
            <Modal
                open={deleteModalOpen}
                onClose={handleDeleteModalClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Delete Community
                    </Typography>
                    {deleteSuccess === "Success" ? <Typography id="modal-modal-description" sx={{ mt: 2 }}>Community has been deleted.</Typography> :
                    deleteSuccess === "Fail" ? <Typography id="modal-modal-description" sx={{ mt: 2 }}>Failed to delete community.</Typography> :
                    null
                    }
                </Box>
            </Modal>
        </>
    )
}