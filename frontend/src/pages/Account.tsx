import React, { useState } from 'react';
import { User, Package, Heart, MapPin, CreditCard, Settings, LogOut, Plus, X, Trash2, Edit } from 'lucide-react';

const Account: React.FC = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [newCondition, setNewCondition] = useState('');
  const [isAddingCondition, setIsAddingCondition] = useState(false);
  const [newAddress, setNewAddress] = useState({
    type: 'Home',
    address: '',
    city: ''
  });
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newPayment, setNewPayment] = useState({
    cardNumber: '',
    expiry: '',
    name: ''
  });
  const [isAddingPayment, setIsAddingPayment] = useState(false);

  // Hardcoded user data for Anita Sharma
  const [user, setUser] = useState({
    name: 'Anita Sharma',
    age: 50,
    email: 'anita.sharma@gmail.com',
    healthConditions: ['hypertension'],
    previousOrders: [
      {
        productId: 'p00005',
        name: 'Natural Orange Juice',
        category: 'Vegetables',
        price: 6.61,
        nutritionInfo: {
          calories: 74,
          protein: 20.0,
          fiber: 8.9,
          sugar: 20.7
        },
        purchasedAt: '2024-05-15',
        status: 'Delivered'
      },
      {
        productId: 'p00003',
        name: 'Organic Bell Pepper',
        category: 'Vegetables',
        price: 11.02,
        nutritionInfo: {
          calories: 73,
          protein: 7.4,
          fiber: 7.3,
          sugar: 0.4
        },
        purchasedAt: '2024-06-20',
        status: 'Delivered'
      }
    ],
    addresses: [
      {
        id: 1,
        type: 'Home',
        name: 'Anita Sharma',
        address: '456 Health Lane, Apartment 3C',
        city: 'Mumbai, MH 400001',
        isDefault: true
      }
    ],
    paymentMethods: [
      {
        id: 1,
        type: 'VISA',
        lastFour: '1234',
        expiry: '12/25',
        name: 'Anita Sharma'
      }
    ],
    wishlist: [
      {
        id: 'p00008',
        name: 'Organic Green Tea',
        price: 8.99,
        image: '/products/green-tea.jpg'
      },
      {
        id: 'p00012',
        name: 'Whole Grain Bread',
        price: 4.50,
        image: '/products/bread.jpg'
      }
    ]
  });

  const menuItems = [
    { id: 'orders', label: 'Order History', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'payment', label: 'Payment Methods', icon: CreditCard },
    { id: 'settings', label: 'Account Settings', icon: Settings },
  ];

  // Health Conditions Functions
  const handleAddCondition = () => {
    if (newCondition.trim() && !user.healthConditions.includes(newCondition.trim())) {
      setUser({
        ...user,
        healthConditions: [...user.healthConditions, newCondition.trim()]
      });
      setNewCondition('');
    }
    setIsAddingCondition(false);
  };

  const handleRemoveCondition = (conditionToRemove: string) => {
    setUser({
      ...user,
      healthConditions: user.healthConditions.filter(condition => condition !== conditionToRemove)
    });
  };

  // Address Functions
  const handleAddAddress = () => {
    if (newAddress.address.trim() && newAddress.city.trim()) {
      const newId = Math.max(...user.addresses.map(a => a.id), 0) + 1;
      setUser({
        ...user,
        addresses: [
          ...user.addresses,
          {
            id: newId,
            type: newAddress.type,
            name: user.name,
            address: newAddress.address.trim(),
            city: newAddress.city.trim(),
            isDefault: false
          }
        ]
      });
      setNewAddress({ type: 'Home', address: '', city: '' });
    }
    setIsAddingAddress(false);
  };

  const handleRemoveAddress = (id: number) => {
    setUser({
      ...user,
      addresses: user.addresses.filter(address => address.id !== id)
    });
  };

  const handleSetDefaultAddress = (id: number) => {
    setUser({
      ...user,
      addresses: user.addresses.map(address => ({
        ...address,
        isDefault: address.id === id
      }))
    });
  };

  // Payment Methods Functions
  const handleAddPayment = () => {
    if (newPayment.cardNumber.trim() && newPayment.expiry.trim() && newPayment.name.trim()) {
      const newId = Math.max(...user.paymentMethods.map(p => p.id), 0) + 1;
      setUser({
        ...user,
        paymentMethods: [
          ...user.paymentMethods,
          {
            id: newId,
            type: 'VISA', // This would normally be determined from card number
            lastFour: newPayment.cardNumber.slice(-4),
            expiry: newPayment.expiry.trim(),
            name: newPayment.name.trim()
          }
        ]
      });
      setNewPayment({ cardNumber: '', expiry: '', name: '' });
    }
    setIsAddingPayment(false);
  };

  const handleRemovePayment = (id: number) => {
    setUser({
      ...user,
      paymentMethods: user.paymentMethods.filter(payment => payment.id !== id)
    });
  };

  // Wishlist Functions
  const handleRemoveFromWishlist = (id: string) => {
    setUser({
      ...user,
      wishlist: user.wishlist.filter(item => item.id !== id)
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Order History</h2>
            {user.previousOrders.length > 0 ? (
              <div className="space-y-4">
                {user.previousOrders.map((order, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{order.name}</h3>
                        <p className="text-gray-600">Purchased on {new Date(order.purchasedAt).toLocaleDateString()}</p>
                        <p className="text-gray-600">{order.category}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-medium mb-2">Nutrition Info</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <p><strong>Calories:</strong> {order.nutritionInfo.calories}</p>
                          <p><strong>Protein:</strong> {order.nutritionInfo.protein}g</p>
                          <p><strong>Fiber:</strong> {order.nutritionInfo.fiber}g</p>
                          <p><strong>Sugar:</strong> {order.nutritionInfo.sugar}g</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">${order.price.toFixed(2)}</p>
                        <p className="text-gray-600">Product ID: {order.productId}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <button className="text-[#0071ce] hover:underline">Reorder</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <p className="text-gray-600">You haven't placed any orders yet.</p>
              </div>
            )}
          </div>
        );

      case 'wishlist':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Your Wishlist</h2>
            {user.wishlist.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {user.wishlist.map((item) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="h-48 bg-gray-100 flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                      <p className="text-lg font-bold text-[#0071ce] mb-3">${item.price.toFixed(2)}</p>
                      <div className="flex justify-between">
                        <button className="text-[#0071ce] hover:underline">Add to Cart</button>
                        <button
                          onClick={() => handleRemoveFromWishlist(item.id)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <Heart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Your wishlist is empty</p>
                <button className="text-[#0071ce] hover:underline mt-2">
                  Browse Products
                </button>
              </div>
            )}
          </div>
        );

      case 'addresses':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Saved Addresses</h2>
              <button
                onClick={() => setIsAddingAddress(true)}
                className="bg-[#0071ce] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add New Address
              </button>
            </div>

            {isAddingAddress && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-lg mb-4">Add New Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={newAddress.type}
                      onChange={(e) => setNewAddress({ ...newAddress, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071ce]"
                    >
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      value={newAddress.address}
                      onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071ce]"
                      placeholder="Street address"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071ce]"
                      placeholder="City, State, ZIP"
                    />
                  </div>
                </div>
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={handleAddAddress}
                    className="bg-[#0071ce] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Address
                  </button>
                  <button
                    onClick={() => setIsAddingAddress(false)}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {user.addresses.map((address) => (
                <div key={address.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center">
                        {address.type}
                        {address.isDefault && (
                          <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Default
                          </span>
                        )}
                      </h3>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Edit className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="text-gray-600">
                    <p className="font-medium">{address.name}</p>
                    <p>{address.address}</p>
                    <p>{address.city}</p>
                  </div>
                  <div className="mt-4 flex space-x-4 text-sm">
                    {!address.isDefault && (
                      <>
                        <button
                          onClick={() => handleSetDefaultAddress(address.id)}
                          className="text-[#0071ce] hover:underline"
                        >
                          Set as Default
                        </button>
                        <button
                          onClick={() => handleRemoveAddress(address.id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'payment':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Payment Methods</h2>
              <button
                onClick={() => setIsAddingPayment(true)}
                className="bg-[#0071ce] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Payment Method
              </button>
            </div>

            {isAddingPayment && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-lg mb-4">Add Payment Method</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                    <input
                      type="text"
                      value={newPayment.cardNumber}
                      onChange={(e) => setNewPayment({ ...newPayment, cardNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071ce]"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                      <input
                        type="text"
                        value={newPayment.expiry}
                        onChange={(e) => setNewPayment({ ...newPayment, expiry: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071ce]"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name on Card</label>
                      <input
                        type="text"
                        value={newPayment.name}
                        onChange={(e) => setNewPayment({ ...newPayment, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071ce]"
                        placeholder="Name"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={handleAddPayment}
                    className="bg-[#0071ce] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Payment Method
                  </button>
                  <button
                    onClick={() => setIsAddingPayment(false)}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {user.paymentMethods.map((payment) => (
                <div key={payment.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-8 bg-gray-200 rounded mr-4 flex items-center justify-center">
                        {payment.type === 'VISA' && (
                          <span className="text-xs font-bold text-blue-800">VISA</span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">•••• •••• •••• {payment.lastFour}</p>
                        <p className="text-gray-600 text-sm">Expires {payment.expiry}</p>
                      </div>
                    </div>
                    <div className="flex space-x-4 text-sm">
                      <button className="text-[#0071ce] hover:underline">Edit</button>
                      <button
                        onClick={() => handleRemovePayment(payment.id)}
                        className="text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'settings':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={user.name}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071ce]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    value={user.age}
                    onChange={(e) => setUser({ ...user, age: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071ce]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Health Conditions</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {user.healthConditions.map((condition, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center"
                      >
                        {condition}
                        <button
                          onClick={() => handleRemoveCondition(condition)}
                          className="ml-1 text-gray-500 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  {isAddingCondition ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCondition}
                        onChange={(e) => setNewCondition(e.target.value)}
                        placeholder="Add new condition"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071ce]"
                      />
                      <button
                        onClick={handleAddCondition}
                        className="bg-[#0071ce] text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setIsAddingCondition(false)}
                        className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAddingCondition(true)}
                      className="flex items-center text-[#0071ce] hover:text-blue-700 mt-1"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Health Condition
                    </button>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071ce]"
                  />
                </div>
              </div>
              <button className="mt-4 bg-[#0071ce] text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                  <User className="w-8 h-8 text-gray-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">{user.name}</h2>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>

              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === item.id
                      ? 'bg-[#0071ce] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                ))}
                <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;