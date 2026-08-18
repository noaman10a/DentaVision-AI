import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  UserPlus, 
  Search, 
  Stethoscope, 
  FolderHeart, 
  FileText, 
  Pill, 
  FolderOpen, 
  History, 
  ShieldAlert, 
  Activity, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const getNavItems = () => {
    switch (user?.role) {
      case 'reception':
        return [
          { label: 'Dashboard', path: '/reception', icon: LayoutDashboard },
          { label: 'Register Patient', path: '/reception/register', icon: UserPlus },
          { label: 'Search Patients', path: '/reception/search', icon: Search },
          { label: 'Patient Workspace', path: '/workspace', icon: FolderHeart },
        ];
      case 'doctor':
        return [
          { label: 'Doctor Dashboard', path: '/doctor', icon: LayoutDashboard },
          { label: 'Patient Workspace', path: '/workspace', icon: FolderHeart },
          { label: 'Clinical Visit', path: '/doctor/clinical-visit', icon: Stethoscope },
          { label: 'Prescriptions', path: '/doctor/prescriptions', icon: Pill },
          { label: 'Reports', path: '/doctor/reports', icon: FileText },
          { label: 'Documents', path: '/doctor/documents', icon: FolderOpen },
          { label: 'Timeline', path: '/doctor/timeline', icon: History },
        ];
      case 'admin':
        return [
          { label: 'Admin Dashboard', path: '/admin', icon: ShieldAlert },
          { label: 'Health Status', path: '/admin/health', icon: Activity },
          { label: 'User Directory', path: '/reception/search', icon: Users },
          { label: 'Patient Workspace', path: '/workspace', icon: FolderHeart },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <aside
      style={{
        width: isCollapsed ? '80px' : '260px',
        height: '100%',
        backgroundColor: 'var(--bg-dark-surface)',
        borderRight: '1px solid var(--border-glass)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease, border-color 0.3s ease',
        position: 'relative',
        zIndex: 20,
      }}
    >
      {/* Brand Logo & Collapse Toggle */}
      <div
        style={{
          padding: isCollapsed ? '20px 12px' : '20px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          borderBottom: '1px solid var(--border-glass)',
        }}
      >
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--primary-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-glow)',
              }}
            >
              <Sparkles size={20} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                DentaVision <span style={{ color: 'var(--primary-teal)' }}>AI</span>
              </h1>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Clinical Desktop v1.0</p>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'var(--primary-teal)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={22} color="#fff" />
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            background: 'var(--btn-secondary-bg)',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-secondary)',
            borderRadius: '6px',
            padding: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Role Badge Indicator */}
      {!isCollapsed && (
        <div style={{ padding: '16px 20px 8px' }}>
          <div
            style={{
              backgroundColor: 'var(--primary-teal-glow)',
              border: '1px solid var(--border-accent)',
              borderRadius: '8px',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-teal)', boxShadow: '0 0 8px var(--primary-teal)' }} />
            <div>
              <p style={{ fontSize: '10px', textTransform: 'uppercase', tracking: '1px', color: 'var(--primary-teal)', fontWeight: '700' }}>
                Active Mode
              </p>
              <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                {user?.roleLabel || 'Staff Workstation'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation List */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: isCollapsed ? '12px' : '10px 14px',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    borderRadius: '8px',
                    color: isActive ? '#fff' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'var(--primary-teal)' : 'transparent',
                    border: isActive ? '1px solid var(--primary-teal)' : '1px solid transparent',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: isActive ? '600' : '500',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? '0 4px 12px var(--primary-teal-glow)' : 'none',
                  }}
                >
                  <Icon size={20} color={isActive ? '#fff' : 'currentColor'} />
                  {!isCollapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile Footer & Logout */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid var(--border-glass)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          justifyContent: isCollapsed ? 'center' : 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src={user?.avatar}
            alt={user?.name}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid var(--primary-teal)',
            }}
          />
          {!isCollapsed && (
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {user?.name}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {user?.id}
              </p>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <button
            onClick={logout}
            title="Logout"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = 'var(--status-error)')}
            onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </aside>
  );
};
