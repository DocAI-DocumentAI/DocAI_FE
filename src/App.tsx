import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import publicRoutes from "./routes/publicRoutes";
import privateRoutes from "./routes/privateRoutes";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {publicRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        {privateRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
