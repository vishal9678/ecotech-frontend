import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const DashboardAdmin = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, usersRes, agentsRes, categoriesRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/users'),
        api.get('/admin/agents'),
        api.get('/admin/categories'),
      ]);
      setAnalytics(analyticsRes.data.data);
      setUsers(usersRes.data.data.users);
      setAgents(agentsRes.data.data.agents);
      setCategories(categoriesRes.data.data.categories);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAgent = async (agentId, status) => {
    try {
      await api.put(`/admin/agents/${agentId}/verify`, { verificationStatus: status });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update agent status');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await api.post('/admin/categories', {
        name: formData.get('name'),
        icon: formData.get('icon'),
        description: formData.get('description'),
      });
      e.target.reset();
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create category');
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome, {user?.name}</p>
        </div>

        <div className="mb-6 flex space-x-4 border-b overflow-x-auto">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-4 px-4 font-medium whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-4 px-4 font-medium whitespace-nowrap ${
              activeTab === 'users'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('agents')}
            className={`pb-4 px-4 font-medium whitespace-nowrap ${
              activeTab === 'agents'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600'
            }`}
          >
            Agents
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-4 px-4 font-medium whitespace-nowrap ${
              activeTab === 'categories'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600'
            }`}
          >
            Categories
          </button>
        </div>

        {activeTab === 'analytics' && analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-primary-600">{analytics.totalUsers}</p>
            </div>
            <div className="card">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Total Agents</h3>
              <p className="text-3xl font-bold text-primary-600">{analytics.totalAgents}</p>
            </div>
            <div className="card">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Total Items</h3>
              <p className="text-3xl font-bold text-primary-600">{analytics.totalItems}</p>
            </div>
            <div className="card">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Completed Pickups</h3>
              <p className="text-3xl font-bold text-primary-600">
                {analytics.completedPickups} / {analytics.totalPickups}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">All Users</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Phone
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded text-xs">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.phone}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">All Agents</h2>
            <div className="space-y-4">
              {agents.map((agent) => (
                <div key={agent._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{agent.userId?.name}</h3>
                      <p className="text-sm text-gray-600">{agent.userId?.email}</p>
                      <p className="text-sm text-gray-600">Total Pickups: {agent.totalPickups}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-3 py-1 rounded text-sm ${
                          agent.verificationStatus === 'verified'
                            ? 'bg-green-100 text-green-800'
                            : agent.verificationStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {agent.verificationStatus}
                      </span>
                      {agent.verificationStatus !== 'verified' && (
                        <button
                          onClick={() => handleVerifyAgent(agent._id, 'verified')}
                          className="btn-primary text-sm"
                        >
                          Verify
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div>
            <div className="card mb-6">
              <h2 className="text-xl font-semibold mb-4">Create New Category</h2>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="input-field"
                    placeholder="e.g., E-waste"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                  <input
                    type="text"
                    name="icon"
                    className="input-field"
                    placeholder="e.g., 📱"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    className="input-field"
                    rows="3"
                    placeholder="Category description"
                  ></textarea>
                </div>
                <button type="submit" className="btn-primary">
                  Create Category
                </button>
              </form>
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold mb-4">All Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div key={category._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="text-2xl mb-2">{category.icon}</div>
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardAdmin;


