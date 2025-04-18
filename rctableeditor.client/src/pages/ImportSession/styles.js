import { styled } from '@mui/material/styles';
import { Box, Card, CardContent, Button, alpha } from '@mui/material';

export const PageContainer = styled(Box)(() => ({
    position: "relative"
}));

export const HeaderContainer = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(4)
}));

export const UploadCard = styled(Card)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius * 3,
    marginBottom: theme.spacing(3),
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid',
    borderColor: theme.palette.divider,
    elevation: 0
}));

export const CardHeaderContainer = styled(Box)(({ theme }) => ({
    padding: { xs: theme.spacing(2), sm: theme.spacing(3) },
    paddingBottom: theme.spacing(2),
    borderBottom: 1,
    borderColor: 'divider'
}));

export const UploadAreaContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(4),
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(5),
    backgroundColor: alpha(theme.palette.primary.main, 0.03)
}));

export const DropZone = styled(Box)(({ theme }) => ({
    border: '2px dashed',
    borderColor: 'primary.main',
    borderRadius: theme.shape.borderRadius * 3,
    padding: theme.spacing(5),
    width: '100%',
    maxWidth: 500,
    backgroundColor: alpha(theme.palette.primary.main, 0.03),
    textAlign: 'center',
    transition: 'all 0.2s ease',
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.05),
        transform: 'translateY(-2px)'
    },
    cursor: 'pointer'
}));

export const FilePreviewContainer = styled(Box)(() => ({
    width: '100%',
    maxWidth: 500,
    textAlign: 'center'
}));

export const FilePreviewCard = styled(Card)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadius * 2,
    border: '1px solid',
    borderColor: 'success.light',
    backgroundColor: alpha(theme.palette.success.main, 0.05),
    elevation: 0
}));

export const FileInfoContainer = styled(Box)(() => ({
    display: 'flex',
    alignItems: 'center',
    marginBottom: 2
}));

export const FileTextContainer = styled(Box)(() => ({
    textAlign: 'left',
    flex: 1
}));

export const ButtonContainer = styled(Box)(() => ({
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 2
}));

export const InfoCard = styled(Card)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius * 3,
    overflow: 'hidden',
    backgroundColor: 'grey.50',
    position: 'sticky',
    top: 24,
    border: '1px solid',
    borderColor: 'divider',
    elevation: 0
}));

export const InfoCardContent = styled(CardContent)(({ theme }) => ({
    padding: theme.spacing(3)
}));

export const LoadingBackdrop = styled(Box)(({ theme }) => ({
    color: '#fff',
    zIndex: theme.zIndex.drawer + 1,
    flexDirection: 'column',
    gap: theme.spacing(2)
}));