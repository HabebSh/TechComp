
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import axios from "axios";
import { AuthProvider } from "./components/Paypal/AuthContext"; // Import the AuthProvider

axios.defaults.withCredentials = true;

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(

  <AuthProvider>
    <Router>
      <App />
    </Router>
  </AuthProvider>
);
