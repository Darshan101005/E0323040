import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, Card, CardContent, Box, CircularProgress, Alert, Badge } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { Log } from '../utils/logger';

const PRIORITY_API = 'http://localhost:5000/api/priority-inbox';

export default function PriorityInbox() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPriorityInbox();
    }, []);

    const fetchPriorityInbox = async () => {
        try {
            setLoading(true);
            await Log("info", "page", "Fetching priority inbox");
            const response = await axios.get(PRIORITY_API);
            setNotifications(response.data.data || []);
        } catch (err) {
            setError("Failed to load Priority Inbox. Ensure backend (port 5000) is running.");
            await Log("error", "api", "Failed fetching priority inbox");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
                <StarIcon color="warning" fontSize="large" />
                <Typography variant="h4" fontWeight="bold">Priority Inbox</Typography>
                <Badge badgeContent={notifications.length} color="error" sx={{ ml: 2 }} />
            </Box>

            {notifications.map((notif, index) => (
                <Card key={notif.ID} sx={{ mb: 2, bgcolor: index < 3 ? '#fff4e5' : 'white' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle2" color="primary" fontWeight="bold">
                                #{index + 1} - {notif.Type.toUpperCase()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {new Date(notif.Timestamp).toLocaleString()}
                            </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ mt: 1 }}>{notif.Message}</Typography>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
}