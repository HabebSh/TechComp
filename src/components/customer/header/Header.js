


import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import style from "./header.module.css";
import SendMessage from "../sendMessage/SendMessage";
import DropdownMenu from "../menu/DropdownMenu";
import image from "../../images/finalLogo.png";
import { AiOutlineMail } from "react-icons/ai"; // Mail icon
import { IoHome, IoLogOutOutline } from "react-icons/io5"; // Home and Logout icons
import { MdShoppingCartCheckout } from "react-icons/md"; // Cart icon
import { ImMenu3 } from "react-icons/im"; // Menu icon

const Header = ({
  cartItemCount,
  customerName,
  onLogout,
  showSidebar,
  setShowSidebar,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(true);
  const [showSendMessage, setShowSendMessage] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("Welcome Customer");

  useEffect(() => {
    if (location.pathname === "/login" || location.pathname === "/cart") {
      setShowSearch(false);
    } else {
      setShowSearch(true);
    }
  }, [location]);

  useEffect(() => {
    if (customerName) {
      setWelcomeMessage(`Welcome ${customerName}`);
    } else {
      setWelcomeMessage("Welcome Customer");
    }
  }, [customerName]);

  const handleSendMessageClick = () => {
    setShowSendMessage(true);
  };

  const handleSendMessageClose = () => {
    setShowSendMessage(false);
  };

  return (
    <header className={style.header}>
      <div className={style.headerContainer}>
        <div className={style.logo}>
          <img src={image} alt="Logo" />
        </div>
        <div className={style.welcomeMessage}>{welcomeMessage}</div>
        <button onClick={handleSendMessageClick} className={style.iconButton}>
          <AiOutlineMail size={24} /> {/* Mail icon */}
        </button>
        <nav className={style.navigation}>
          <ul>
            <li>
              <Link to="/">
                <IoHome size={24} /> {/* Home icon */}
              </Link>
            </li>
            <li>
              <Link to="/cart">
                <MdShoppingCartCheckout size={24} /> {/* Cart icon */}(
                {cartItemCount})
              </Link>
            </li>
            {location.pathname !== "/login" && !customerName && (
              <li>
                <Link to="/login">
                  <IoLogOutOutline size={24} /> {/* Log Out icon for Login */}
                </Link>
              </li>
            )}
            {customerName && (
              <li>
                <button onClick={() => setShowSidebar(!showSidebar)}>
                  <ImMenu3 size={24} /> {/* Menu icon */}
                </button>
                {showSidebar && <DropdownMenu onLogout={onLogout} />}
              </li>
            )}
          </ul>
        </nav>
      </div>
      {showSendMessage && <SendMessage onClose={handleSendMessageClose} />}
    </header>
  );
};

export default Header;
