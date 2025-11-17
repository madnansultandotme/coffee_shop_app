import { useQuery } from "../lib/compat";
import { api, useMutationWithParams } from "../lib/compat";
import { useState } from "react";
import { toast } from "sonner";
import { Icons } from "./Icons";

export function ManagerPanel() {
  const [activeTab, setActiveTab] = useState<'overview' | 'staff' | 'inventory' | 'reports'>('overview');

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Icons.ChartBar />
        <h1 className="text-3xl font-bold">Manager Panel</h1>
      </div>

      {/* Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: Icons.ChartBar },
          { id: 'staff', label: 'Staff Management', icon: Icons.Users },
          { id: 'inventory', label: 'Inventory', icon: Icons.Package },
          { id: 'reports', label: 'Reports', icon: Icons.ClipboardList },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
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
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'staff' && <StaffManagementTab />}
      {activeTab === 'inventory' && <InventoryTab />}
      {activeTab === 'reports' && <ReportsTab />}
    </div>
  );
}

function OverviewTab() {
  const orders = useQuery(api.orders.getAllOrders, {});
  const reviews = useQuery(api.reviews.getAllReviews);

  if (!orders || !reviews) {
    return <div className="text-center py-8">Loading overview...</div>;
  }

  const today = new Date().toDateString();
  const todayOrders = orders.filter(order => 
    new Date(order._creationTime).toDateString() === today
  );

  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const statusCounts = {
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    completed: todayOrders.filter(o => o.status === 'completed').length,
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
              <p className="text-sm font-medium text-gray-600">Today's Orders</p>
              <p className="text-2xl font-bold text-blue-600">{todayOrders.length}</p>
            </div>
            <Icons.ClipboardList />
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

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold text-orange-600">{statusCounts.pending}</p>
            </div>
            <Icons.Clock />
          </div>
        </div>
      </div>

      {/* Order Status Overview */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Order Status Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="text-center">
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-sm text-gray-600 capitalize">{status}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Reviews</h3>
        {reviews.slice(0, 5).map((review) => (
          <div key={review._id} className="flex items-start gap-3 py-3 border-b last:border-b-0">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-sm ${
                    star <= review.rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <div className="flex-1">
              {review.comment && (
                <p className="text-sm text-gray-800">{review.comment}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {new Date(review._creationTime).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StaffManagementTab() {
  const staff = useQuery(api.admin.staff.getAllStaff);
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
    return <div className="text-center py-8">Loading staff...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Staff Members</h3>
        <div className="text-sm text-gray-600">
          Total: {staff.length} members
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {staff.map((member) => (
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
                    <button className="text-indigo-600 hover:text-indigo-900">
                      Edit
                    </button>
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

function InventoryTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Inventory Management</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover transition-colors">
          <Icons.Plus />
          Add Item
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <p className="text-gray-600 text-center py-8">
          Inventory management system coming soon...
        </p>
      </div>
    </div>
  );
}

function ReportsTab() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Reports & Analytics</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h4 className="font-semibold mb-4">Sales Report</h4>
          <p className="text-gray-600">Daily, weekly, and monthly sales analytics</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h4 className="font-semibold mb-4">Popular Items</h4>
          <p className="text-gray-600">Most ordered menu items and trends</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h4 className="font-semibold mb-4">Customer Analytics</h4>
          <p className="text-gray-600">Customer behavior and loyalty insights</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h4 className="font-semibold mb-4">Staff Performance</h4>
          <p className="text-gray-600">Order processing times and efficiency</p>
        </div>
      </div>
    </div>
  );
}
