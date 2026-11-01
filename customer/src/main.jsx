import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import RequestLoader from "./components/RequestLoader";
import "./index.css";

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <RequestLoader />
    <App />
  </React.StrictMode>
);