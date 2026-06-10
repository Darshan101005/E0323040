const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const Log = require('../logging_middleware/index');

require('dotenv').config({ path: path.resolve(__dirname, '../logging_middleware/.env') });

const app = express();
app.use(cors());
app.use(express.json());

const NOTIFICATION_API_URL = 'http://4.224.186.213/evaluation-service/notifications';
const MAX_INBOX_SIZE = 10;
const PRIORITY_WEIGHTS = { 'Placement': 3, 'Result': 2, 'Event': 1 };

app.get('/api/priority-inbox', async (req, res) => {
    try {
        await Log("backend", "info", "route", "Priority Inbox requested");

        const token = process.env.ACCESS_TOKEN;
        if (!token) {
            await Log("backend", "error", "auth", "Missing access token");
            return res.status(401).json({ error: "Unauthorized" });
        }

        const response = await axios.get(NOTIFICATION_API_URL, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const notifications = response.data.notifications;
        await Log("backend", "info", "service", "Notifications fetched");

        notifications.sort((a, b) => {
            const weightA = PRIORITY_WEIGHTS[a.Type] || 0;
            const weightB = PRIORITY_WEIGHTS[b.Type] || 0;

            if (weightA !== weightB) {
                return weightB - weightA; 
            }

            const timeA = new Date(a.Timestamp).getTime();
            const timeB = new Date(b.Timestamp).getTime();
            return timeB - timeA; 
        });

        const priorityInbox = notifications.slice(0, MAX_INBOX_SIZE);
        
        await Log("backend", "info", "service", "Notifications sorted");

        return res.status(200).json({
            success: true,
            count: priorityInbox.length,
            data: priorityInbox
        });

    } catch (error) {
        console.error("\n--- DEBUG ERROR ---");
        console.error(error.response?.data || error.message);
        console.error("-------------------\n");
        
        await Log("backend", "error", "handler", "Error processing inbox");
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

const PORT = 5000;
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await Log("backend", "info", "config", `Server started on ${PORT}`);
});