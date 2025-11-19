import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';

const DashboardUser = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();

    // Connect to Socket.io for real-time updates
    const socket = io('http://localhost:5001');
    
    if (user?.id) {
      socket.emit('join-room', user.id);
    }

    socket.on('pickup-updated', (data) => {
      fetchData(); // Refresh data when pickup status changes
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const fetchData = async () => {
    try {
      const [itemsRes, pickupsRes] = await Promise.all([
        api.get('/items/my-items'),
        api.get('/pickups/my-pickups'),
      ]);
      setItems(itemsRes.data.data.items);
      setPickups(pickupsRes.data.data.pickups);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      on_the_way: 'bg-purple-100 text-purple-800',
      picked: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}</h1>
          <p className="text-gray-600 mt-2">Manage your junk items and track pickups</p>
        </div>

        <div className="mb-6">
          <Link to="/items/create" className="btn-primary">
            + Create New Item
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Items */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">My Items</h2>
            {items.length === 0 ? (
              <p className="text-gray-500">No items yet. Create your first item!</p>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        <span className="inline-block mt-2 px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded">
                          {item.category?.name}
                        </span>
                      </div>
                      {item.images?.[0] && (
                        <img
                          src={`http://localhost:5001${item.images[0]}`}
                          alt={item.title}
                          className="w-20 h-20 object-cover rounded ml-4"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Pickups */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Pickup Status</h2>
            {pickups.length === 0 ? (
              <p className="text-gray-500">No pickup requests yet.</p>
            ) : (
              <div className="space-y-4">
                {pickups.map((pickup) => (
                  <div key={pickup._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium">{pickup.itemId?.title}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                          pickup.status
                        )}`}
                      >
                        {pickup.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    {pickup.agentId?.userId && (
                      <p className="text-sm text-gray-600">
                        Agent: {pickup.agentId.userId.name}
                      </p>
                    )}
                    <Link
                      to={`/pickup/${pickup._id}`}
                      className="text-primary-600 text-sm hover:underline mt-2 inline-block"
                    >
                      View Details →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardUser;

