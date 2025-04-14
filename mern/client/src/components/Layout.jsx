import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./Navbar";

export default function Layout() {
  const user = sessionStorage.getItem("User");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const publicPaths = [
      "/",
      "/streamBrowser",
      "/streamViewer",
      "/contentBrowser",
      "/contentViewer",
    ];
    const isPublicPath = publicPaths.some((path) =>
      location.pathname.startsWith(path)
    );

    if (!user && !isPublicPath) {
      navigate("/", { replace: true });
    }
  }, [user, navigate, location]);

  return (
    <>
      <Navbar />
      <div className="content">
        <Outlet />
      </div>
    </>
  );
}
