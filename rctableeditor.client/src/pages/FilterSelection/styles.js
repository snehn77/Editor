import { styled } from '@mui/material/styles';
import { Box, Paper, Stack } from '@mui/material';

export const FilterContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginTop: theme.spacing(2)
}));

export const SectionHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1)
}));

export const ChipContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1)
}));

export const InputStack = styled(Stack)(({ theme }) => ({
    marginBottom: theme.spacing(2)
}));

export const ErrorBox = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    color: theme.palette.error.main,
    backgroundColor: theme.palette.error.lighter,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius
}));

export const ActionContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(4)
}));