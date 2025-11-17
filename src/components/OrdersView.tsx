import { useQuery } from "../lib/compat";
import { api, useMutationWithParams } from "../lib/compat";
import { useState } from "react";
import { toast } from "sonner";
import { Icons } from "./Icons";

export function OrdersView() {
  const orders = useQuery(api.orders.getUserOrders);
  const reorder = useMutationWithParams(api.orders.reorder);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const handleReorder = async (orderId: string) => {
    try {
      await reorder({ orderId: orderId as any });
      toast.success("Items added to cart!");
    } catch (error) {
      toast.error("Failed to reorder");
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

  if (orders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <Icons.ClipboardList />
        <h2 className="text-2xl font-bold mt-4 mb-2">No orders yet</h2>
        <p className="text-gray-600">Your order history will appear here once you place your first order.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Icons.ClipboardList />
        <h1 className="text-3xl font-bold">My Orders</h1>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const StatusIcon = getStatusIcon(order.status);
          const isExpanded = selectedOrder === order._id;
          
          return (
            <div key={order._id} className="bg-white rounded-lg shadow-sm border">
              <div 
                className="p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedOrder(isExpanded ? null : order._id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">Order #{order.orderNumber}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        <StatusIcon />
                        {order.status}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{new Date(order._creationTime).toLocaleDateString()} at {new Date(order._creationTime).toLocaleTimeString()}</p>
                      <p className="capitalize">{order.orderType} • {order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                      <p className="font-medium text-gray-900">${order.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {order.status === "completed" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReorder(order._id);
                        }}
                        className="px-3 py-1 text-sm border border-primary text-primary rounded hover:bg-primary hover:text-white transition-colors"
                      >
                        Reorder
                      </button>
                    )}
                    
                    <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t p-4 bg-gray-50">
                  {/* Order Items */}
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Items Ordered:</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <div>
                            <span className="font-medium">{item.quantity}x</span>
                            <span className="ml-2 capitalize">{item.size}</span>
                            {item.specialInstructions && (
                              <div className="text-gray-600 italic text-xs ml-6">
                                Note: {item.specialInstructions}
                              </div>
                            )}
                          </div>
                          <span className="font-medium">${item.totalPrice.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium mb-1">Order Details:</h5>
                      <div className="space-y-1 text-gray-600">
                        <p>Payment: {order.paymentMethod}</p>
                        <p>Status: {order.paymentStatus}</p>
                        {order.estimatedReadyTime && order.status !== "completed" && (
                          <p>
                            <span className="flex items-center gap-1">
                              <Icons.Clock />
                              Ready by: {new Date(order.estimatedReadyTime).toLocaleTimeString()}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-1">Order Summary:</h5>
                      <div className="space-y-1 text-gray-600">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>${order.subtotal.toFixed(2)}</span>
                        </div>
                        {order.discount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount:</span>
                            <span>-${order.discount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Tax:</span>
                          <span>${order.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-medium text-gray-900 border-t pt-1">
                          <span>Total:</span>
                          <span>${order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Notes */}
                  {order.customerNotes && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                      <h5 className="font-medium text-yellow-800 mb-1">Your Notes:</h5>
                      <p className="text-yellow-700 text-sm">{order.customerNotes}</p>
                    </div>
                  )}

                  {/* Delivery Address */}
                  {order.deliveryAddress && (
                    <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                      <h5 className="font-medium text-blue-800 mb-1">Delivery Address:</h5>
                      <div className="text-blue-700 text-sm">
                        <p>{order.deliveryAddress.street}</p>
                        <p>{order.deliveryAddress.city}, {order.deliveryAddress.zipCode}</p>
                        <p>Phone: {order.deliveryAddress.phone}</p>
                      </div>
                    </div>
                  )}

                  {/* Loyalty Points */}
                  {(order.loyaltyPointsEarned > 0 || order.loyaltyPointsUsed) && (
                    <div className="mt-4 p-3 bg-purple-50 rounded border border-purple-200">
                      <h5 className="font-medium text-purple-800 mb-1">Loyalty Points:</h5>
                      <div className="text-purple-700 text-sm space-y-1">
                        {order.loyaltyPointsUsed && (
                          <p>Points Used: {order.loyaltyPointsUsed} (-${(order.loyaltyPointsUsed * 0.01).toFixed(2)})</p>
                        )}
                        {order.loyaltyPointsEarned > 0 && (
                          <p>Points Earned: {order.loyaltyPointsEarned}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
