import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getOtherUserProfile, followUser, unfollowUser } from '../lib/api';
import type { User } from '../types';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth(); // Get the current authenticated user

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      if (userId) {
        const profileData = await getOtherUserProfile(userId);
        if (profileData) {
          setProfile(profileData);
        } else {
          throw new Error("User profile not found in server response.");
        }
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const handleFollowToggle = async () => {
    if (!profile || !userId) return;

    try {
      if (profile.isFollowing) {
        await unfollowUser(userId);
        toast.success(`Unfollowed ${profile.name}`);
        setProfile(prev => prev ? { ...prev, isFollowing: false, followersCount: (prev.followersCount || 0) - 1 } : null);
      } else {
        await followUser(userId);
        toast.success(`Following ${profile.name}`);
        setProfile(prev => prev ? { ...prev, isFollowing: true, followersCount: (prev.followersCount || 0) + 1 } : null);
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  if (loading) return <Layout><p>Loading profile...</p></Layout>;
  if (error) return <Layout><p className="text-red-500">{error}</p></Layout>;
  if (!profile) return <Layout><p>Profile not found.</p></Layout>;

  // Check if the profile being viewed belongs to the currently authenticated user
  const isCurrentUserProfile = user && user.id === profile.id;
  console.log(JSON.stringify(profile, null, 4))
  return (
    <Layout>
      <div className="p-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-4">
            <img
              className="w-24 h-24 rounded-full object-cover"
              src={profile.profile_url || '/default-profile.png'} // Use a default image if none exists
              alt={profile.name}
            />
            <div>
              <h2 className="text-3xl font-bold">{profile.name}</h2>
              <p className="text-gray-500">{profile.email}</p>
              <div className="flex space-x-4 mt-2">
                <p>Followers: {profile.followersCount}</p>
                <p>Following: {profile.followingCount}</p>
              </div>
              {!isCurrentUserProfile && ( // Only show follow button if not current user's profile
                <button
                  onClick={handleFollowToggle}
                  className={`mt-4 py-2 px-4 rounded ${
                    profile.isFollowing
                      ? 'bg-red-500 hover:bg-red-700'
                      : 'bg-blue-500 hover:bg-blue-700'
                  } text-white font-bold`}
                >
                  {profile.isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserProfile;