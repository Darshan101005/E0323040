import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Typography, Card, CardContent, Box, Skeleton, Fade,
  Chip, Stack, Paper, TextField, Select, MenuItem,
  FormControl, InputLabel, useTheme
} from '@mui/material';
import { Inbox, Briefcase, Award, Calendar, Clock } from 'lucide-react';
import { Log } from '../utils/logger';

const PRIORITY_API = 'http://localhost:5000/api/priority-inbox';

const TYPE_META = {
  Placement: { icon: Briefcase, label: 'Placement' },
  Result: { icon: Award, label: 'Result' },
  Event: { icon: Calendar, label: 'Event' },
};

export default function PriorityInbox() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const purple = isDark ? '#A78BFA' : '#7C3AED';
  const purpleBg = isDark ? 'rgba(167, 139, 250, 0.08)' : 'rgba(124, 58, 237, 0.04)';
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topN, setTopN] = useState(10);
  const [typeFilter, setTypeFilter] = useState('All');

  const fetchPriorityInbox = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await Log("info", "page", "Fetching priority inbox");
      const response = await axios.get(PRIORITY_API);
      setNotifications(response.data.data || []);
      await Log("info", "api", "Priority inbox loaded");
    } catch (err) {
      setError("Unable to connect to backend. Make sure the server is running on port 5000.");
      await Log("error", "api", "Priority inbox fetch failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPriorityInbox();
  }, [fetchPriorityInbox]);

  const handleTopNChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1 && val <= 50) {
      setTopN(val);
    } else if (e.target.value === '') {
      setTopN('');
    }
  };

  const filtered = typeFilter === 'All'
    ? notifications
    : notifications.filter((n) => n.Type === typeFilter);

  const displayedNotifs = filtered.slice(0, topN || 10);

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
        <Chip label="Retry" onClick={fetchPriorityInbox} variant="outlined" size="small" sx={{ borderColor: purple, color: purple, cursor: 'pointer' }} />
      </Paper>
    );
  }

  return (
    <Fade in timeout={300}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ color: 'text.primary' }}>Priority Inbox</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Ranked by type weight (placement &gt; result &gt; event) and recency
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Type</InputLabel>
              <Select value={typeFilter} label="Type" onChange={(e) => setTypeFilter(e.target.value)}>
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Placement">Placement</MenuItem>
                <MenuItem value="Result">Result</MenuItem>
                <MenuItem value="Event">Event</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>Top</Typography>
              <TextField
                value={topN}
                onChange={handleTopNChange}
                size="small"
                type="number"
                inputProps={{ min: 1, max: 50, style: { textAlign: 'center', width: 36, padding: '6px 8px', fontSize: '0.8125rem' } }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
            </Box>
          </Box>
        </Box>

        <Stack spacing={0}>
          {displayedNotifs.map((notif, index) => {
            const meta = TYPE_META[notif.Type] || TYPE_META.Event;
            const Icon = meta.icon;
            return (
              <Card
                key={notif.ID}
                sx={{
                  borderRadius: 0,
                  border: 1,
                  borderColor: 'divider',
                  borderBottomWidth: 0,
                  bgcolor: 'background.paper',
                  transition: 'all 0.15s ease',
                  '&:first-of-type': { borderTopLeftRadius: 8, borderTopRightRadius: 8 },
                  '&:last-of-type': { borderBottomLeftRadius: 8, borderBottomRightRadius: 8, borderBottomWidth: 1 },
                  '&:hover': {
                    bgcolor: purpleBg,
                    borderColor: isDark ? 'rgba(167, 139, 250, 0.15)' : 'rgba(124, 58, 237, 0.12)',
                    '& .rank-num': { color: purple },
                    '& .priority-icon': { color: purple },
                  },
                }}
              >
                <CardContent sx={{ py: 1.75, px: 2.5, '&:last-child': { pb: 1.75 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography
                      className="rank-num"
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 500,
                        fontVariantNumeric: 'tabular-nums',
                        minWidth: 20,
                        textAlign: 'right',
                        flexShrink: 0,
                        transition: 'color 0.15s ease',
                      }}
                    >
                      {index + 1}
                    </Typography>
                    <Box className="priority-icon" sx={{ color: 'text.secondary', flexShrink: 0, display: 'flex', alignItems: 'center', transition: 'color 0.15s ease' }}>
                      <Icon size={16} strokeWidth={1.5} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 500,
                          color: 'text.primary',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {notif.Message}
                      </Typography>
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

        {displayedNotifs.length === 0 && (
          <Paper sx={{ p: 5, textAlign: 'center', border: 1, borderColor: 'divider', borderRadius: 2 }}>
            <Inbox size={24} style={{ color: theme.palette.text.secondary, marginBottom: 8 }} />
            <Typography variant="body2" color="text.secondary">No priority notifications available.</Typography>
          </Paper>
        )}
      </Box>
    </Fade>
  );
}