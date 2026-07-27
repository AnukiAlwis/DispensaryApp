import React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Stack,
  Avatar,
  Box,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../hooks/useAuth";

interface TopBarProps {
  isMobile: boolean;
  onToggleSidebar: () => void;
}

export default function TopBar({ isMobile, onToggleSidebar }: TopBarProps) {
  const { user, logout } = useAuth();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "transparent",
        color: "white",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Box
        sx={{
          bgcolor: "primary.main",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0px 12px 30px rgba(15, 52, 96, 0.08)",
        }}
      >
        <Toolbar
          sx={{
            minHeight: isMobile ? 64 : 78,
            px: { xs: 2, md: 4 },
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "center",
            justifyContent: "space-between",
            gap: isMobile ? 1.5 : 0,
          }}
        >
          {/* Left cluster — menu + brand */}
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton
              onClick={onToggleSidebar}
              edge="start"
              sx={{
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: 2,
                color: "white",
                bgcolor: "rgba(255, 255, 255, 0.1)",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          </Stack>

          {/* Right cluster — quick actions + user */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={isMobile ? 1 : 2}
          >
            

            <Divider flexItem orientation="vertical" sx={{ mx: 0.5, borderColor: "rgba(255, 255, 255, 0.2)" }} />

            <Stack spacing={0} sx={{ textAlign: "right" }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "white" }}>
                {user?.fullName || 'User'}
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                {user?.role || 'Role'}
              </Typography>
            </Stack>

            <Avatar
              src="/avatar.png"
              alt="User Avatar"
              sx={{
                width: 40,
                height: 40,
                border: "2px solid rgba(255, 255, 255, 0.3)",
              }}
            />

            <IconButton
              onClick={logout}
              sx={{
                borderRadius: 100,
                bgcolor: "rgba(255, 255, 255, 0.15)",
                color: "white",
                width: 44,
                height: 44,
                border: "1px solid rgba(255, 255, 255, 0.3)",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.25)",
                },
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Stack>
        </Toolbar>
      </Box>
    </AppBar>
  );
}
