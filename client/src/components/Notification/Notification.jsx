import React from 'react'
import { Link } from 'react-router-dom'
import Diversity1OutlinedIcon from '@mui/icons-material/Diversity1Outlined';
import RecentActorsOutlinedIcon from '@mui/icons-material/RecentActorsOutlined';
import { Box, Paper, Typography, Button } from '@mui/material'

import "./Notification.css";

export default function Notification({ isGroups }) {

    return (
        <div className="notification-container">
            <Paper elevation={3} style={{ margin: '4rem', padding: '2rem', borderRadius: '1rem' }}>
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    gap={2}
                >   
                {isGroups ? (
                    <>
                        <Diversity1OutlinedIcon style={{ fontSize: '8rem', color: '#11515c' }} />
                        <Typography variant="h6" color="textSecondary" style={{ maxWidth: '460px' }}>
                            You haven't selected a group chat yet. Please click on a group to view the chat, 
                            or click on the button to join course groups!
                        </Typography>
                        <Link to="/setting/edit-course-enrollment">
                            <Button variant="contained" style={{ backgroundColor: '#11515c'}}>
                                ADD COURSES
                            </Button>
                        </Link>
                    </>
                ) : (
                    <>
                        <RecentActorsOutlinedIcon style={{ fontSize: '8rem', color: '#11515c' }}/>
                        <Typography variant="h6" color="textSecondary" style={{ maxWidth: '460px' }}>
                            Click on any connection to start chatting or navigate to Groups tab and send messages from the Discover tab to request a connection.
                        </Typography>
                    </>
                )}
                </Box>
            </Paper>
        </div>
    )
}

