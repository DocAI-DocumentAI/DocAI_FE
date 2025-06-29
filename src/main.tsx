import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import store from "./store";
import App from "./App";
import "./index.css";
import { ChatProvider } from "./context/chat-context";

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <ChatProvider>
        <App />
      </ChatProvider>
    </QueryClientProvider>
  </Provider>
);
