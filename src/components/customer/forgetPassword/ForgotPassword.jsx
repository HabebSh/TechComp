import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./ForgotPassword.module.css"; // Import the CSS module

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [codeLength, setCodeLength] = useState(6); // Assuming the code is 6 digits long
  const [userInput, setUserInput] = useState(new Array(6).fill("")); // Initialize with 6 empty strings
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown

  const navigate = useNavigate();

  useEffect(() => {
    if (step === 2 && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setError("Verification code expired. Please request a new one.");
      setStep(1);
    }
  }, [timeLeft, step]);

  const handleSendCode = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/ForgotPassword/forgot-password",
        { email }
      );
      if (response.data.success) {
        alert("Verification code has been sent to your email!");
        setStep(2);
        setUserInput(new Array(6).fill("")); // Reset input for 6 digits
        setTimeLeft(300); // Reset timer to 5 minutes
      }
    } catch (error) {
      setError(
        "Failed to send verification code. Please check your email address and try again."
      );
    }
  };

  const handleInputChange = (value, index) => {
    if (/^[0-9]$/.test(value)) {
      // Ensure only digits are inputted
      const newInput = [...userInput];
      newInput[index] = value;
      setUserInput(newInput);

      if (index < codeLength - 1) {
        document.getElementById(`input-${index + 1}`).focus(); // Move to next input
      }
    }
  };

  const handleVerifyCode = async (event) => {
    event.preventDefault();
    const inputCode = userInput.join("");
    try {
      const response = await axios.post(
        "http://localhost:5000/api/ForgotPassword/verify-code",
        { email, code: inputCode }
      );
      if (response.data.success) {
        alert("Code verified! You can now change your password.");
        setStep(3);
      } else {
        setError("Invalid verification code. Please try again.");
      }
    } catch (error) {
      setError("Verification failed. Please try again.");
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/ForgotPassword/reset-password",
        {
          email,
          code: userInput.join(""),
          newPassword,
        }
      );
      if (response.data.success) {
        alert("Your password has been successfully changed!");
        setEmail("");
        setUserInput(new Array(6).fill(""));
        setNewPassword("");
        setStep(1);
        navigate("/login");
      }
    } catch (error) {
      setError(
        "Failed to reset password. Please ensure your code is correct and try again."
      );
    }
  };

  const renderTimer = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `Time remaining: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className={styles.forgotPasswordPage}>
      {" "}
      {/* Scoped background for this page */}
      <div className={styles.forgotPasswordContainer}>
        {" "}
        {/* Scoped container for the form */}
        {step === 1 && (
          <form onSubmit={handleSendCode} className={styles.form}>
            <h2 className={styles.header}>Forgot Password</h2>
            {error && <p className={styles.error}>{error}</p>}
            <label className={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
            />
            <button type="submit" className={styles.button}>
              Send Verification Code
            </button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleVerifyCode} className={styles.form}>
            <h2 className={styles.header}>Verify Code</h2>
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.codeInputContainer}>
              {userInput.map((digit, index) => (
                <input
                  key={index}
                  id={`input-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleInputChange(e.target.value, index)}
                  className={styles.squareInput}
                  required
                />
              ))}
            </div>
            <button type="submit" className={styles.button}>
              Verify Code
            </button>
            {timeLeft > 0 ? (
              <div className={styles.timer}>{renderTimer()}</div>
            ) : (
              <div className={styles.timer}>
                Code expired. Please request a new one.
              </div>
            )}
          </form>
        )}
        {step === 3 && (
          <form onSubmit={handleChangePassword} className={styles.form}>
            <h2 className={styles.header}>Reset Password</h2>
            {error && <p className={styles.error}>{error}</p>}
            <label className={styles.label}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className={styles.input}
            />
            <button type="submit" className={styles.button}>
              Change Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
