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
          p={{ xs: 2, sm: 3, md: 4 }}
          bgcolor="background.default"
        >
          {/* TopSummaryBar */}
          <TopSummaryBar />

          {/* Page content */}
          <Box mt={3}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
