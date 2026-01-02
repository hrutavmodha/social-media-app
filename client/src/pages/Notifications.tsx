import React, { useState, useEffect } from 'react';
import { getNotifications, markAllNotificationsAsRead } from '../lib/api.ts';
import type { Notification } from '../types';
import Layout from '../components/Layout.tsx';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedNotifications = await getNotifications();
      setNotifications(fetchedNotifications);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Failed to fetch notifications.');
      toast.error(err.message || 'Failed to fetch notifications.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      toast.success('All notifications marked as read!');
      fetchNotifications();
    } catch (err: any) {
      console.error('Error marking notifications as read:', err);
      toast.error(err.message || 'Failed to mark notifications as read.');
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getNotificationMessage = (notification: Notification) => {
    const senderLink = (
      <Link to={`/users/${notification.sender_id}`} className="font-bold hover:underline">
        {notification.sender_username}
      </Link>
    );

    switch (notification.type) {
      case 'follow':
        return <>{senderLink} started following you.</>;
      case 'like':
        return (
          <>
            {senderLink} liked your post{' '}
            {notification.post_id && (
              <Link to={`/posts/${notification.post_id}`} className="font-bold hover:underline">
                "{notification.post_caption || 'Click to view'}"
              </Link>
            )}
            .
          </>
        );
      case 'comment':
        return (
          <>
            {senderLink} commented on your post{' '}
            {notification.post_id && (
              <Link to={`/posts/${notification.post_id}`} className="font-bold hover:underline">
                "{notification.post_caption || 'Click to view'}"
              </Link>
            )}
            .
          </>
        );
      default:
        return <>New notification from {senderLink}.</>;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center p-4">Loading notifications...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center p-4 text-red-500">Error: {error}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Notifications</h2>
        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Mark all as read
          </button>
        )}
        {notifications.length > 0 ? (
          <ul>
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`p-3 mb-2 rounded-lg shadow-sm ${
                  notification.read ? 'bg-gray-100 text-gray-700' : 'bg-blue-50 text-blue-800 font-semibold'
                }`}
              >
                <div className="flex items-center">
                  <img
                    src={notification.sender_profile_url || '/default-profile.png'}
                    alt={notification.sender_username}
                    className="w-8 h-8 rounded-full object-cover mr-3"
                  />
                  <p>{getNotificationMessage(notification)}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-11">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No notifications yet.</p>
        )}
      </div>
    </Layout>
  );
};

export default Notifications;
