import { useQuery } from "../lib/compat";
import { api, useMutationWithParams } from "../lib/compat";
import { useState } from "react";
import { toast } from "sonner";
import { Icons } from "./Icons";

export function CartView() {
  const cartItems = useQuery(api.cart.getCartItems);
  const updateQuantity = useMutationWithParams(api.cart.updateCartItemQuantity);
  const removeFromCart = useMutationWithParams(api.cart.removeFromCart);
  const clearCart = useMutationWithParams(api.cart.clearCart);
  const createOrder = useMutationWithParams(api.orders.createOrder);
  const loyaltyPoints = useQuery(api.loyalty.getUserLoyaltyPoints);

  const [orderType, setOrderType] = useState<"pickup" | "delivery">("pickup");
  const [customerNotes, setCustomerNotes] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [loyaltyPointsToUse, setLoyaltyPointsToUse] = useState(0);
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: "",
    city: "",
    zipCode: "",
    phone: "",
  });
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart({ cartItemId: itemId as any });
      return;
    }
    
    try {
      await updateQuantity({
        cartItemId: itemId as any,
        quantity: newQuantity,
      });
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCart({ cartItemId: itemId as any });
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      toast.success("Cart cleared");
    } catch (error) {
      toast.error("Failed to clear cart");
    }
  };

  const calculateTotal = () => {
    if (!cartItems) return { subtotal: 0, tax: 0, total: 0 };
    
    const subtotal = cartItems.reduce((sum, item) => {
      const variant = item.menuItem.variants.find(v => v.size === item.size);
      const itemPrice = item.menuItem.basePrice + (variant?.priceModifier || 0);
      return sum + (itemPrice * item.quantity);
    }, 0);

    const loyaltyDiscount = loyaltyPointsToUse * 0.01;
    const taxableAmount = Math.max(0, subtotal - loyaltyDiscount);
    const tax = taxableAmount * 0.08; // 8% tax
    const total = subtotal - loyaltyDiscount + tax;

    return { subtotal, tax, total, loyaltyDiscount };
  };

  const handlePlaceOrder = async () => {
    if (!cartItems || cartItems.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if (orderType === "delivery" && (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.zipCode || !deliveryAddress.phone)) {
      toast.error("Please fill in delivery address");
      return;
    }

    setIsPlacingOrder(true);
    try {
      await createOrder({
        orderType,
        paymentMethod: "card", // In a real app, this would come from payment processing
        customerNotes: customerNotes || undefined,
        deliveryAddress: orderType === "delivery" ? deliveryAddress : undefined,
        promoCode: promoCode || undefined,
        loyaltyPointsUsed: loyaltyPointsToUse || undefined,
      });
      
      toast.success("Order placed successfully!");
      setCustomerNotes("");
      setPromoCode("");
      setLoyaltyPointsToUse(0);
      setDeliveryAddress({ street: "", city: "", zipCode: "", phone: "" });
    } catch (error) {
      toast.error("Failed to place order");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (!cartItems) {
    return <div className="text-center py-8">Loading cart...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <Icons.ShoppingCart />
        <h2 className="text-2xl font-bold mt-4 mb-2">Your cart is empty</h2>
        <p className="text-gray-600">Add some delicious items to get started!</p>
      </div>
    );
  }

  const { subtotal, tax, total, loyaltyDiscount } = calculateTotal();
  const maxLoyaltyPoints = Math.min(loyaltyPoints?.totalPoints || 0, Math.floor(subtotal * 100));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Icons.ShoppingCart />
        <h1 className="text-3xl font-bold">Your Cart</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => {
            const variant = item.menuItem.variants.find(v => v.size === item.size);
            const itemPrice = item.menuItem.basePrice + (variant?.priceModifier || 0);
            
            return (
              <div key={item._id} className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.menuItem.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">Size: {item.size}</p>
                    {item.specialInstructions && (
                      <p className="text-sm text-gray-600 italic">Note: {item.specialInstructions}</p>
                    )}
                    <p className="text-lg font-bold text-primary mt-2">
                      ${itemPrice.toFixed(2)} each
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Icons.Minus />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Icons.Plus />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => handleRemoveItem(item._id)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-3 pt-3 border-t">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="font-semibold">${(itemPrice * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            );
          })}

          <div className="flex justify-between items-center pt-4">
            <button
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* Order Summary & Checkout */}
        <div className="space-y-6">
          {/* Order Type */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-semibold mb-3">Order Type</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="pickup"
                  checked={orderType === "pickup"}
                  onChange={(e) => setOrderType(e.target.value as "pickup")}
                  className="text-primary"
                />
                <span>Pickup</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="delivery"
                  checked={orderType === "delivery"}
                  onChange={(e) => setOrderType(e.target.value as "delivery")}
                  className="text-primary"
                />
                <span>Delivery (+$2.99)</span>
              </label>
            </div>
          </div>

          {/* Delivery Address */}
          {orderType === "delivery" && (
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-semibold mb-3">Delivery Address</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Street Address"
                  value={deliveryAddress.street}
                  onChange={(e) => setDeliveryAddress(prev => ({ ...prev, street: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="City"
                    value={deliveryAddress.city}
                    onChange={(e) => setDeliveryAddress(prev => ({ ...prev, city: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    value={deliveryAddress.zipCode}
                    onChange={(e) => setDeliveryAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={deliveryAddress.phone}
                  onChange={(e) => setDeliveryAddress(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Promo Code */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-semibold mb-3">Promo Code</h3>
            <input
              type="text"
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Loyalty Points */}
          {loyaltyPoints && loyaltyPoints.totalPoints > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-semibold mb-3">Use Loyalty Points</h3>
              <p className="text-sm text-gray-600 mb-2">
                Available: {loyaltyPoints.totalPoints} points (${(loyaltyPoints.totalPoints * 0.01).toFixed(2)})
              </p>
              <input
                type="number"
                min="0"
                max={maxLoyaltyPoints}
                value={loyaltyPointsToUse}
                onChange={(e) => setLoyaltyPointsToUse(Math.min(maxLoyaltyPoints, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Points to use"
              />
            </div>
          )}

          {/* Customer Notes */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-semibold mb-3">Special Instructions</h3>
            <textarea
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              placeholder="Any special requests or notes..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-semibold mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {loyaltyDiscount && loyaltyDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Loyalty Discount:</span>
                  <span>-${loyaltyDiscount.toFixed(2)}</span>
                </div>
              )}
              {orderType === "delivery" && (
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span>$2.99</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>${(total + (orderType === "delivery" ? 2.99 : 0)).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
              className="w-full mt-4 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPlacingOrder ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
