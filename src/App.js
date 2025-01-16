import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Topbar from './components/Topbar';
import Home from './layouts/Home';
import Support from './layouts/Support';
import Logs from './layouts/Logs';
import Reports from './layouts/Reports';
import AddNew from './layouts/AddNew';
import Academic from './layouts/Academic';
import Boardpassers from './layouts/Boardpassers';
import Seict from './pages/Seict';
import Seo from './pages/Seo';
import Sbm from './pages/Sbm';
import Scj from './pages/Scj';
import Sam from './pages/Sam';
import Slas from './pages/Slas';
import Sod from './pages/Sod';
import Account from './pages/Accounts';
import Login from './pages/Login'; // Import the Login page

const App = () => {
  const location = useLocation(); // Get current location
  const user = localStorage.getItem('user'); // Check if user is logged in

  return (
    <div>
      {/* Conditionally render Topbar only if user is logged in and not on the login page */}
      {user && location.pathname !== '/login' && <Topbar />}

      <Routes>
        <Route path="/" element={<Login />} /> {/* Set Login as default route */}
        <Route path="/home" element={<Home />} />
        <Route path="/support" element={<Support />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/add-new" element={<AddNew />} />
        <Route path="/add-new/academic" element={<Academic />} />
        <Route path="/add-new/boardpassers" element={<Boardpassers />} />
        <Route path="/departments/seict" element={<Seict />} />
        <Route path="/departments/seo" element={<Seo />} />
        <Route path="/departments/sbm" element={<Sbm />} />
        <Route path="/departments/scj" element={<Scj />} />
        <Route path="/departments/sam" element={<Sam />} />
        <Route path="/departments/slas" element={<Slas />} />
        <Route path="/departments/sod" element={<Sod />} />
        <Route path="/account" element={<Account />} />
      </Routes>
    </div>
  );
};

const AppWrapper = () => {
  return (
    <Router>
      <App />
    </Router>
  );
};

export default AppWrapper;
