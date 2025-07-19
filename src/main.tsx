import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import store from "./store";
import App from "./App";
import "./index.css";
import { ChatProvider } from "./context/chat-context";
import { ConfigProvider } from "antd";
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider >
        <ChatProvider>
          <App />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#52c41a',
                },
              },
              error: {
                duration: 4000,
                style: {
                  background: '#ff4d4f',
                },
              },
            }}
          />
        </ChatProvider>
      </ConfigProvider>
    </QueryClientProvider>
  </Provider>
);
