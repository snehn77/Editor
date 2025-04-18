import { styled } from '@mui/material/styles';
import { Box, Paper, Card, Stack, Badge } from '@mui/material';

export const PageContainer = styled(Box)(() => ({
    position: "relative"
}));

export const HeaderContainer = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(4)
}));

export const TitleContainer = styled(Box)(() => ({
    display: 'flex',
    alignItems: 'center'
}));

export const HeaderActionsContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    justifyContent: 'space-between',
    alignItems: { xs: 'flex-start', md: 'center' },
    gap: theme.spacing(2)
}));

export const ChipsStack = styled(Stack)(({ theme }) => ({
    direction: 'row',
    spacing: theme.spacing(1)
}));

export const ActionPanel = styled(Paper)(({ theme, hasChanges }) => ({
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
    borderRadius: theme.shape.borderRadius * 2,
    border: '1px solid',
    borderColor: theme.palette.divider,
    backgroundColor: hasChanges ? 'rgba(25, 118, 210, 0.04)' : 'white'
}));

export const ActionPanelContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: { xs: 'column', sm: 'row' },
    alignItems: { xs: 'stretch', sm: 'center' },
    justifyContent: 'space-between',
    gap: theme.spacing(2)
}));

export const ChangesIndicator = styled(Box)(() => ({
    display: 'flex',
    alignItems: 'center'
}));

export const ChangesBadge = styled(Badge)(({ theme }) => ({
    marginRight: theme.spacing(2)
}));

export const ChangesChipsContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1.5)
}));

export const ActionButtonsContainer = styled(Stack)(({ theme }) => ({
    direction: 'row',
    spacing: theme.spacing(1),
    display: 'flex',
    justifyContent: { xs: 'space-between', sm: 'flex-end' },
    flexWrap: 'wrap'
}));

export const TableCard = styled(Card)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius * 2,
    overflow: 'hidden',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    border: '1px solid',
    borderColor: theme.palette.divider,
    elevation: 0
}));

export const LoadingBackdrop = styled(Box)(({ theme }) => ({
    color: '#fff',
    zIndex: theme.zIndex.drawer + 1,
    flexDirection: 'column',
    gap: theme.spacing(2)
}));

export const MenuPaper = styled(Box)(({ theme }) => ({
    elevation: 3,
    borderRadius: theme.shape.borderRadius * 2,
    minWidth: 200,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
}));

export const DialogPaper = styled(Box)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius * 2
}));

export const DialogTitleContainer = styled(Box)(() => ({
    display: 'flex',
    alignItems: 'center',
    fontWeight: 600
}));

export const DialogActionsContainer = styled(Box)(({ theme }) => ({
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingBottom: theme.spacing(2)
}));