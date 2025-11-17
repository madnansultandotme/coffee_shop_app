import { Icons } from "./Icons";

export function TestAccountsInfo() {
  const testAccounts = [
    {
      role: "Admin",
      email: "admin@coffeeshop.com",
      password: "admin123",
      color: "from-purple-500 to-purple-600",
      icon: Icons.Shield,
    },
    {
      role: "Manager", 
      email: "manager@coffeeshop.com",
      password: "manager123",
      color: "from-blue-500 to-blue-600",
      icon: Icons.ChartBar,
    },
    {
      role: "Barista",
      email: "barista@coffeeshop.com", 
      password: "barista123",
      color: "from-green-500 to-green-600",
      icon: Icons.Coffee,
    },
    {
      role: "Customer",
      email: "customer@coffeeshop.com",
      password: "customer123", 
      color: "from-amber-500 to-orange-600",
      icon: Icons.Users,
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 p-6 animate-fade-in-delayed">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
          <Icons.Star className="text-white w-4 h-4" />
        </div>
        <h3 className="font-semibold text-gray-900">Test Accounts</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Use these credentials to test different role functionalities:
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {testAccounts.map((account) => {
          const Icon = account.icon;
          return (
            <div 
              key={account.role}
              className="group p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(`${account.email}\n${account.password}`);
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 bg-gradient-to-br ${account.color} rounded-lg shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="text-white w-4 h-4" />
                </div>
                <span className="font-medium text-gray-900">{account.role}</span>
              </div>
              
              <div className="space-y-1 text-sm">
                <p className="text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded">
                  {account.email}
                </p>
                <p className="text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded">
                  {account.password}
                </p>
              </div>
              
              <div className="mt-2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Click to copy credentials
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
        <div className="flex items-start gap-2">
          <Icons.Shield className="text-amber-600 w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-amber-800 mb-1">Setup Instructions:</p>
            <ol className="text-amber-700 space-y-1 text-xs">
              <li>1. Go to Admin Panel → Sample Data → Click "Create Test Users" to seed credentials</li>
              <li>2. Click "Setup Roles" to assign the correct permissions</li>
              <li>3. Sign in with any account below (passwords are preloaded)</li>
              <li>4. Optionally run "Initialize Sample Data" for demo content</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
