import { Authenticated, Unauthenticated } from "./lib/auth";
import { useQuery, api } from "./lib/compat";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState, useEffect } from "react";
import { MenuView } from "./components/MenuView";
import { CartView } from "./components/CartView";
import { OrdersView } from "./components/OrdersView";
import { LoyaltyView } from "./components/LoyaltyView";
import { AdminPanel } from "./components/AdminPanel";
import { BaristaPanel } from "./components/BaristaPanel";
import { ManagerPanel } from "./components/ManagerPanel";
import { TestAccountsInfo } from "./components/TestAccountsInfo";
import { RoleBadge } from "./components/RoleBadge";
import { Icons } from "./components/Icons";

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      setDarkMode(true);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md h-16 flex justify-between items-center border-b border-border/50 shadow-lg px-4 transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-brand to-brand-dark rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-200">
            <Icons.Coffee className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-gradient">
            Coffee Shop Pro
          </h2>
        </div>
        <Authenticated>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode((v) => !v)}
              className="px-3 py-1.5 rounded-lg border border-border text-sm font-medium hover:bg-background"
            >
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            <SignOutButton />
          </div>
        </Authenticated>
      </header>
      <main className="flex-1">
        <Content />
      </main>
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'bg-surface border border-border shadow-lg',
          duration: 3000,
        }}
      />
    </div>
  );
}

function Content() {
  const currentUser = useQuery(api.users.getCurrentUserProfile);
  const [activeTab, setActiveTab] = useState<string>('menu');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser !== undefined) {
      setIsLoading(false);
    }
  }, [currentUser]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-border"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand border-t-transparent absolute top-0 left-0"></div>
          </div>
          <p className="text-muted animate-pulse">Loading your coffee experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Unauthenticated>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8 animate-fade-in">
              <div className="inline-flex p-4 bg-gradient-to-br from-brand to-brand-dark rounded-2xl shadow-xl mb-4 transform hover:scale-105 transition-transform duration-300">
                <Icons.Coffee className="text-white w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold text-gradient mb-2">
                Welcome Back
              </h1>
              <p className="text-muted">Sign in to your Coffee Shop Pro account</p>
            </div>
            
            <div className="bg-surface rounded-2xl shadow-xl border border-border/50 p-8 animate-slide-up">
              <SignInForm />
            </div>
            
            <div className="mt-6 animate-fade-in-delayed">
              <TestAccountsInfo />
            </div>
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        <div className="animate-fade-in">
          {/* User Info Bar */}
          <div className="bg-surface border-b border-border/50 px-4 py-3 shadow-sm">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-brand to-brand-dark rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                  {currentUser?.name?.charAt(0) || currentUser?.profile?.firstName?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {currentUser?.name || `${currentUser?.profile?.firstName || ''} ${currentUser?.profile?.lastName || ''}`.trim() || 'User'}
                  </p>
                  <div className="flex items-center gap-2">
                    <RoleBadge role={currentUser?.profile?.role || 'customer'} />
                    {currentUser?.email && (
                      <span className="text-sm text-muted">{currentUser.email}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="bg-surface border-b border-border/50 sticky top-16 z-40 shadow-sm">
            <div className="max-w-7xl mx-auto px-4">
              <nav className="flex space-x-1 overflow-x-auto py-2">
                {getNavigationItems(currentUser?.profile?.role || 'customer').map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 whitespace-nowrap transform hover:scale-105 ${
                        isActive
                          ? 'bg-gradient-to-r from-brand to-brand-dark text-white shadow-lg'
                          : 'text-muted hover:text-foreground hover:bg-background'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-7xl mx-auto p-4 animate-slide-up">
            {activeTab === 'menu' && <MenuView />}
            {activeTab === 'cart' && <CartView />}
            {activeTab === 'orders' && <OrdersView />}
            {activeTab === 'loyalty' && <LoyaltyView />}
            {activeTab === 'admin' && <AdminPanel />}
            {activeTab === 'barista' && <BaristaPanel />}
            {activeTab === 'manager' && <ManagerPanel />}
          </div>
        </div>
      </Authenticated>
    </div>
  );
}

function getNavigationItems(role: string) {
  const baseItems = [
    { id: 'menu', label: 'Menu', icon: Icons.Coffee },
    { id: 'cart', label: 'Cart', icon: Icons.ShoppingCart },
    { id: 'orders', label: 'My Orders', icon: Icons.ClipboardList },
    { id: 'loyalty', label: 'Rewards', icon: Icons.Star },
  ];

  if (role === 'admin') {
    return [
      ...baseItems,
      { id: 'admin', label: 'Admin Panel', icon: Icons.Cog },
      { id: 'manager', label: 'Manager Tools', icon: Icons.ChartBar },
      { id: 'barista', label: 'Barista Panel', icon: Icons.Coffee },
    ];
  }

  if (role === 'manager') {
    return [
      ...baseItems,
      { id: 'manager', label: 'Manager Tools', icon: Icons.ChartBar },
      { id: 'barista', label: 'Barista Panel', icon: Icons.Coffee },
    ];
  }

  if (role === 'barista') {
    return [
      ...baseItems,
      { id: 'barista', label: 'Barista Panel', icon: Icons.Coffee },
    ];
  }

  return baseItems;
}
