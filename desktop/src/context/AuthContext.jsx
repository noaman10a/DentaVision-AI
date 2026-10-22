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
    name: 'Noaman Nazeer Ahamed',
    role: 'admin',
    roleLabel: 'System Administrator',
    email: 'noaman@batman.com',
    password: 'imbatman',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    clinic: 'DentaVision Security Command',
    phone: '+91 98800 54321',
    regNo: 'SYS-ADMIN-001',
    qualification: 'B.E. Computer Science & Engineering',
    department: 'AI Diagnostic Infrastructure & Hospital IT',
    suite: 'Security Hub 01',
    bio: 'Technical Lead & AI System Architect overseeing neural network deployments and clinical PACS integrations.',
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
    phone: '+91 98450 12345',
    regNo: 'DCI-KA-2021-08491',
    qualification: 'BDS, MDS (Oral & Maxillofacial Surgery)',
    department: 'Department of Oral Surgery & Implantology',
    suite: 'Consultation Operatory 4A',
    bio: 'Specialist in restorative endodontics, dental implantology, and panoramic AI diagnostic evaluation.',
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
    phone: '+91 98450 12345',
    regNo: 'DCI-KA-2021-08491',
    qualification: 'BDS, MDS (Oral & Maxillofacial Surgery)',
    department: 'Department of Oral Surgery & Implantology',
    suite: 'Consultation Operatory 4A',
    bio: 'Specialist in restorative endodontics, dental implantology, and panoramic AI diagnostic evaluation.',
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
    phone: '+91 98765 67890',
    regNo: 'EMP-REC-2024-009',
    qualification: 'B.Sc. Healthcare Administration',
    department: 'Patient Intake & Clinical Front Desk',
    suite: 'Front Desk Station 1',
    bio: 'Lead reception coordinator overseeing patient scheduling, digital X-ray intake, and queue prioritization.',
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
    phone: '+91 98765 67890',
    regNo: 'EMP-REC-2024-009',
    qualification: 'B.Sc. Healthcare Administration',
    department: 'Patient Intake & Clinical Front Desk',
    suite: 'Front Desk Station 1',
    bio: 'Lead reception coordinator overseeing patient scheduling, digital X-ray intake, and queue prioritization.',
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

    // Authentication succeeded - generate clinical workstation session token
    const token = btoa(JSON.stringify({
      id: matchedAccount.id,
      email: matchedAccount.email,
      role: matchedAccount.role,
      ts: Date.now()
    }));

    const sessionUser = {
      id: matchedAccount.id,
      name: matchedAccount.name,
      role: matchedAccount.role,
      roleLabel: matchedAccount.roleLabel,
      email: matchedAccount.email,
      avatar: matchedAccount.avatar,
      clinic: matchedAccount.clinic,
      phone: matchedAccount.phone || '+91 98765 43210',
      regNo: matchedAccount.regNo || 'DCI-REG-2026',
      qualification: matchedAccount.qualification || 'BDS, MDS',
      department: matchedAccount.department || 'Clinical Dentistry',
      suite: matchedAccount.suite || 'Operatory 1',
      bio: matchedAccount.bio || 'Attending clinical practitioner at DentaVision AI dental care.',
      token,
    };

    setUser(sessionUser);
    setIsAuthenticated(true);
    try {
      sessionStorage.setItem('dentavision_user', JSON.stringify(sessionUser));
      sessionStorage.setItem('dentavision_token', token);
    } catch (e) {
      console.warn('Could not save session', e);
    }

    return { success: true, role: sessionUser.role, user: sessionUser, token };
  };

  // Update profile details for the active user
  const updateUserProfile = (profileUpdates) => {
    if (!user || !user.email) return { success: false, error: 'No active session' };

    const cleanEmail = user.email.toLowerCase().trim();
    const updatedUser = {
      ...user,
      ...profileUpdates,
    };

    setUser(updatedUser);
    try {
      sessionStorage.setItem('dentavision_user', JSON.stringify(updatedUser));
    } catch (e) {
      console.warn('Could not persist updated session', e);
    }

    // Also update in registeredUsers registry so changes persist across sessions
    setRegisteredUsers(prev => {
      if (!prev[cleanEmail]) return prev;
      return {
        ...prev,
        [cleanEmail]: {
          ...prev[cleanEmail],
          ...profileUpdates,
        }
      };
    });

    return { success: true, user: updatedUser };
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
      sessionStorage.removeItem('dentavision_token');
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
      const token = btoa(JSON.stringify({
        id: found.id,
        email: found.email,
        role: found.role,
        ts: Date.now()
      }));
      const userWithToken = { ...found, token };
      setUser(userWithToken);
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem('dentavision_user', JSON.stringify(userWithToken));
        sessionStorage.setItem('dentavision_token', token);
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
        updateUserProfile,
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
