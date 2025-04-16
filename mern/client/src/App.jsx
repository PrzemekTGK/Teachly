import "./App.css";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import ContentBrowser from "./pages/ContentBrowser";
import ContentUpload from "./pages/ContentUpload";
import ContentViewer from "./pages/ContentViewer";
import ContentManager from "./pages/ContentManager";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import StreamBrowser from "./pages/StreamBrowser";
import StreamManager from "./pages/StreamManager";
import StreamViewer from "./pages/StreamViewer";
import Layout from "./components/Layout";
import ScrollToTop from "./components/ScrollToTop";
import Feed from "./Feed";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/contentBrowser" element={<ContentBrowser />} />
          <Route path="/contentUpload" element={<ContentUpload />} />
          <Route path="/contentViewer/:videoId" element={<ContentViewer />} />
          <Route path="/contentManager/" element={<ContentManager />} />
          <Route path="/streamBrowser" element={<StreamBrowser />} />
          <Route path="/streamViewer/:id" element={<StreamViewer />} />
          <Route path="/streamManager" element={<StreamManager />} />
          <Route path="/Feed" element={<Feed />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
