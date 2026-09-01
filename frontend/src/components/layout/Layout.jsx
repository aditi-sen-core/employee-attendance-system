import React, { useState } from 'react';
import { Box, Drawer } from '@mui/material';
import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleMobileToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: '#F5F7FA',
      }}
    >
      {/* Desktop Sidebar */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          width: sidebarOpen ? 250 : 70,
          flexShrink: 0,
          transition: 'width 0.3s ease',
        }}
      >
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: sidebarOpen ? 250 : 70,
            height: '100vh',
            backgroundColor: '#1A2332',
            transition: 'width 0.3s ease',
            overflowY: 'auto',
            zIndex: 1200,
          }}
        >
          <Sidebar isOpen={sidebarOpen} />
        </Box>
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        open={mobileOpen}
        onClose={handleMobileToggle}
        sx={{
          display: { xs: 'block', md: 'none' },
        }}
      >
        <Box
          sx={{
            width: 250,
            height: '100%',
            backgroundColor: '#1A2332',
          }}
        >
          <Sidebar
            isOpen={true}
            onClose={handleMobileToggle}
          />
        </Box>
      </Drawer>

      {/* Main Area */}
      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Navbar
          onSidebarToggle={handleSidebarToggle}
          onMobileMenuToggle={handleMobileToggle}
          sidebarOpen={sidebarOpen}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minWidth: 0,
            p: {
              xs: 2,
              sm: 3,
              md: 4,
            },
            backgroundColor: '#F5F7FA',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;