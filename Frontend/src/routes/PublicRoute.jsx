import { Navigate } from "react-router-dom";

export default function PublicRoute({ children }) {
  const token = localStorage.getItem("token");

  // ✅ Already logged in → redirect to home/chat
  if (token) {
    return <Navigate to="/chat" replace />;
  }

  return children;
}
