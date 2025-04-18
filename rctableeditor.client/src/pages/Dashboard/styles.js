import { styled } from '@mui/material/styles';
import { Box, Card } from '@mui/material';

export const WelcomeSection = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(4),
}));

export const ActionButtonsContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    marginTop: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
}));

export const RecentActivitySection = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(6),
}));

export const ActivityCard = styled(Card)(() => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.1)',
    },
}));

export const CardHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
}));

export const EmptyStateContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(4),
    textAlign: 'center',
}));