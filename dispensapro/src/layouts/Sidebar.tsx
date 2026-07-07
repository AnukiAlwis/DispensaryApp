import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Box,
  Button,
  Divider,
  Collapse,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import CheckInDialog from "../features/visits/components/CheckInDialog";
import "./Sidebar.css";

const drawerWidth = 260;

interface SidebarProps {
  isMobile: boolean;
  open: boolean; // ✅ added
  onToggle: () => void; // ✅ renamed from onClose
}

export default function Sidebar({ isMobile, open, onToggle }: SidebarProps) {
  const location = useLocation();
  const [openPharmacy, setOpenPharmacy] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const handleTogglePharmacy = () => setOpenPharmacy((prev) => !prev);

  const navLinks = [
    { label: "Patients", path: "/patients", icon: <PeopleIcon /> },
    // { label: "Visits", path: "/visits", icon: <EventIcon /> },
    {
      label: "Pharmacy",
      icon: <LocalPharmacyIcon />,
      children: [
        { label: "Medicine Management", path: "/pharmacy/medicine" },
        { label: "Distributors", path: "/pharmacy/distributors" },
        { label: "Supply Management", path: "/pharmacy/supply" },
      ],
    },
    { label: "Consults", path: "/consults", icon: <AssignmentIcon /> },
  ];

  const drawerContent = (
    <Box className="sidebar-container">
      {/* Logo / Title */}
      <Toolbar className="sidebar-toolbar">
        <img src="/logo192.png" alt="App Logo" className="sidebar-logo" />
      </Toolbar>

      <Divider sx={{ mb: 1 }} />

      {/* Navigation */}
      <List sx={{ flexGrow: 1, overflowY: "auto" }}>
        {navLinks.map((link) => {
          const isActiveParent = location.pathname.startsWith(link.path || "");

          if (!link.children) {
            return (
              <ListItem key={link.path} disablePadding>
                <ListItemButton
                  component={Link}
                  to={link.path}
                  selected={location.pathname === link.path}
                  onClick={() => isMobile && onToggle()} // ✅ use prop
                  sx={{
                    borderRadius: "10px",
                    mx: 1,
                    my: 0.3,
                    pl: 2,
                    transition: "all 0.2s ease",
                    borderLeft:
                      location.pathname === link.path
                        ? "4px solid #0D3B66"
                        : "4px solid transparent",
                    bgcolor:
                      location.pathname === link.path
                        ? "#EDF3FF"
                        : "transparent",
                    color:
                      location.pathname === link.path ? "#0D3B66" : "#334155",
                    "&:hover": {
                      bgcolor: "#F1F5FB",
                      color: "#0D3B66",
                    },
                  }}
                >
                  <Box className="sidebar-icon">{link.icon}</Box>
                  <ListItemText
                    primary={link.label}
                    primaryTypographyProps={{
                      fontSize: "0.9rem",
                      fontWeight: location.pathname === link.path ? 600 : 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          }

          // Pharmacy collapsible section
          return (
            <Box key={link.label}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={handleTogglePharmacy}
                  sx={{
                    borderRadius: "10px",
                    mx: 1,
                    my: 0.3,
                    pl: 2,
                    transition: "all 0.2s ease",
                    borderLeft: openPharmacy
                      ? "4px solid #0D3B66"
                      : "4px solid transparent",
                    bgcolor: openPharmacy ? "#EDF3FF" : "transparent",
                    color: openPharmacy ? "#0D3B66" : "#334155",
                    "&:hover": {
                      bgcolor: "#F1F5FB",
                      color: "#0D3B66",
                    },
                  }}
                >
                  <Box className="sidebar-icon">{link.icon}</Box>
                  <ListItemText
                    primary={link.label}
                    primaryTypographyProps={{
                      fontSize: "0.9rem",
                      fontWeight: openPharmacy ? 600 : 500,
                    }}
                  />
                  {openPharmacy ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </ListItemButton>
              </ListItem>

              <Collapse in={openPharmacy} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {link.children.map((child) => (
                    <ListItem key={child.path} disablePadding>
                      <ListItemButton
                        component={Link}
                        to={child.path}
                        selected={location.pathname === child.path}
                        onClick={() => isMobile && onToggle()}
                        sx={{
                          pl: 6,
                          mx: 1,
                          my: 0.3,
                          borderRadius: "8px",
                          transition: "all 0.2s ease",
                          borderLeft:
                            location.pathname === child.path
                              ? "4px solid #0D3B66"
                              : "4px solid transparent",
                          bgcolor:
                            location.pathname === child.path
                              ? "#EDF3FF"
                              : "transparent",
                          color:
                            location.pathname === child.path
                              ? "#0D3B66"
                              : "#475569",
                          "&:hover": {
                            bgcolor: "#F1F5FB",
                            color: "#0D3B66",
                          },
                        }}
                      >
                        <ListItemText
                          primary={child.label}
                          primaryTypographyProps={{
                            fontSize: "0.85rem",
                            fontWeight:
                              location.pathname === child.path ? 600 : 500,
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </Box>
          );
        })}
      </List>

      {/* Bottom Buttons */}
      <Box className="sidebar-footer">
        <Button
          variant="contained"
          className="sidebar-btn checkin-btn"
          fullWidth
          sx={{
            my: 0.8,
          }}
          onClick={() => setCheckInOpen(true)}
        >
          Check-In
        </Button>
        <Button variant="contained" className="sidebar-btn book-btn" fullWidth>
          Book Appointment
        </Button>
      </Box>

      <CheckInDialog open={checkInOpen} onClose={() => setCheckInOpen(false)} />
    </Box>
  );

  // ---- Mobile Drawer ----
  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            bgcolor: "#F9FBFD",
            color: "#334155",
            boxShadow: "2px 0 8px rgba(0,0,0,0.08)",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  // ---- Desktop Drawer ----
  return (
    <Drawer
      variant={open ? "permanent" : "temporary"} // ✅ allows collapsing on desktop
      open={open}
      sx={{
        width: open ? drawerWidth : 0,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          bgcolor: "#F9FBFD",
          color: "#334155",
          borderRight: "1px solid #E5E9F0",
          boxShadow: "2px 0 8px rgba(0,0,0,0.08)",
          transition: "width 0.3s ease",
          overflowX: "hidden",
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
