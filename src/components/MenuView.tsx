import { useQuery, useMutation } from "../lib/compat";
import { api } from "../lib/compat";
import { useState } from "react";
import { toast } from "sonner";
import { Icons } from "./Icons";

export function MenuView() {
  const categories = useQuery(api.menu.getCategories);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const allMenuItems = useQuery(api.menu.getAllMenuItems);
  const categoryMenuItems = useQuery(
    api.menu.getMenuItemsByCategory,
    selectedCategory ? { categoryId: selectedCategory as any } : "skip"
  );
  const searchResults = useQuery(
    api.menu.searchMenuItems,
    searchTerm ? { searchTerm } : "skip"
  );
  
  const menuItems = selectedCategory 
    ? categoryMenuItems 
    : searchTerm 
      ? searchResults
      : allMenuItems;

  const addToCart = useMutation(api.cart.addToCart);

  const handleAddToCart = async (itemId: string, size: string = "medium") => {
    try {
      await addToCart({
        menuItemId: itemId as any,
        quantity: 1,
        size,
      });
      toast.success("Added to cart!");
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  if (!categories || !menuItems) {
    return <div className="text-center py-8">Loading menu...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Icons.Coffee />
          <h1 className="text-3xl font-bold">Our Menu</h1>
        </div>
        
        {/* Search */}
        <div className="mb-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icons.Search />
          </div>
          <input
            type="text"
            placeholder="Search for coffee, snacks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => {
              setSelectedCategory(null);
              setSearchTerm("");
            }}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              !selectedCategory && !searchTerm
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Items
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => {
                setSelectedCategory(category._id);
                setSearchTerm("");
              }}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                selectedCategory === category._id
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <div className="flex gap-1">
                  {item.isVegetarian && (
                    <span className="text-green-600 text-sm flex items-center">
                      <Icons.Leaf />
                    </span>
                  )}
                  {item.isVegan && (
                    <span className="text-green-600 text-sm flex items-center">
                      <Icons.Leaf />
                    </span>
                  )}
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-3">{item.description}</p>
              
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">Ingredients:</p>
                <p className="text-xs text-gray-600">{item.ingredients.join(", ")}</p>
              </div>

              <div className="flex justify-between items-center mb-3">
                <span className="text-lg font-bold text-primary">
                  ${item.basePrice.toFixed(2)}+
                </span>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Icons.Clock />
                  {item.preparationTime} min
                </div>
              </div>

              {/* Size options */}
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Sizes:</p>
                <div className="flex gap-2">
                  {item.variants.map((variant) => (
                    <button
                      key={variant.size}
                      onClick={() => handleAddToCart(item._id, variant.size)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium capitalize">{variant.size}</div>
                      <div className="text-xs text-gray-600">
                        ${(item.basePrice + variant.priceModifier).toFixed(2)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleAddToCart(item._id)}
                className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
              >
                <Icons.ShoppingCart />
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {menuItems.length === 0 && (
        <div className="text-center py-12">
          <Icons.Coffee />
          <p className="text-gray-500 mt-2">No items found</p>
        </div>
      )}
    </div>
  );
}
