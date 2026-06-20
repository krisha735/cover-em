import React, { useState } from 'react';
import { MOCK_USERS_DB } from './mockTnb/tnbCloudRegistry';
import AuthPortal from './components/AuthPortal';
import DashboardMain from './components/DashboardMain';

export default function App() {
  const [usersDb, setUsersDb] = useState(MOCK_USERS_DB);
  const [activeSessionUser, setActiveSessionUser] = useState(null);

  const handleAddAccountToPortfolio = (accountNum) => {
    setActiveSessionUser(prev => {
      const updatedList = [...prev.linkedAccounts, accountNum];
      setUsersDb(currentDb => ({
        ...currentDb,
        [prev.username]: { ...currentDb[prev.username], linkedAccounts: updatedList }
      }));
      return { ...prev, linkedAccounts: updatedList };
    });
  };

  if (!activeSessionUser) {
    return <AuthPortal usersDb={usersDb} setUsersDb={setUsersDb} onAuthSuccess={(user) => setActiveSessionUser(user)} />;
  }

  return <DashboardMain currentUser={activeSessionUser} onLogout={() => setActiveSessionUser(null)} onAddAccount={handleAddAccountToPortfolio} />;
}