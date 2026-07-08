import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Box,
  Button,
  Collapse,
  Typography,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import FrontHandIcon from "@mui/icons-material/FrontHand";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import CheckInDialog from "../features/visits/components/CheckInDialog";
import "./Sidebar.css";

const drawerWidth = 260;
const SIDEBAR_BG = "#0B1531";
const SIDEBAR_TEXT = "#CBD5E1";
const SIDEBAR_ACTIVE_BG = "rgba(59, 130, 246, 0.18)";
const SIDEBAR_ACTIVE_TEXT = "#FFFFFF";
const SIDEBAR_HOVER_BG = "rgba(255, 255, 255, 0.06)";

interface SidebarProps {
  isMobile: boolean;
  open: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isMobile, open, onToggle }: SidebarProps) {
  const location = useLocation();
  const [openPharmacy, setOpenPharmacy] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const handleTogglePharmacy = () => setOpenPharmacy((prev) => !prev);

  const navLinks = [
    { label: "Patients", path: "/patients", icon: <PeopleIcon /> },
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
    <Box className="sidebar-container" sx={{ bgcolor: SIDEBAR_BG, color: SIDEBAR_TEXT }}>
      {/* Logo / Title */}
      <Toolbar className="sidebar-toolbar" sx={{ minHeight: 64, px: 2, justifyContent: "flex-start" }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <img src="/logo192.png" alt="App Logo" className="sidebar-logo" />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#fff", fontSize: "1.1rem" }}>
            MediCare
          </Typography>
        </Box>
      </Toolbar>

      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "0.65rem" }}>
          Management
        </Typography>
      </Box>

      {/* Navigation */}
      <List sx={{ flexGrow: 1, overflowY: "auto", px: 1.5 }}>
        {navLinks.map((link) => {
          if (!link.children) {
            const isActive = location.pathname === link.path;
            return (
              <ListItem key={link.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={Link}
                  to={link.path}
                  selected={isActive}
                  onClick={() => isMobile && onToggle()}
                  sx={{
                    borderRadius: "10px",
                    py: 1,
                    px: 1.5,
                    transition: "all 0.2s ease",
                    color: isActive ? SIDEBAR_ACTIVE_TEXT : SIDEBAR_TEXT,
                    bgcolor: isActive ? SIDEBAR_ACTIVE_BG : "transparent",
                    "&:hover": {
                      bgcolor: isActive ? SIDEBAR_ACTIVE_BG : SIDEBAR_HOVER_BG,
                      color: "#fff",
                    },
                    "&.Mui-selected": {
                      bgcolor: SIDEBAR_ACTIVE_BG,
                      color: SIDEBAR_ACTIVE_TEXT,
                      "&:hover": {
                        bgcolor: SIDEBAR_ACTIVE_BG,
                      },
                    },
                  }}
                >
                  <Box className="sidebar-icon" sx={{ color: "inherit" }}>
                    {link.icon}
                  </Box>
                  <ListItemText
                    primary={link.label}
                    primaryTypographyProps={{
                      fontSize: "0.9rem",
                      fontWeight: isActive ? 600 : 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          }

          // Pharmacy collapsible section
          const isActiveParent =
            link.children?.some((child) => location.pathname === child.path) ||
            openPharmacy;

          return (
            <Box key={link.label}>
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={handleTogglePharmacy}
                  sx={{
                    borderRadius: "10px",
                    py: 1,
                    px: 1.5,
                    transition: "all 0.2s ease",
                    color: isActiveParent ? SIDEBAR_ACTIVE_TEXT : SIDEBAR_TEXT,
                    bgcolor: isActiveParent ? SIDEBAR_ACTIVE_BG : "transparent",
                    "&:hover": {
                      bgcolor: isActiveParent ? SIDEBAR_ACTIVE_BG : SIDEBAR_HOVER_BG,
                      color: "#fff",
                    },
                  }}
                >
                  <Box className="sidebar-icon" sx={{ color: "inherit" }}>
                    {link.icon}
                  </Box>
                  <ListItemText
                    primary={link.label}
                    primaryTypographyProps={{
                      fontSize: "0.9rem",
                      fontWeight: isActiveParent ? 600 : 500,
                    }}
                  />
                  {openPharmacy ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </ListItemButton>
              </ListItem>

              <Collapse in={openPharmacy} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {link.children.map((child) => {
                    const isActive = location.pathname === child.path;
                    return (
                      <ListItem key={child.path} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                          component={Link}
                          to={child.path}
                          selected={isActive}
                          onClick={() => isMobile && onToggle()}
                          sx={{
                            pl: 5.5,
                            py: 0.8,
                            borderRadius: "8px",
                            mx: 1,
                            transition: "all 0.2s ease",
                            color: isActive ? SIDEBAR_ACTIVE_TEXT : SIDEBAR_TEXT,
                            bgcolor: isActive ? SIDEBAR_ACTIVE_BG : "transparent",
                            "&:hover": {
                              bgcolor: isActive ? SIDEBAR_ACTIVE_BG : SIDEBAR_HOVER_BG,
                              color: "#fff",
                            },
                          }}
                        >
                          <ListItemText
                            primary={child.label}
                            primaryTypographyProps={{
                              fontSize: "0.85rem",
                              fontWeight: isActive ? 600 : 500,
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              </Collapse>
            </Box>
          );
        })}
      </List>

      {/* Bottom Buttons */}
      <Box className="sidebar-footer" sx={{ bgcolor: "rgba(0,0,0,0.15)", borderColor: "rgba(255,255,255,0.08)" }}>
        <Button
          variant="contained"
          className="sidebar-btn checkin-btn"
          fullWidth
          startIcon={<FrontHandIcon />}
          sx={{ my: 0.6, bgcolor: "#1D4ED8", "&:hover": { bgcolor: "#2563EB" } }}
          onClick={() => setCheckInOpen(true)}
        >
          Check-In
        </Button>
        <Button
          variant="contained"
          className="sidebar-btn book-btn"
          fullWidth
          startIcon={<AddIcon />}
          sx={{ my: 0.6, bgcolor: "#0F766E", "&:hover": { bgcolor: "#115E59" } }}
        >
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
            bgcolor: SIDEBAR_BG,
            color: SIDEBAR_TEXT,
            boxShadow: "2px 0 16px rgba(0,0,0,0.25)",
            borderRight: "none",
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
      variant={open ? "permanent" : "temporary"}
      open={open}
      sx={{
        width: open ? drawerWidth : 0,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          bgcolor: SIDEBAR_BG,
          color: SIDEBAR_TEXT,
          borderRight: "none",
          boxShadow: "2px 0 16px rgba(0,0,0,0.12)",
          transition: "width 0.3s ease",
          overflowX: "hidden",
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
