import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ChatProvider } from "./context/chat-context";
import publicRoutes from "./routes/publicRoutes";
import privateRoutes from "./routes/privateRoutes";

const App: React.FC = () => {
  return (
    <ChatProvider>
      <BrowserRouter>
        <Routes>
          {publicRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={route.element}
            >
              {route.children &&
                route.children.map((child: any) => (
                  <Route
                    key={child.path}
                    path={child.path}
                    element={child.element}
                  />
                ))}
            </Route>
          ))}
          {privateRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ChatProvider>
  );
};

export default App;
