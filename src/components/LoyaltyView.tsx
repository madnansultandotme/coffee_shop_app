import { useQuery, api } from "../lib/compat";
import { Icons } from "./Icons";

export function LoyaltyView() {
  const loyaltyPoints = useQuery(api.loyalty.getUserLoyaltyPoints);
  const transactions = useQuery(api.loyalty.getUserLoyaltyTransactions);

  if (!loyaltyPoints || !transactions) {
    return <div className="text-center py-8">Loading rewards...</div>;
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "earned": return Icons.Plus;
      case "redeemed": return Icons.Minus;
      case "bonus": return Icons.Star;
      default: return Icons.Star;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "earned": return "text-green-600";
      case "redeemed": return "text-red-600";
      case "bonus": return "text-purple-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Icons.Star />
        <h1 className="text-3xl font-bold">Loyalty Rewards</h1>
      </div>

      {/* Points Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Total Points</p>
              <p className="text-3xl font-bold">{loyaltyPoints.totalPoints}</p>
              <p className="text-purple-100 text-sm">Worth ${(loyaltyPoints.totalPoints * 0.01).toFixed(2)}</p>
            </div>
            <Icons.Star />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Points Earned</p>
              <p className="text-3xl font-bold">{loyaltyPoints.totalEarned}</p>
              <p className="text-green-100 text-sm">Lifetime earnings</p>
            </div>
            <Icons.Plus />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Points Redeemed</p>
              <p className="text-3xl font-bold">{loyaltyPoints.totalRedeemed}</p>
              <p className="text-blue-100 text-sm">Total savings: ${(loyaltyPoints.totalRedeemed * 0.01).toFixed(2)}</p>
            </div>
            <Icons.Minus />
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">How Loyalty Points Work</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Icons.Coffee />
            </div>
            <h3 className="font-medium mb-2">Earn Points</h3>
            <p className="text-sm text-gray-600">Get 1 point for every $1 spent on orders</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Icons.Star />
            </div>
            <h3 className="font-medium mb-2">Accumulate Rewards</h3>
            <p className="text-sm text-gray-600">Watch your points grow with every purchase</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Icons.ShoppingCart />
            </div>
            <h3 className="font-medium mb-2">Redeem & Save</h3>
            <p className="text-sm text-gray-600">Use points at checkout: 100 points = $1 off</p>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Points History</h2>
        </div>
        
        <div className="divide-y">
          {transactions.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Icons.Star />
              <p className="mt-2">No transactions yet. Start earning points with your first order!</p>
            </div>
          ) : (
            transactions.map((transaction) => {
              const TransactionIcon = getTransactionIcon(transaction.type);
              const colorClass = getTransactionColor(transaction.type);
              
              return (
                <div key={transaction._id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center ${colorClass}`}>
                      <TransactionIcon />
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(transaction._creationTime).toLocaleDateString()} at{' '}
                        {new Date(transaction._creationTime).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`text-right ${colorClass}`}>
                    <p className="font-semibold">
                      {transaction.points > 0 ? '+' : ''}{transaction.points} points
                    </p>
                    {transaction.points !== 0 && (
                      <p className="text-xs">
                        {transaction.points > 0 ? '+' : ''}${(Math.abs(transaction.points) * 0.01).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Redemption Tips */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Icons.Star />
          <div>
            <h3 className="font-medium text-yellow-800 mb-2">Pro Tips for Earning More Points</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Order regularly to build up your points balance</li>
              <li>• Look out for bonus point promotions and special offers</li>
              <li>• Use points strategically on larger orders for maximum savings</li>
              <li>• Points never expire, so save them up for special treats!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
