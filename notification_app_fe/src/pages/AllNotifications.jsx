import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, Card, CardContent, Chip, Box, Select, MenuItem, FormControl, InputLabel, CircularProgress, Alert } from '@mui/material';
import { getBrowserToken, Log } from '../utils/logger';

const NOTIFICATION_API = '/evaluation-service/notifications';

export default function AllNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('All');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewed, setViewed] = useState([]);

    useEffect(() => {
        const storedViewed = JSON.parse(localStorage.getItem('viewedNotifs') || '[]');
        setViewed(storedViewed);
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            await Log("info", "page", "Fetching all notifications");
            const token = await getBrowserToken();
            const response = await axios.get(NOTIFICATION_API, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(response.data.notifications || []);
        } catch (err) {
            setError("Failed to load notifications.");
            await Log("error", "api", "Failed fetching notifications");
        } finally {
            setLoading(false);
        }
    };

    const markAsViewed = (id) => {
        if (!viewed.includes(id)) {
            const newViewed = [...viewed, id];
            setViewed(newViewed);
            localStorage.setItem('viewedNotifs', JSON.stringify(newViewed));
            Log("info", "state", "Notification marked as viewed");
        }
    };

    const filteredList = filter === 'All' ? notifications : notifications.filter(n => n.Type === filter);

    const getChipColor = (type) => {
        switch (type) {
            case 'Placement': return 'success';
            case 'Result': return 'primary';
            case 'Event': return 'warning';
            default: return 'default';
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">All Notifications</Typography>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Filter Type</InputLabel>
                    <Select value={filter} label="Filter Type" onChange={(e) => setFilter(e.target.value)}>
                        <MenuItem value="All">All</MenuItem>
                        <MenuItem value="Placement">Placements</MenuItem>
                        <MenuItem value="Result">Results</MenuItem>
                        <MenuItem value="Event">Events</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {filteredList.map((notif) => {
                const isRead = viewed.includes(notif.ID);
                return (
                    <Card 
                        key={notif.ID} 
                        onClick={() => markAsViewed(notif.ID)}
                        sx={{ 
                            mb: 2, 
                            cursor: 'pointer',
                            borderLeft: '5px solid', 
                            borderColor: getChipColor(notif.Type) + '.main',
                            bgcolor: isRead ? '#f9f9f9' : '#ffffff',
                            opacity: isRead ? 0.7 : 1
                        }}
                    >
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <Chip label={notif.Type} color={getChipColor(notif.Type)} size="small" />
                                    {!isRead && <Chip label="New" color="error" size="small" sx={{ height: 20, fontSize: '0.7rem' }} />}
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                    {new Date(notif.Timestamp).toLocaleString()}
                                </Typography>
                            </Box>
                            <Typography variant="body1" fontWeight={isRead ? 'normal' : 'bold'}>
                                {notif.Message}
                            </Typography>
                        </CardContent>
                    </Card>
                );
            })}
        </Box>
    );
}