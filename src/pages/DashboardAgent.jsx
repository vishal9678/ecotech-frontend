import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';

const DashboardAgent = () => {
  const { user } = useAuth();
  const [pendingPickups, setPendingPickups] = useState([]);
  const [myPickups, setMyPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchData();

    // Connect to Socket.io for real-time updates
    const socket = io('https://ecotech-backend-7.onrender.com');

    socket.on('new-pickup-available', () => {
      if (activeTab === 'pending') {
        fetchData(); // Refresh pending pickups
      }
    });

    socket.on('pickup-updated', () => {
      fetchData(); // Refresh all data
    });

    return () => {
      socket.disconnect();
    };
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const [pendingRes, myPickupsRes] = await Promise.all([
        api.get('/pickups/pending'),
        api.get('/pickups/agent-pickups'),
      ]);
      setPendingPickups(pendingRes.data.data.pickups);
      setMyPickups(myPickupsRes.data.data.pickups);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (pickupId) => {
    try {
      await api.post(`/pickups/${pickupId}/accept`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to accept pickup');
    }
  };

  const handleStatusUpdate = async (pickupId, status) => {
    try {
      await api.put(`/pickups/${pickupId}/status`, { status });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status');
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

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      accepted: 'on_the_way',
      on_the_way: 'picked',
      picked: 'completed',
    };
    return statusFlow[currentStatus];
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
          <h1 className="text-3xl font-bold text-gray-900">Agent Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome, {user?.name}</p>
        </div>

        <div className="mb-6 flex space-x-4 border-b">
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-4 px-4 font-medium ${
              activeTab === 'pending'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600'
            }`}
          >
            Pending Pickups ({pendingPickups.length})
          </button>
          <button
            onClick={() => setActiveTab('my-pickups')}
            className={`pb-4 px-4 font-medium ${
              activeTab === 'my-pickups'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600'
            }`}
          >
            My Pickups ({myPickups.length})
          </button>
        </div>

        {activeTab === 'pending' && (
          <div className="space-y-4">
            {pendingPickups.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-500">No pending pickups available</p>
              </div>
            ) : (
              pendingPickups.map((pickup) => (
                <div key={pickup._id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">
                        {pickup.itemId?.title}
                      </h3>
                      <p className="text-gray-600 mb-2">{pickup.itemId?.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded">
                          {pickup.itemId?.category?.name}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                          {pickup.itemId?.action}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        <strong>User:</strong> {pickup.userId?.name} - {pickup.userId?.phone}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Address:</strong> {pickup.userId?.address?.fullAddress}
                      </p>
                    </div>
                    {pickup.itemId?.images?.[0] && (
                      <img
                        src={`http://localhost:5001${pickup.itemId.images[0]}`}
                        alt={pickup.itemId.title}
                        className="w-32 h-32 object-cover rounded ml-4"
                      />
                    )}
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => handleAccept(pickup._id)}
                      className="btn-primary"
                    >
                      Accept Pickup
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'my-pickups' && (
          <div className="space-y-4">
            {myPickups.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-500">No assigned pickups</p>
              </div>
            ) : (
              myPickups.map((pickup) => (
                <div key={pickup._id} className="card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">
                        {pickup.itemId?.title}
                      </h3>
                      <p className="text-gray-600 mb-2">{pickup.itemId?.description}</p>
                      <p className="text-sm text-gray-600">
                        <strong>User:</strong> {pickup.userId?.name} - {pickup.userId?.phone}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(
                        pickup.status
                      )}`}
                    >
                      {pickup.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  {getNextStatus(pickup.status) && (
                    <button
                      onClick={() => handleStatusUpdate(pickup._id, getNextStatus(pickup.status))}
                      className="btn-primary"
                    >
                      Mark as {getNextStatus(pickup.status).replace('_', ' ').toUpperCase()}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardAgent;

