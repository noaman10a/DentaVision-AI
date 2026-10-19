import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const initialRoles = {
  RECEPTION: 'reception',
  DOCTOR: 'doctor',
  ADMIN: 'admin',
};

// Default registered clinic accounts
const DEFAULT_REGISTERED_USERS = {
  'noaman@batman.com': {
    id: 'ADM-001',
    name: 'Noaman (Administrator)',
    role: 'admin',
    roleLabel: 'System Administrator',
    email: 'noaman@batman.com',
    password: 'imbatman',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    clinic: 'DentaVision Security Command',
  },
  'doctor@dentavision.ai': {
    id: 'DOC-102',
    name: 'Dr. Twahir Mohammed',
    role: 'doctor',
    roleLabel: 'Senior Dental Surgeon',
    email: 'doctor@dentavision.ai',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    clinic: 'DentaVision Main Clinic - Suite 4',
  },
  'twahir.doctor@dentavision.ai': {
    id: 'DOC-102',
    name: 'Dr. Twahir Mohammed',
    role: 'doctor',
    roleLabel: 'Senior Dental Surgeon',
    email: 'twahir.doctor@dentavision.ai',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    clinic: 'DentaVision Main Clinic - Suite 4',
  },
  'reception@dentavision.ai': {
    id: 'STF-001',
    name: 'Sneha Sahadevan',
    role: 'reception',
    roleLabel: 'Receptionist Lead',
    email: 'reception@dentavision.ai',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1594824813566-88855ce78961?w=150&auto=format&fit=crop&q=80',
    clinic: 'DentaVision Main Clinic - Block A',
  },
  'sneha.reception@dentavision.ai': {
    id: 'STF-001',
    name: 'Sneha Sahadevan',
    role: 'reception',
    roleLabel: 'Receptionist Lead',
    email: 'sneha.reception@dentavision.ai',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1594824813566-88855ce78961?w=150&auto=format&fit=crop&q=80',
    clinic: 'DentaVision Main Clinic - Block A',
  },
};

export const AuthProvider = ({ children }) => {
  // Directory of registered users, persisted in localStorage so password resets work across sessions
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    try {
      const stored = localStorage.getItem('dentavision_registered_users');
      if (stored) {
        return { ...DEFAULT_REGISTERED_USERS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Could not load registered users from localStorage', e);
    }
    return DEFAULT_REGISTERED_USERS;
  });

  // Current session user
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

  // Save registered users whenever they change (e.g. password reset)
  useEffect(() => {
    try {
      localStorage.setItem('dentavision_registered_users', JSON.stringify(registeredUsers));
    } catch (e) {
      console.warn('Could not persist registered users', e);
    }
  }, [registeredUsers]);

  // Check if an email is registered in the clinical directory
  const isEmailRegistered = (email) => {
    if (!email) return false;
    const clean = email.toLowerCase().trim();
    return !!registeredUsers[clean];
  };

  // Get user details by email
  const getUserByEmail = (email) => {
    if (!email) return null;
    const clean = email.toLowerCase().trim();
    return registeredUsers[clean] || null;
  };

  // Login handler with strict email verification & password check
  const login = (emailOrId, password) => {
    const cleanEmail = (emailOrId || '').toLowerCase().trim();

    if (!cleanEmail) {
      return { success: false, error: 'Please enter your registered clinic email.' };
    }

    const matchedAccount = registeredUsers[cleanEmail];

    // Verify if the email is registered
    if (!matchedAccount) {
      return { 
        success: false, 
        error: `The email "${emailOrId}" is not registered in the DentaVision clinical directory. Please contact your clinic administrator.` 
      };
    }

    // Verify password
    if (matchedAccount.password !== password) {
      return { 
        success: false, 
        error: 'Incorrect password. Please verify your credentials or click "Forgot Password?".' 
      };
    }

    // Authentication succeeded
    const sessionUser = {
      id: matchedAccount.id,
      name: matchedAccount.name,
      role: matchedAccount.role,
      roleLabel: matchedAccount.roleLabel,
      email: matchedAccount.email,
      avatar: matchedAccount.avatar,
      clinic: matchedAccount.clinic,
    };

    setUser(sessionUser);
    setIsAuthenticated(true);
    try {
      sessionStorage.setItem('dentavision_user', JSON.stringify(sessionUser));
    } catch (e) {
      console.warn('Could not save session', e);
    }

    return { success: true, role: sessionUser.role, user: sessionUser };
  };

  // Reset password handler for verified OTP flow
  const resetPassword = (email, newPassword) => {
    const clean = (email || '').toLowerCase().trim();
    if (!registeredUsers[clean]) {
      return { success: false, error: 'Account not found.' };
    }

    setRegisteredUsers(prev => ({
      ...prev,
      [clean]: {
        ...prev[clean],
        password: newPassword
      }
    }));

    return { success: true };
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
    // Find first registered user with this role
    const found = Object.values(registeredUsers).find(u => u.role === roleKey);
    if (found) {
      setUser(found);
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem('dentavision_user', JSON.stringify(found));
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
        isEmailRegistered,
        getUserByEmail,
        resetPassword,
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
