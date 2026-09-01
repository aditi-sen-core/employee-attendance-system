import React from 'react';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';

export const StatCard = ({
  title,
  value,
  icon: Icon,
  color = 'primary',
  subtext,
  trend,
}) => {
  const theme = useTheme();

  const colorConfig = {
    primary: theme.palette.primary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    info: theme.palette.info?.main || theme.palette.primary.main,
  };

  const bgColor = colorConfig[color] || colorConfig.primary;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="caption">
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, my: 1 }}>
              {value}
            </Typography>
            {subtext && (
              <Typography variant="caption" color="textSecondary">
                {subtext}
              </Typography>
            )}
            {trend && (
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mt: 0.5,
                  color:
                    trend.positive === true
                      ? theme.palette.success.main
                      : theme.palette.error.main,
                }}
              >
                {trend.text}
              </Typography>
            )}
          </Box>
          {Icon && (
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 1,
                backgroundColor: `${bgColor}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: bgColor,
              }}
            >
              <Icon sx={{ fontSize: 28 }} />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
