import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./log.module.css";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    axios
      .post("http://localhost:5000/api/users/login", { email, password })
      .then((response) => {
        if (response.data.success) {
          onLogin(response.data.name, email, response.data.isManager);
          navigate(response.data.isManager ? "/dashboard" : "/");
        } else {
          alert("Login failed!");
        }
      })
      .catch((error) => console.error("There was an error logging in!", error));
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginLeft}>
        <form onSubmit={handleSubmit} autoComplete="on">
          <label className={styles.label}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email" // Enable autocomplete for email
            name="email" // Name attribute for email
            className={styles.input}
          />
          <label className={styles.label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="password" // Enable autocomplete for password
            name="password" // Name attribute for password
            className={styles.input}
          />
          <button type="submit" className={styles.loginButton}>
            LOG IN
          </button>
        </form>
        <a href="/forgot-password" className={styles.forgotPassword}>
          Forgot password?
        </a>
        <div className={styles.registerContainer}>
          <p>Don't have an account?</p>
          <a href="/register" className={styles.registerButton}>
            REGISTER
          </a>
        </div>
      </div>
      <div className={styles.loginRight}>
        <h3>Welcome to TechComp!</h3>
        <p>
          Your one-stop shop for computers and parts. Whether you're building a
          custom rig or upgrading your setup, we’ve got everything you need.
          Explore top brands, enjoy fast shipping, and get expert advice from
          our team. Start shopping today and find the perfect gear for your
          needs!
        </p>
      </div>
    </div>
  );
}

export default Login;
