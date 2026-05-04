import React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Stack,
  Avatar,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";

interface TopBarProps {
  isMobile: boolean;
  onToggleSidebar: () => void;
}

export default function TopBar({ isMobile, onToggleSidebar }: TopBarProps) {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "#0C3C78", // dark blue header background
        color: "#fff",
        zIndex: (theme) => theme.zIndex.drawer + 1,
        height: 64,
        justifyContent: "center",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
        }}
      >
        {/* Left side — menu toggle */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton
            onClick={onToggleSidebar}
            sx={{ color: "white", mr: 1 }}
            edge="start"
          >
            <MenuIcon />
          </IconButton>
        </Stack>

        {/* Right side — user info */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            Super Admin
          </Typography>
          <Avatar
            src="/avatar.png"
            alt="User Avatar"
            sx={{
              width: 32,
              height: 32,
              border: "2px solid white",
            }}
          />
          <IconButton color="inherit">
            <LogoutIcon />
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
