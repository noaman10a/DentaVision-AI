import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const initialRoles = {
  RECEPTION: 'reception',
  DOCTOR: 'doctor',
  ADMIN: 'admin',
};

export const ADMIN_CONFIG = {
  // Emails that grant access to Administrator Panel (completely hidden from front-end)
  allowedEmails: [
    'admin@dentavision.ai',
    'admin@gmail.com',
    'noaman.admin@gmail.com',
    'dentavision.admin@gmail.com'
  ],
  isAdmin: (email) => {
    const clean = (email || '').toLowerCase().trim();
    return ADMIN_CONFIG.allowedEmails.includes(clean) || clean.startsWith('admin@') || clean.includes('.admin@');
  }
};

const mockUsers = {
  reception: {
    id: 'STF-001',
    name: 'Sneha Sahadevan',
    role: 'reception',
    roleLabel: 'Receptionist Lead',
    email: 'reception@dentavision.ai',
    avatar: 'https://images.unsplash.com/photo-1594824813566-88855ce78961?w=150&auto=format&fit=crop&q=80',
    clinic: 'DentaVision Main Clinic - Block A',
  },
  doctor: {
    id: 'DOC-102',
    name: 'Dr. Twahir Mohammed',
    role: 'doctor',
    roleLabel: 'Senior Dental Surgeon',
    email: 'doctor@dentavision.ai',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    clinic: 'DentaVision Main Clinic - Suite 4',
  },
  admin: {
    id: 'ADM-999',
    name: 'System Administrator',
    role: 'admin',
    roleLabel: 'System Administrator',
    email: 'admin@dentavision.ai',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    clinic: 'DentaVision HQ & Security Admin',
  },
};

export const AuthProvider = ({ children }) => {
  // Require login on initial visit; persist within active browser session
  const [user, setUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem('dentavision_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return !!sessionStorage.getItem('dentavision_user');
    } catch {
      return false;
    }
  });

  const login = (emailOrId, password, selectedRole = 'doctor') => {
    const cleanEmail = (emailOrId || '').toLowerCase().trim();
    const isAdmin = ADMIN_CONFIG.isAdmin(cleanEmail);
    const resolvedRole = isAdmin ? 'admin' : (selectedRole === 'reception' ? 'reception' : 'doctor');

    const matchedUser = mockUsers[resolvedRole] || {
      id: resolvedRole === 'admin' ? 'ADM-999' : (resolvedRole === 'reception' ? 'STF-001' : 'DOC-102'),
      name: resolvedRole === 'admin' ? 'System Administrator' : (cleanEmail.split('@')[0] || 'Clinic Staff'),
      role: resolvedRole,
      roleLabel: resolvedRole === 'admin' ? 'System Administrator' : (resolvedRole === 'reception' ? 'Receptionist' : 'Senior Dental Surgeon'),
      email: emailOrId,
      avatar: mockUsers[resolvedRole]?.avatar || mockUsers.doctor.avatar,
      clinic: 'DentaVision Clinic',
    };

    setUser(matchedUser);
    setIsAuthenticated(true);
    try {
      sessionStorage.setItem('dentavision_user', JSON.stringify(matchedUser));
    } catch (e) {
      console.warn('Could not save session', e);
    }
    return { success: true, role: resolvedRole };
  };

  const logout = () => {
    try {
      sessionStorage.removeItem('dentavision_user');
    } catch (e) {
      console.warn('Could not clear session', e);
    }
    setIsAuthenticated(false);
    setUser(null);
  };

  const switchRole = (roleKey) => {
    if (mockUsers[roleKey]) {
      setUser(mockUsers[roleKey]);
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem('dentavision_user', JSON.stringify(mockUsers[roleKey]));
      } catch (e) {
        console.warn('Could not update session', e);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        switchRole,
        roles: initialRoles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
