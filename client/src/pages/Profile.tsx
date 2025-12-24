
import { useState, useEffect } from 'react';
import { getProfile } from '../lib/api';
import type { User } from '../types';
import Layout from '../components/Layout';

const Profile = () => {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const profileData = await getProfile();
        // The backend returns the full pg result object.
        // The UI accesses the user data from the `rows` property.
        if (profileData && profileData.length > 0) {
            setProfile(profileData.rows[0]);
        } else {
            throw new Error("User profile not found in server response.");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        {loading && <p>Loading profile...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {profile && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center space-x-4">
                <img
                    className="w-24 h-24 rounded-full"
                    src={`https://avatars.dicebear.com/api/male/${profile.name}.svg`}
                    alt={profile.name}
                />
                <div>
                    <h2 className="text-3xl font-bold">{profile.name}</h2>
                    <p className="text-gray-500">{profile.email}</p>
                </div>
            </div>
            {/* Add more profile details here if available, like bio, etc. */}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
