import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const initialRoles = {
  RECEPTION: 'reception',
  DOCTOR: 'doctor',
  ADMIN: 'admin',
};

const mockUsers = {
  reception: {
    id: 'STF-001',
    name: 'Sneha Sahadevan',
    role: 'reception',
    roleLabel: 'Receptionist Lead',
    email: 'sneha.reception@dentavision.ai',
    avatar: 'https://images.unsplash.com/photo-1594824813566-88855ce78961?w=150&auto=format&fit=crop&q=80',
    clinic: 'DentaVision Main Clinic - Block A',
  },
  doctor: {
    id: 'DOC-102',
    name: 'Dr. Twahir Mohammed',
    role: 'doctor',
    roleLabel: 'Senior Dental Surgeon',
    email: 'twahir.doctor@dentavision.ai',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    clinic: 'DentaVision Main Clinic - Suite 4',
  },
  admin: {
    id: 'ADM-999',
    name: 'Administrator',
    role: 'admin',
    roleLabel: 'System Administrator',
    email: 'admin@dentavision.ai',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    clinic: 'DentaVision HQ',
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(mockUsers.doctor); // Default login role for demo
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const login = (emailOrId, password, selectedRole = 'doctor') => {
    const matchedUser = mockUsers[selectedRole] || {
      id: 'STF-CUSTOM',
      name: emailOrId.split('@')[0] || 'Clinic Staff',
      role: selectedRole,
      roleLabel: selectedRole.toUpperCase(),
      email: emailOrId,
      avatar: mockUsers.doctor.avatar,
      clinic: 'DentaVision Clinic',
    };
    setUser(matchedUser);
    setIsAuthenticated(true);
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  const switchRole = (roleKey) => {
    if (mockUsers[roleKey]) {
      setUser(mockUsers[roleKey]);
      setIsAuthenticated(true);
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
