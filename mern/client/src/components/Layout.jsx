import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./Navbar";

export default function Layout() {
  let user = sessionStorage.getItem("User");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <>
      <Navbar />
      <div className="content">
        <Outlet />
      </div>
    </>
  );
}
