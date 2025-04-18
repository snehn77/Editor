import React from 'react';
import {
    Typography, Button, Grid, Card, CardContent, CardActions, Chip
} from '@mui/material';
import {
    Add as AddIcon,
    Upload as UploadIcon,
    Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
//import { useSession } from '../../context/SessionContext';
//import LoadingIndicator from '../../components/LoadingIndicator';
import {
    WelcomeSection,
    ActionButtonsContainer,
    RecentActivitySection,
    ActivityCard,
    CardHeader,
    EmptyStateContainer
} from './styles';

const Dashboard = () => {
    const navigate = useNavigate();
    const hasRecentActivity = true; // Replace with actual state from API later

    const handleStartNewSession = () => {
        // Create a new session ID before navigating to filters
        //createNewSession();
        navigate('/filters');
    };

    const handleImportSession = () => {
        navigate('/import');
    };

    //if (isLoading) {
    //    return <LoadingIndicator message="Initializing session..." />;
    //}

    return (
        <>
            <WelcomeSection>
                <Typography variant="h4" component="h1" gutterBottom>
                    Welcome to RC Table Editor
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    Use this tool to edit, review, and approve updates to tabular data.
                </Typography>

                <ActionButtonsContainer>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleStartNewSession}
                        size="large"
                    >
                        Start New Editing Session
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<UploadIcon />}
                        onClick={handleImportSession}
                        size="large"
                    >
                        Import Session
                    </Button>
                </ActionButtonsContainer>
            </WelcomeSection>

            <RecentActivitySection>
                <Typography variant="h5" gutterBottom>
                    Recent Activity
                </Typography>

                {hasRecentActivity ? (
                    <Grid container spacing={3}>
                        {[1, 2, 3].map((item) => (
                            <Grid item xs={12} md={6} lg={4} key={item}>
                                <ActivityCard variant="outlined">
                                    <CardContent>
                                        <CardHeader>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                {new Date().toLocaleDateString()}
                                            </Typography>
                                            <Chip
                                                label={item === 1 ? "Approved" : item === 2 ? "Pending" : "Rejected"}
                                                color={item === 1 ? "success" : item === 2 ? "warning" : "error"}
                                                size="small"
                                            />
                                        </CardHeader>
                                        <Typography variant="h6" gutterBottom>
                                            Process: 1274
                                        </Typography>
                                        <Typography variant="body2">
                                            Layers: BKTCN, V0RFC
                                        </Typography>
                                        <Typography variant="body2">
                                            Changes: 3 added, 2 modified, 1 removed
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            size="small"
                                            startIcon={<VisibilityIcon />}
                                            onClick={() => navigate('/history')}
                                        >
                                            View Details
                                        </Button>
                                    </CardActions>
                                </ActivityCard>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <EmptyStateContainer>
                        <Typography variant="body1" color="text.secondary">
                            No recent activity found. Start a new editing session to get started.
                        </Typography>
                    </EmptyStateContainer>
                )}
            </RecentActivitySection>
        </>
    );
};

export default Dashboard;