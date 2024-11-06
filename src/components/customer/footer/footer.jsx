import React from "react";
import styles from "./footer.module.css"; // Importing CSS module

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerSection}>
          <h4>About Us</h4>
          <p>
            We provide the best computers and parts for all your needs. From
            custom builds to upgrades, find everything here.
          </p>
        </div>

        <div className={styles.footerSection}>
          <h4>Contact Us</h4>
          <ul>
            <li>Email: habeb654322@gmail.com</li>
            <li>0544610096</li>
            <li>Email: mohamedhija36@gmail.com</li>
            <li>0528856470</li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h4>Follow Us</h4>
          <ul className={styles.socialLinks}>
            <li>
              <a href="https://facebook.com" target="_blank" rel="noreferrer">
                Facebook
              </a>
            </li>
            <li>
              <a href="https://twitter.com" target="_blank" rel="noreferrer">
                Twitter
              </a>
            </li>
            <li>
              <a href="https://instagram.com" target="_blank" rel="noreferrer">
                Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <p>
          &copy; {new Date().getFullYear()} Mohamed&Habeb TechComp. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
