import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

import { Web3Provider } from "./context/Web3Context";
import { LanguageProvider } from "./context/LanguageContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <Web3Provider>
          <App />
        </Web3Provider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);
