import { Box, useTheme, useMediaQuery } from "@mui/material";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopSummaryBar from "./TopSummaryBar";
import TopBar from "./TopBar";
import { useState } from "react";

export default function AppLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Box display="flex" minHeight="100vh" sx={{ overflowX: "hidden" }}>
      {/* Sidebar: permanent on desktop/tablet, temporary on mobile */}
      <Sidebar
        isMobile={isMobile}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main content area */}
      <Box flexGrow={1} minWidth={0} display="flex" flexDirection="column">
        {/* TopBar */}
        <TopBar
          isMobile={isMobile}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Scrollable main content */}
        <Box
          component="main"
          flexGrow={1}
          minWidth={0}
          p={{ xs: 1, sm: 2, md: 3 }}
          bgcolor="#f9f9f9"
        >
          {/* TopSummaryBar */}
          <TopSummaryBar />

          {/* Page content */}
          <Box mt={2}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
