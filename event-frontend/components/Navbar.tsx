'use client';

import React, { useState } from 'react';
import { Button, Avatar, Dropdown } from 'antd';
import { UserOutlined, LoginOutlined, MenuOutlined } from '@ant-design/icons';
import AuthModal from './AuthModal';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const menuItems = [
    { label: 'Events', href: '/' },
    ...(user
      ? [
          { label: 'My Events', href: '/my-events' },
          { label: 'Subscriptions', href: '/subscriptions' },
        ]
      : []),
  ];

  const userMenu = {
    items: [
      { label: <Link href="/create-event">Create Event</Link>, key: 'create-event' },
      { label: 'Profile', key: 'profile' },
      { label: 'Logout', key: 'logout', onClick: logout },
    ],
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/70 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:bg-black/70 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
              EventApp
            </Link>
          </div>

          <nav className="hidden md:flex gap-8">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.href ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>


          <div className="flex items-center gap-4">
            {user ? (
              <Dropdown menu={userMenu} placement="bottomRight" arrow>
                <div className="flex items-center gap-3 cursor-pointer p-1 rounded-full hover:bg-muted/50 transition-colors pr-3">
                  <Avatar icon={<UserOutlined />} className="bg-primary/10 text-primary" />
                  <span className="text-sm font-medium hidden sm:block">{user.name}</span>
                </div>
              </Dropdown>
            ) : (
              <Button 
                type="primary" 
                shape="round"
                icon={<LoginOutlined />} 
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-primary hover:bg-indigo-500 border-none shadow-md shadow-indigo-500/20"
              >
                Login
              </Button>
            )}
            
            <button className="md:hidden p-2 text-muted-foreground hover:text-foreground">
                <MenuOutlined className="text-xl"/>
            </button>
          </div>
        </div>
      </div>

      <AuthModal open={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onLoginSuccess={() => {}} />
    </header>
  );
};

export default Navbar;
