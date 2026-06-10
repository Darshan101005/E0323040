import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Typography, Card, CardContent, Chip, Box, Select, MenuItem,
  FormControl, InputLabel, Skeleton, Pagination, Stack, Fade, Paper, useTheme
} from '@mui/material';
import { Briefcase, Award, Calendar, Clock, Circle, Bell } from 'lucide-react';
import { getBrowserToken, Log } from '../utils/logger';

const NOTIFICATION_API = '/evaluation-service/notifications';
const ITEMS_PER_PAGE = 10;

const TYPE_META = {
  Placement: { icon: Briefcase, label: 'Placement' },
  Result: { icon: Award, label: 'Result' },
  Event: { icon: Calendar, label: 'Event' },
};

export default function AllNotifications() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const purple = isDark ? '#A78BFA' : '#7C3AED';
  const purpleBg = isDark ? 'rgba(167, 139, 250, 0.08)' : 'rgba(124, 58, 237, 0.04)';
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewed, setViewed] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('viewedNotifs') || '[]');
    setViewed(stored);
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await Log("info", "page", "Fetching notifications");
      const token = await getBrowserToken();
      const params = { page, limit: ITEMS_PER_PAGE };
      if (filter !== 'All') params.notification_type = filter;
      const response = await axios.get(NOTIFICATION_API, {
        headers: { 'Authorization': `Bearer ${token}` },
        params,
      });
      setNotifications(response.data.notifications || []);
      await Log("info", "api", "Notifications loaded");
    } catch (err) {
      setError("Failed to load notifications.");
      await Log("error", "api", "Notification fetch failed");
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsViewed = (id) => {
    if (!viewed.includes(id)) {
      const next = [...viewed, id];
      setViewed(next);
      localStorage.setItem('viewedNotifs', JSON.stringify(next));
      Log("info", "state", "Notification viewed");
    }
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setPage(1);
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={200} height={36} sx={{ mb: 3 }} />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} variant="rounded" height={72} sx={{ mb: 1.5, borderRadius: 2 }} />
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', border: 1, borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{error}</Typography>
        <Chip label="Retry" onClick={fetchNotifications} variant="outlined" size="small" sx={{ borderColor: purple, color: purple, cursor: 'pointer' }} />
      </Paper>
    );
  }

  return (
    <Fade in timeout={300}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ color: 'text.primary' }}>Notifications</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              {notifications.length} notification{notifications.length !== 1 ? 's' : ''} on this page
            </Typography>
          </Box>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Type</InputLabel>
            <Select value={filter} label="Type" onChange={handleFilterChange}>
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Placement">Placement</MenuItem>
              <MenuItem value="Result">Result</MenuItem>
              <MenuItem value="Event">Event</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Stack spacing={0}>
          {notifications.map((notif) => {
            const isRead = viewed.includes(notif.ID);
            const meta = TYPE_META[notif.Type] || TYPE_META.Event;
            const Icon = meta.icon;
            return (
              <Card
                key={notif.ID}
                onClick={() => markAsViewed(notif.ID)}
                sx={{
                  cursor: 'pointer',
                  borderRadius: 0,
                  border: 1,
                  borderColor: 'divider',
                  borderBottomWidth: 0,
                  bgcolor: isRead ? 'background.default' : 'background.paper',
                  transition: 'all 0.15s ease',
                  '&:first-of-type': { borderTopLeftRadius: 8, borderTopRightRadius: 8 },
                  '&:last-of-type': { borderBottomLeftRadius: 8, borderBottomRightRadius: 8, borderBottomWidth: 1 },
                  '&:hover': {
                    bgcolor: purpleBg,
                    borderColor: isDark ? 'rgba(167, 139, 250, 0.15)' : 'rgba(124, 58, 237, 0.12)',
                    '& .notif-icon': { color: purple },
                  },
                }}
              >
                <CardContent sx={{ py: 1.75, px: 2.5, '&:last-child': { pb: 1.75 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box className="notif-icon" sx={{ color: 'text.secondary', flexShrink: 0, display: 'flex', alignItems: 'center', transition: 'color 0.15s ease' }}>
                      <Icon size={16} strokeWidth={1.5} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: isRead ? 400 : 500,
                            color: 'text.primary',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {notif.Message}
                        </Typography>
                        {!isRead && (
                          <Circle size={6} fill={purple} stroke="none" style={{ flexShrink: 0 }} />
                        )}
                      </Box>
                      <Chip
                        label={meta.label}
                        size="small"
                        variant="outlined"
                        sx={{
                          mt: 0.25,
                          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                          color: 'text.secondary',
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                      <Clock size={12} style={{ color: theme.palette.text.secondary }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                        {formatTime(notif.Timestamp)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Stack>

        {notifications.length === 0 && (
          <Paper sx={{ p: 5, textAlign: 'center', border: 1, borderColor: 'divider', borderRadius: 2 }}>
            <Bell size={24} style={{ color: theme.palette.text.secondary, marginBottom: 8 }} />
            <Typography variant="body2" color="text.secondary">
              {filter !== 'All' ? `No ${filter.toLowerCase()} notifications.` : 'No notifications.'}
            </Typography>
          </Paper>
        )}

        {notifications.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={5}
              page={page}
              onChange={(_, v) => setPage(v)}
              size="small"
              shape="rounded"
              sx={{
                '& .MuiPaginationItem-root': {
                  fontSize: '0.75rem',
                  minWidth: 28,
                  height: 28,
                },
                '& .Mui-selected': {
                  bgcolor: `${purple} !important`,
                  color: '#fff !important',
                },
              }}
            />
          </Box>
        )}
      </Box>
    </Fade>
  );
}