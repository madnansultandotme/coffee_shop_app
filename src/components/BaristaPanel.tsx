import { useQuery } from "../lib/compat";
import { api, useMutationWithParams } from "../lib/compat";
import { useState } from "react";
import { toast } from "sonner";
import { Icons } from "./Icons";

export function BaristaPanel() {
  const [statusFilter, setStatusFilter] = useState<string>("confirmed");
  const orders = useQuery(api.orders.getAllOrders, statusFilter ? { status: statusFilter as any } : {});
  const updateOrderStatus = useMutationWithParams(api.orders.updateOrderStatus);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus({ id: orderId as any, status: newStatus as any });
      toast.success("Order status updated");
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed": return "bg-blue-100 text-blue-800 border-blue-200";
      case "preparing": return "bg-orange-100 text-orange-800 border-orange-200";
      case "ready": return "bg-green-100 text-green-800 border-green-200";
      case "completed": return "bg-gray-100 text-gray-800 border-gray-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case "pending": return "confirmed";
      case "confirmed": return "preparing";
      case "preparing": return "ready";
      case "ready": return "completed";
      default: return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return Icons.Clock;
      case "confirmed": return Icons.CheckCircle;
      case "preparing": return Icons.Coffee;
      case "ready": return Icons.Package;
      case "completed": return Icons.CheckCircle;
      case "cancelled": return Icons.XCircle;
      default: return Icons.Clock;
    }
  };

  if (!orders) {
    return <div className="text-center py-8">Loading orders...</div>;
  }

  const activeOrders = orders.filter(order => 
    ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Icons.Coffee />
        <h1 className="text-3xl font-bold">Barista Panel</h1>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {['confirmed', 'preparing', 'ready', 'completed'].map((status) => {
          const count = orders.filter(order => order.status === status).length;
          const StatusIcon = getStatusIcon(status);
          return (
            <div key={status} className={`p-4 rounded-lg border ${getStatusColor(status)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm font-medium capitalize">{status}</p>
                </div>
                <StatusIcon />
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Filter */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Active Orders</h2>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">All Orders</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {activeOrders.map((order) => {
          const StatusIcon = getStatusIcon(order.status);
          const nextStatus = getNextStatus(order.status);
          
          return (
            <div key={order._id} className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold">#{order.orderNumber}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(order._creationTime).toLocaleTimeString()}
                  </p>
                  <p className="text-sm text-gray-600 capitalize">
                    {order.orderType} • ${order.totalAmount.toFixed(2)}
                  </p>
                </div>
                
                <div className="text-right">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                    <StatusIcon />
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-3">
                <h4 className="text-sm font-medium mb-2">Items:</h4>
                <div className="space-y-1">
                  {order.items.map((item, index) => (
                    <div key={index} className="text-sm flex justify-between">
                      <span>
                        {item.quantity}x {item.size}
                        {item.specialInstructions && (
                          <span className="text-gray-600 italic block text-xs">
                            Note: {item.specialInstructions}
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Notes */}
              {order.customerNotes && (
                <div className="mb-3 p-2 bg-yellow-50 rounded text-sm">
                  <p className="font-medium text-yellow-800">Customer Notes:</p>
                  <p className="text-yellow-700">{order.customerNotes}</p>
                </div>
              )}

              {/* Estimated Ready Time */}
              {order.estimatedReadyTime && order.status !== "completed" && (
                <div className="mb-3 p-2 bg-blue-50 rounded text-sm">
                  <div className="flex items-center gap-1 text-blue-800">
                    <Icons.Clock />
                    <span className="font-medium">Ready by:</span>
                  </div>
                  <p className="text-blue-700">
                    {new Date(order.estimatedReadyTime).toLocaleTimeString()}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-3 border-t">
                {nextStatus && (
                  <button
                    onClick={() => handleStatusUpdate(order._id, nextStatus)}
                    className="flex-1 px-3 py-2 bg-primary text-white rounded hover:bg-primary-hover transition-colors text-sm font-medium"
                  >
                    Mark as {nextStatus}
                  </button>
                )}
                
                {order.status !== "cancelled" && order.status !== "completed" && (
                  <button
                    onClick={() => handleStatusUpdate(order._id, "cancelled")}
                    className="px-3 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {activeOrders.length === 0 && (
        <div className="text-center py-12">
          <Icons.Coffee />
          <p className="text-gray-500 mt-2">No active orders</p>
        </div>
      )}
    </div>
  );
}
