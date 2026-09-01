import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Tooltip,
} from '@mui/material';

import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LogoutIcon from '@mui/icons-material/Logout';

export const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useAuth();

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    logout();

    navigate('/login', {
      replace: true,
    });

    if (onClose) {
      onClose();
    }
  };

  // =========================================================
  // NAVIGATION
  // =========================================================

  const handleNavigation = (path) => {
    navigate(path);

    if (onClose) {
      onClose();
    }
  };

  // =========================================================
  // EMPLOYEE MENU
  // =========================================================

  const employeeMenuItems = [
    {
      label: 'Dashboard',
      icon: DashboardIcon,
      path: '/employee/dashboard',
    },
    {
      label: 'My Attendance',
      icon: AssignmentTurnedInIcon,
      path: '/employee/attendance',
    },
    {
      label: 'Apply Leave',
      icon: EventNoteIcon,
      path: '/employee/apply-leave',
    },
    {
      label: 'My Leaves',
      icon: AssignmentIcon,
      path: '/employee/leaves',
    },
    {
      label: 'Profile',
      icon: PersonIcon,
      path: '/employee/profile',
    },
  ];

  // =========================================================
  // HR MENU
  // =========================================================

  const hrMenuItems = [
    {
      label: 'Dashboard',
      icon: DashboardIcon,
      path: '/hr/dashboard',
    },
    {
      label: 'Employees',
      icon: GroupIcon,
      path: '/hr/employees',
    },
    {
      label: 'Attendance',
      icon: AssignmentTurnedInIcon,
      path: '/hr/attendance',
    },
    {
      label: 'Leave Requests',
      icon: EventNoteIcon,
      path: '/hr/leave-requests',
    },
    {
      label: 'Reports',
      icon: AssignmentIcon,
      path: '/hr/reports',
    },
  ];

  const isHR = user?.role === 'HR';

  const menuItems = isHR
    ? hrMenuItems
    : employeeMenuItems;

  // =========================================================
  // ACTIVE ROUTE
  // =========================================================

  const isActive = (path) => {
    return location.pathname === path;
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',

        display: 'flex',
        flexDirection: 'column',

        backgroundColor: '#1A2332',

        color: '#FFFFFF !important',

        overflow: 'hidden',

        boxSizing: 'border-box',
      }}
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <Box
        sx={{
          px: isOpen ? 2.5 : 1,
          pt: 3,
          pb: 2.5,

          textAlign: isOpen
            ? 'left'
            : 'center',

          flexShrink: 0,
        }}
      >
        {isOpen ? (
          <>
            <Typography
              component="div"
              sx={{
                color: '#FFFFFF !important',
                fontSize: '24px',
                fontWeight: 700,
                letterSpacing: '0.5px',
                lineHeight: 1.2,
              }}
            >
              EAS
            </Typography>

            <Typography
              component="div"
              sx={{
                color:
                  'rgba(255,255,255,0.70) !important',

                fontSize: '13px',
                fontWeight: 400,

                mt: 0.5,

                lineHeight: 1.4,
              }}
            >
              Employee Attendance
            </Typography>
          </>
        ) : (
          <Typography
            component="div"
            sx={{
              color: '#FFFFFF !important',
              fontSize: '20px',
              fontWeight: 700,
            }}
          >
            E
          </Typography>
        )}
      </Box>


      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <Box
        sx={{
          flexGrow: 1,

          overflowY: 'auto',
          overflowX: 'hidden',

          px: isOpen ? 1.5 : 1,

          '&::-webkit-scrollbar': {
            width: '5px',
          },

          '&::-webkit-scrollbar-thumb': {
            backgroundColor:
              'rgba(255,255,255,0.20)',

            borderRadius: '10px',
          },
        }}
      >

        {/* SECTION TITLE */}

        {isOpen && (
          <Typography
            component="div"
            sx={{
              px: 1.5,
              py: 1.5,

              color:
                'rgba(255,255,255,0.65) !important',

              fontSize: '12px',
              fontWeight: 700,

              letterSpacing: '0.8px',
              textTransform: 'uppercase',
            }}
          >
            {isHR
              ? 'HR Section'
              : 'Employee Section'}
          </Typography>
        )}


        {/* MENU */}

        <List
          disablePadding
          sx={{
            width: '100%',
          }}
        >

          {menuItems.map((item) => {

            const active = isActive(item.path);

            const Icon = item.icon;

            const button = (
              <ListItemButton
                onClick={() =>
                  handleNavigation(item.path)
                }

                selected={active}

                sx={{
                  minHeight: 50,

                  mb: 0.75,

                  px: isOpen
                    ? 1.5
                    : 1,

                  borderRadius: '8px',

                  justifyContent: isOpen
                    ? 'flex-start'
                    : 'center',

                  backgroundColor: active
                    ? '#1976D2'
                    : 'transparent',

                  color:
                    '#FFFFFF !important',

                  transition:
                    'background-color 0.15s ease',

                  '&:hover': {
                    backgroundColor: active
                      ? '#1565C0'
                      : 'rgba(255,255,255,0.10)',
                  },

                  '&.Mui-selected': {
                    backgroundColor: '#1976D2',
                    color:
                      '#FFFFFF !important',
                  },

                  '&.Mui-selected:hover': {
                    backgroundColor: '#1565C0',
                  },
                }}
              >

                {/* ICON */}

                <ListItemIcon
                  sx={{
                    minWidth: isOpen
                      ? 40
                      : 'auto',

                    width: isOpen
                      ? 40
                      : 'auto',

                    color:
                      '#FFFFFF !important',

                    display: 'flex',

                    alignItems: 'center',

                    justifyContent:
                      'center',

                    flexShrink: 0,
                  }}
                >
                  <Icon
                    fontSize="small"
                    sx={{
                      color:
                        '#FFFFFF !important',
                    }}
                  />
                </ListItemIcon>


                {/* TEXT */}

                {isOpen && (
                  <ListItemText
                    primary={item.label}

                    sx={{
                      margin: 0,

                      '& .MuiListItemText-primary': {
                        color:
                          '#FFFFFF !important',

                        fontSize: '15px',

                        fontWeight: active
                          ? 600
                          : 500,

                        lineHeight: 1.4,

                        whiteSpace:
                          'nowrap',

                        opacity: 1,
                      },
                    }}
                  />
                )}

              </ListItemButton>
            );


            return (
              <ListItem
                key={item.path}
                disablePadding
                sx={{
                  display: 'block',
                }}
              >

                {isOpen ? (
                  button
                ) : (
                  <Tooltip
                    title={item.label}
                    placement="right"
                    arrow
                  >
                    {button}
                  </Tooltip>
                )}

              </ListItem>
            );
          })}

        </List>

      </Box>


      {/* =====================================================
          BOTTOM SECTION — LOGOUT ONLY
      ===================================================== */}

      <Box
        sx={{
          px: isOpen ? 1.5 : 1,
          pb: 2,

          flexShrink: 0,
        }}
      >

        <Divider
          sx={{
            borderColor:
              'rgba(255,255,255,0.15)',

            mb: 2,
          }}
        />


        {/* ===================================================
            LOGOUT
        =================================================== */}

        {isOpen ? (

          <Button
            fullWidth

            variant="outlined"

            startIcon={
              <LogoutIcon
                sx={{
                  color:
                    '#FFFFFF !important',
                }}
              />
            }

            onClick={handleLogout}

            sx={{
              minHeight: 46,

              color:
                '#FFFFFF !important',

              borderColor:
                'rgba(255,255,255,0.35)',

              borderRadius: '8px',

              fontSize: '14px',

              fontWeight: 600,

              textTransform: 'uppercase',

              '&:hover': {
                borderColor: '#FFFFFF',

                backgroundColor:
                  'rgba(255,255,255,0.10)',
              },

              '& .MuiButton-startIcon': {
                color:
                  '#FFFFFF !important',
              },
            }}
          >
            Logout
          </Button>

        ) : (

          <Tooltip
            title="Logout"
            placement="right"
            arrow
          >

            <Button
              fullWidth

              onClick={handleLogout}

              sx={{
                minWidth: 0,

                minHeight: 46,

                color:
                  '#FFFFFF !important',

                borderRadius: '8px',

                '&:hover': {
                  backgroundColor:
                    'rgba(255,255,255,0.10)',
                },
              }}
            >

              <LogoutIcon
                fontSize="small"
                sx={{
                  color:
                    '#FFFFFF !important',
                }}
              />

            </Button>

          </Tooltip>
        )}

      </Box>

    </Box>
  );
};

export default Sidebar;