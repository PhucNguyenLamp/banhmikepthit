import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FiArrowLeft, FiClock, FiUser, FiPackage } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import BookCards from '../BookCards';
const StatusBadge = ({ status }) => {
  const getStatusStyle = () => {
    const styles = {
      'Completed': 'bg-green-100 text-green-800 border-green-200',
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Processing': 'bg-blue-100 text-blue-800 border-blue-200',
      'Cancelled': 'bg-red-100 text-red-800 border-red-200'
    };
    return styles[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle()} border`}>
      {status}
    </span>
  );
};

const OrderDetails = () => {
    const { customerUsername } = useParams();
    console.log(customerUsername)
    const navigate = useNavigate();
    const { userInfo, isEmployee } = useAuth();
    
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingStatus, setEditingStatus] = useState(false);
    const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchOrderData();
  }, [customerUsername]);

  const fetchOrderData = async () => {
    try {
      setLoading(true);
      console.log(customerUsername)
      const response = await api.get(`/api/books/order/${customerUsername}`);
      console.log(response.data)
      setOrderData(response.data[0]); // Assuming we're showing the first order
      setNewStatus(response.data[0].order_status);
    } catch (err) {
      setError('Failed to fetch order data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await api.patch(`/api/books/order/${orderData.order_id}`, {
        order_status: newStatus
      });
      setOrderData({ ...orderData, order_status: newStatus });
      setEditingStatus(false);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error loading order details</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 mt-10">
          <button
            onClick={() => navigate(`/${userInfo.username}/employee-dashboard`)}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4"
          >
            <FiArrowLeft className="mr-2" />
            Back to Dashboard
          </button>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Order #{orderData.order_id}
                </h1>
                <div className="mt-2 flex items-center space-x-4">
                  <div className="flex items-center text-gray-600">
                    <FiUser className="mr-2" />
                    <span>{orderData.username}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FiClock className="mr-2" />
                    <span>{format(new Date(orderData.order_time), 'PPp')}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {isEmployee ? (
                  editingStatus ? (
                    <div className="flex items-center space-x-2">
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="border rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <button
                        onClick={handleStatusUpdate}
                        className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingStatus(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <StatusBadge status={orderData.order_status} />
                      <button
                        onClick={() => setEditingStatus(true)}
                        className="text-blue-500 hover:text-blue-700 text-sm"
                      >
                        Edit Status
                      </button>
                    </div>
                  )
                ) : (
                  <StatusBadge status={orderData.order_status} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order Items Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FiPackage className="mr-2" />
            Order Items
          </h2>
          <div className="border-t pt-4">
            <BookCards
              filteredBooks={orderData.books}
              headline="Books in this Order"
            />
          </div>
        </div>

        {/* Order Summary Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2">
            {orderData.books.map((book, index) => (
              <div key={index} className="flex justify-between text-gray-600">
                <span>Book ID: {book.book_id}</span>
                <span>Quantity: {book.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;