import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import io from 'socket.io-client';

const PickupStatus = () => {
  const { id } = useParams();
  const [pickup, setPickup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPickup();

    // Connect to Socket.io for real-time updates
    const socket = io('https://ecotech-backend-7.onrender.com');
    const userId = JSON.parse(localStorage.getItem('user'))?.id;

    if (userId) {
      socket.emit('join-room', userId);
    }

    socket.on('pickup-updated', (data) => {
      if (data.pickupId === id) {
        fetchPickup();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  const fetchPickup = async () => {
    try {
      const response = await api.get(`/pickups/my-pickups`);
      const pickups = response.data.data.pickups;
      const foundPickup = pickups.find((p) => p._id === id);
      setPickup(foundPickup);
    } catch (error) {
      console.error('Error fetching pickup:', error);
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

  const getStatusSteps = () => {
    return [
      { key: 'pending', label: 'Pending' },
      { key: 'accepted', label: 'Accepted' },
      { key: 'on_the_way', label: 'On the Way' },
      { key: 'picked', label: 'Picked' },
      { key: 'completed', label: 'Completed' },
    ];
  };

  const getCurrentStepIndex = () => {
    const steps = getStatusSteps();
    return steps.findIndex((step) => step.key === pickup?.status);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!pickup) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center">
          <p className="text-gray-500">Pickup not found</p>
        </div>
      </div>
    );
  }

  const steps = getStatusSteps();
  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Pickup Status</h1>

        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">{pickup.itemId?.title}</h2>
          <p className="text-gray-600 mb-4">{pickup.itemId?.description}</p>

          {pickup.itemId?.images && pickup.itemId.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {pickup.itemId.images.map((image, index) => (
                <img
                  key={index}
                  src={`http://localhost:5001${image}`}
                  alt={`${pickup.itemId.title} ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
              ))}
            </div>
          )}

          <div className="flex items-center space-x-2 mb-4">
            <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded">
              {pickup.itemId?.category?.name}
            </span>
            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
              {pickup.itemId?.action}
            </span>
            <span
              className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(
                pickup.status
              )}`}
            >
              {pickup.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-6">Status Timeline</h3>
          <div className="space-y-4">
            {steps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.key} className="flex items-center">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      isCompleted
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  <div className="ml-4 flex-1">
                    <p
                      className={`font-medium ${
                        isCurrent ? 'text-primary-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </p>
                    {isCurrent && (
                      <p className="text-sm text-gray-500 mt-1">Current status</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {pickup.agentId?.userId && (
          <div className="card mt-6">
            <h3 className="text-lg font-semibold mb-4">Assigned Agent</h3>
            <p className="text-gray-700">
              <strong>Name:</strong> {pickup.agentId.userId.name}
            </p>
            <p className="text-gray-700">
              <strong>Email:</strong> {pickup.agentId.userId.email}
            </p>
            <p className="text-gray-700">
              <strong>Phone:</strong> {pickup.agentId.userId.phone}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PickupStatus;

