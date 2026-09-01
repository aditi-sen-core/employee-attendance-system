import React from 'react';
import { Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const statusConfig = {
  PRESENT: {
    label: 'Present',
    color: 'success',
    icon: <CheckCircleIcon />,
  },
  ABSENT: {
    label: 'Absent',
    color: 'error',
    icon: <CancelIcon />,
  },
  HALF_DAY: {
    label: 'Half Day',
    color: 'warning',
    icon: <AccessTimeIcon />,
  },
  PENDING: {
    label: 'Pending',
    color: 'default',
    icon: <HourglassEmptyIcon />,
  },
  APPROVED: {
    label: 'Approved',
    color: 'success',
    icon: <CheckCircleIcon />,
  },
  REJECTED: {
    label: 'Rejected',
    color: 'error',
    icon: <CancelIcon />,
  },
};

export const StatusChip = ({ status, variant = 'filled' }) => {
  const config = statusConfig[status?.toUpperCase()] || statusConfig.PENDING;

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      color={config.color}
      variant={variant}
      size="small"
    />
  );
};

export default StatusChip;
