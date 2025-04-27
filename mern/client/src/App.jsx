// Import global styles
import "./App.css";
// Import Router components for navigation
import { HashRouter as Router, Routes, Route } from "react-router-dom";
// Import pages
import Home from "./pages/Home";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import ContentBrowser from "./pages/ContentBrowser";
import ContentUpload from "./pages/ContentUpload";
import ContentViewer from "./pages/ContentViewer";
import ContentManager from "./pages/ContentManager";
import StreamBrowser from "./pages/StreamBrowser";
import StreamManager from "./pages/StreamManager";
import StreamViewer from "./pages/StreamViewer";
// Import shared layout and scroll helper
import Layout from "./components/Layout";
import ScrollToTop from "./components/ScrollToTop";

// Define App component
function App() {
  return (
    // Setup router using HashRouter
    <Router>
      {/* Ensure the page scrolls to top on navigation */}
      <ScrollToTop />

      {/* Define application routes */}
      <Routes>
        {/* All routes are nested inside the Layout component */}
        <Route element={<Layout />}>
          {/* Home page route */}
          <Route path="/" element={<Home />} />

          {/* Profile page route */}
          <Route path="/profile" element={<Profile />} />

          {/* Content pages routes */}
          <Route path="/contentBrowser" element={<ContentBrowser />} />
          <Route path="/contentUpload" element={<ContentUpload />} />
          <Route path="/contentViewer/:videoId" element={<ContentViewer />} />
          <Route path="/contentManager" element={<ContentManager />} />

          {/* Stream pages routes */}
          <Route path="/streamBrowser" element={<StreamBrowser />} />
          <Route path="/streamViewer/:id" element={<StreamViewer />} />
          <Route path="/streamManager" element={<StreamManager />} />

          {/* Feed page route */}
          <Route path="/Feed/:id" element={<Feed />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
