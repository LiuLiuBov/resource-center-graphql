import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import App from "./App";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Requests from "./pages/Requests";
import CreateRequestPage from "./pages/CreateRequestPage";
import RequestDetail from "./pages/RequestDetail";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  
    <BrowserRouter><AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><App /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
        <Route path="/requests/create" element={<ProtectedRoute><CreateRequestPage /></ProtectedRoute>} />
        <Route path="/requests/:id" element={<ProtectedRoute><RequestDetail /></ProtectedRoute>} />
      </Routes></AuthProvider>
    </BrowserRouter>
  
);
