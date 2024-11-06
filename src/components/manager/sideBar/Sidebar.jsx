import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi"; // Importing hamburger icon
import styles from "./Sidebar.module.css";
import { CiSettings } from "react-icons/ci";
import { GrLogout } from "react-icons/gr";
import { MdAssignment } from "react-icons/md";
import { FaChartPie } from "react-icons/fa";
import { LuMessagesSquare } from "react-icons/lu";
import { IoReceiptSharp } from "react-icons/io5";
import { IoIosAddCircle } from "react-icons/io";
import { BiSolidDiscount } from "react-icons/bi";
import { HiCurrencyDollar } from "react-icons/hi";
import { HiOutlineGlobeAlt } from "react-icons/hi";
import { HiOutlineNewspaper } from "react-icons/hi";
import { FiTrello } from "react-icons/fi";
import { HiClipboardDocumentList } from "react-icons/hi2";
import { LuArrowLeftRight } from "react-icons/lu";

const Sidebar = ({ onLogout }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isSuppliersOpen, setIsSuppliersOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State to control sidebar visibility

  const settingsRef = useRef();
  const productsRef = useRef();
  const suppliersRef = useRef();

  const handleSettingsClick = () => {
    setIsSettingsOpen((prev) => !prev);
    setIsProductsOpen(false);
    setIsSuppliersOpen(false);
  };

  const handleProductsClick = () => {
    setIsProductsOpen((prev) => !prev);
    setIsSettingsOpen(false);
    setIsSuppliersOpen(false);
  };

  const handleSuppliersClick = () => {
    setIsSuppliersOpen((prev) => !prev);
    setIsSettingsOpen(false);
    setIsProductsOpen(false);
  };

  const handleClickOutside = (event) => {
    if (
      settingsRef.current &&
      !settingsRef.current.contains(event.target) &&
      productsRef.current &&
      !productsRef.current.contains(event.target) &&
      suppliersRef.current &&
      !suppliersRef.current.contains(event.target)
    ) {
      setIsSettingsOpen(false);
      setIsProductsOpen(false);
      setIsSuppliersOpen(false);
    }
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <button className={styles.menuButton} onClick={handleToggleSidebar}>
        <GiHamburgerMenu />
      </button>

      <div
        className={`${styles.sidebar} ${
          isSidebarOpen ? styles.open : styles.closed
        }`}
      >
        <h2>TechComp</h2>
        <ul>
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? styles.active : undefined
              }
            >
              <HiOutlineGlobeAlt /> To Website
            </NavLink>
          </li>
          <li>
            <NavLink
              exact="true"
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? styles.active : undefined
              }
            >
              <FaChartPie /> Dashboard
            </NavLink>
          </li>
          <li ref={productsRef}>
            <div onClick={handleProductsClick} className={styles.settingsLink}>
              <MdAssignment /> Products
            </div>
            {isProductsOpen && (
              <ul className={styles.subMenu}>
                <li>
                  <NavLink
                    to="/products/productManagement"
                    className={({ isActive }) =>
                      isActive ? styles.active : undefined
                    }
                  >
                    <HiOutlineNewspaper /> Product Management
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/products/OutOfStock"
                    className={({ isActive }) =>
                      isActive ? styles.active : undefined
                    }
                  >
                    <FiTrello /> Out Of Stock Products
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/products/orders"
                    className={({ isActive }) =>
                      isActive ? styles.active : undefined
                    }
                  >
                    <HiClipboardDocumentList /> Products Order
                  </NavLink>
                </li>
              </ul>
            )}
          </li>
          <li ref={suppliersRef}>
            <div onClick={handleSuppliersClick} className={styles.settingsLink}>
              Suppliers
            </div>
            {isSuppliersOpen && (
              <ul className={styles.subMenu}>
                <li>
                  <NavLink
                    to="/suppliers"
                    className={({ isActive }) =>
                      isActive ? styles.active : undefined
                    }
                  >
                    <LuArrowLeftRight /> Suppliers
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/ordersfromsuppliers"
                    className={({ isActive }) =>
                      isActive ? styles.active : undefined
                    }
                  >
                    <LuArrowLeftRight />
                    Orders From Suppliers
                  </NavLink>
                </li>
              </ul>
            )}
          </li>
          <li>
            <NavLink
              to="/manage-receipt"
              className={({ isActive }) =>
                isActive ? styles.active : undefined
              }
            >
              <IoReceiptSharp /> Manage Receipt
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/messages"
              className={({ isActive }) =>
                isActive ? styles.active : undefined
              }
            >
              <LuMessagesSquare /> Messages
            </NavLink>
          </li>
          <li ref={settingsRef}>
            <div onClick={handleSettingsClick} className={styles.settingsLink}>
              <CiSettings /> Settings
            </div>
            {isSettingsOpen && (
              <ul className={styles.subMenu}>
                <li>
                  <NavLink
                    to="/settings/add-profile"
                    className={({ isActive }) =>
                      isActive ? styles.active : undefined
                    }
                  >
                    <IoIosAddCircle /> Add/Profile
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/settings/discounts"
                    className={({ isActive }) =>
                      isActive ? styles.active : undefined
                    }
                  >
                    <BiSolidDiscount /> Discounts
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/settings/taxes"
                    className={({ isActive }) =>
                      isActive ? styles.active : undefined
                    }
                  >
                    <HiCurrencyDollar /> Taxes
                  </NavLink>
                </li>
                <li>
                  <button className={styles.logoutButton} onClick={onLogout}>
                    <GrLogout /> Log Out
                  </button>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
