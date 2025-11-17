import { useQuery } from "../lib/compat";
import { api, useMutationWithParams } from "../lib/compat";

type OrderItem = {
  menuItemId: string;
  quantity: number;
  size: string;
  unitPrice?: number;
  totalPrice: number;
  specialInstructions?: string;
};

type Order = {
  _id: string;
  orderNumber: string;
  status: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";
  orderType: "pickup" | "delivery";
  items: OrderItem[];
  totalAmount: number;
  subtotal?: number;
  tax?: number;
  discount?: number;
  _creationTime: number;
  customerNotes?: string;
  estimatedReadyTime?: number;
};

type Review = {
  _id: string;
  rating: number;
  comment?: string;
  _creationTime: number;
};

type StaffProfile = {
  _id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  role: "customer" | "barista" | "manager" | "admin";
  isActive: boolean;
  hireDate?: number | string;
  user?: { email?: string } | null;
};

type Category = {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
};

type MenuItem = {
  _id: string;
  name: string;
  description: string;
  categoryId: string;
  basePrice: number;
  isAvailable: boolean;
  variants: { size: string; priceModifier: number }[];
};
import { useState } from "react";
import { toast } from "sonner";
import { Icons } from "./Icons";

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'menu' | 'settings'>('overview');

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Icons.Cog />
        <h1 className="text-3xl font-bold">Admin Panel</h1>
      </div>

      {/* Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: Icons.ChartBar },
          { id: 'users', label: 'User Management', icon: Icons.Users },
          { id: 'menu', label: 'Menu Management', icon: Icons.Coffee },
          { id: 'settings', label: 'Store Settings', icon: Icons.Cog },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeTab === 'overview' && <AdminOverviewTab />}
      {activeTab === 'users' && <UserManagementTab />}
      {activeTab === 'menu' && <MenuManagementTab />}
      {activeTab === 'settings' && <StoreSettingsTab />}
      
    </div>
  );
}

function AdminOverviewTab() {
  const orders = useQuery<Order[]>(api.orders.getAllOrders, {});
  const users = useQuery<StaffProfile[]>(api.admin.staff.getAllStaff);
  const reviews = useQuery<Review[]>(api.reviews.getAllReviews);

  if (!orders || !users || !reviews) {
    return <div className="text-center py-8">Loading overview...</div>;
  }

  const today = new Date().toDateString();
  const todayOrders = orders.filter((order: Order) => new Date(order._creationTime).toDateString() === today);

  const todayRevenue = todayOrders.reduce((sum: number, order: Order) => sum + order.totalAmount, 0);
  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum: number, review: Review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const statusCounts = {
    pending: orders.filter((o: Order) => o.status === 'pending').length,
    preparing: orders.filter((o: Order) => o.status === 'preparing').length,
    ready: orders.filter((o: Order) => o.status === 'ready').length,
    completed: orders.filter((o: Order) => o.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
              <p className="text-2xl font-bold text-green-600">${todayRevenue.toFixed(2)}</p>
            </div>
            <Icons.ChartBar />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-blue-600">{orders.length}</p>
            </div>
            <Icons.ClipboardList />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Staff Members</p>
              <p className="text-2xl font-bold text-purple-600">{users.length}</p>
            </div>
            <Icons.Users />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-yellow-600">{avgRating.toFixed(1)}/5</p>
            </div>
            <Icons.Star />
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">System Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="text-center">
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-sm text-gray-600 capitalize">{status} Orders</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
        <div className="space-y-3">
        {orders.slice(0, 5).map((order: Order) => (
          <div key={order._id} className="flex justify-between items-center py-2 border-b last:border-b-0">
              <div>
                <p className="font-medium">#{order.orderNumber}</p>
                <p className="text-sm text-gray-600">
                  {new Date(order._creationTime).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">${order.totalAmount.toFixed(2)}</p>
                <p className="text-sm text-gray-600 capitalize">{order.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function UserManagementTab() {
  const staff = useQuery<StaffProfile[]>(api.admin.staff.getAllStaff);
  const updateUserRole = useMutationWithParams(api.admin.users.updateUserRole);

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    try {
      await updateUserRole({ id: userId as any, role: newRole as any });
      toast.success("Role updated successfully");
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  if (!staff) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">User Management</h3>
        <div className="text-sm text-gray-600">
          Total: {staff.length} staff members
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {staff.map((member: StaffProfile) => (
                <tr key={member._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {member.firstName} {member.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {member.user?.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleUpdate(member.userId, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="customer">Customer</option>
                      <option value="barista">Barista</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      member.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {member.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.hireDate 
                      ? new Date(member.hireDate).toLocaleDateString()
                      : 'N/A'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MenuManagementTab() {
  const categories = useQuery<Category[]>(api.menu.getAllCategories);
  const menuItems = useQuery<MenuItem[]>(api.menu.getAllMenuItemsAdmin);
  const updateAvailability = useMutationWithParams(api.menu.updateMenuItemAvailability);

  const handleAvailabilityToggle = async (itemId: string, isAvailable: boolean) => {
    try {
      await updateAvailability({ id: itemId as any, isAvailable });
      toast.success("Item availability updated");
    } catch (error) {
      toast.error("Failed to update availability");
    }
  };

  if (!categories || !menuItems) {
    return <div className="text-center py-8">Loading menu...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Menu Management</h3>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover transition-colors">
            <Icons.Plus />
            Add Category
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover transition-colors">
            <Icons.Plus />
            Add Menu Item
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h4 className="font-semibold mb-4">Categories ({categories.length})</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category: Category) => (
            <div key={category._id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h5 className="font-medium">{category.name}</h5>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  category.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-gray-600">{category.description}</p>
              <p className="text-xs text-gray-500 mt-2">
                Items: {menuItems.filter(item => item.categoryId === category._id).length}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h4 className="font-semibold">Menu Items ({menuItems.length})</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Available
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {menuItems.map((item: MenuItem) => {
                const category = categories.find((c: Category) => c._id === item.categoryId);
                return (
                  <tr key={item._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.description.substring(0, 50)}...</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${item.basePrice.toFixed(2)}+
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleAvailabilityToggle(item._id, !item.isAvailable)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.isAvailable 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                        <Icons.Edit />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StoreSettingsTab() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Store Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h4 className="font-semibold mb-4">Store Information</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
              <input
                type="text"
                defaultValue="Coffee Shop Pro"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                defaultValue="(555) 123-4567"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                defaultValue="info@coffeeshoppro.com"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h4 className="font-semibold mb-4">Business Settings</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
              <input
                type="number"
                step="0.01"
                defaultValue="8.00"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Fee ($)</label>
              <input
                type="number"
                step="0.01"
                defaultValue="2.99"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Delivery Order ($)</label>
              <input
                type="number"
                step="0.01"
                defaultValue="15.00"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="px-6 py-2 bg-primary text-white rounded hover:bg-primary-hover transition-colors">
          Save Settings
        </button>
      </div>
    </div>
  );
}
