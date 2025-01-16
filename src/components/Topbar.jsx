import React from 'react';
import { Menu } from 'antd';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate to programmatically navigate
import './Topbar.css';

const { SubMenu } = Menu;

const Topbar = () => {
  const navigate = useNavigate(); // Hook for navigation

  const handleLogout = () => {
    // Clear the user data from localStorage (or Firebase)
    localStorage.removeItem('user');
    // Optionally clear Firebase authentication
    // firebase.auth().signOut();

    // Redirect to the login page
    navigate('/');
  };

  return (
    <div className="topbar">
      <Menu mode="horizontal" theme="dark">
        <Menu.Item key="home">
          <Link to="/home">Home</Link>
        </Menu.Item>
        <Menu.Item key="reports">
          <Link to="/reports">Reports</Link>
        </Menu.Item>

        {/* Dropdown for "Add New" */}
        <SubMenu key="add-new" title="Add New">
          <Menu.Item key="add-academic">
            <Link to="/add-new/academic">Add Academic</Link>
          </Menu.Item>
          <Menu.Item key="add-board-passers">
            <Link to="/add-new/boardpassers">Add Board Passers</Link>
          </Menu.Item>
        </SubMenu>

        {/* Dropdown for Departments */}
        <SubMenu key="departments" title="Departments">
          <Menu.Item key="sbm">
            <Link to="/departments/sbm">SBM</Link>
          </Menu.Item>
          <Menu.Item key="slas">
            <Link to="/departments/slas">SLAS</Link>
          </Menu.Item>
          <Menu.Item key="sod">
            <Link to="/departments/sod">SOD</Link>
          </Menu.Item>
          <Menu.Item key="seict">
            <Link to="/departments/seict">SEICT</Link>
          </Menu.Item>
          <Menu.Item key="sam">
            <Link to="/departments/sam">SAM</Link>
          </Menu.Item>
          <Menu.Item key="scj">
            <Link to="/departments/scj">SCJ</Link>
          </Menu.Item>
          <Menu.Item key="seo">
            <Link to="/departments/seo">SEO</Link>
          </Menu.Item>
        </SubMenu>

        <Menu.Item key="account">
          <Link to="/account">Account</Link>
        </Menu.Item>

        {/* Logout item */}
        <Menu.Item key="logout" onClick={handleLogout}>
          Logout
        </Menu.Item>
      </Menu>
    </div>
  );
};

export default Topbar;
