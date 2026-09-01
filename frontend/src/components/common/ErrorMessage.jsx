import React from 'react';
import { Alert, Box, Button } from '@mui/material';

export const ErrorMessage = ({ message, onRetry, variant = 'outlined' }) => {
  return (
    <Box my={2}>
      <Alert severity="error" variant={variant}>
        {message || 'An error occurred. Please try again.'}
        {onRetry && (
          <Box mt={1}>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={onRetry}
            >
              Retry
            </Button>
          </Box>
        )}
      </Alert>
    </Box>
  );
};

export default ErrorMessage;
