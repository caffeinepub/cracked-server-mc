import { useEffect, useState } from "react";
import AdminPage from "./pages/AdminPage";
import HomePage from "./pages/HomePage";

/**
 * Simple path-based router.
 * - "/" renders the public homepage
 * - "/zodiac-control-8472" renders the hidden admin panel
 * - All other paths fall back to the homepage
 *
 * NOTE: There is intentionally NO visible link to the admin panel anywhere
 * on the public site. Navigate directly to /zodiac-control-8472 to access it.
 */
export default function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    // Listen for browser back/forward navigation
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  if (path === "/zodiac-control-8472") {
    return <AdminPage />;
  }

  return <HomePage />;
}
