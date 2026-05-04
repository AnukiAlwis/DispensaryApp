import { Outlet } from "react-router-dom";

export default function App() {
  // AppLayout already wraps Outlet with Sidebar + TopSummaryBar
  return <Outlet />;
}
