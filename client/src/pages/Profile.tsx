
import { useState, useEffect, type ChangeEvent, type  FormEvent } from 'react';
import { getProfile, updateProfile } from '../lib/api';
import type { User } from '../types';
import Layout from '../components/Layout';

const Profile = () => {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [file, setFile] = useState<File | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const profileData = await getProfile();
      if (profileData) {
        setProfile(profileData);
        setFormData({ name: profileData.name, email: profileData.email });
      } else {
        throw new Error("User profile not found in server response.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    if (profile) {
      setFormData({ name: profile.name, email: profile.email });
    }
    setFile(null);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    if (!profile) return;

    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    if (file) {
      data.append('profile', file);
    }

    try {
      await updateProfile(data);
      setEditMode(false);
      fetchProfile(); // Refetch profile to display updated data
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };
  console.log('Profile DS is', JSON.stringify(profile, null, 4))
  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        {loading && <p>Loading profile...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {profile && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            {!editMode ? (
              <>
                <div className="flex items-center space-x-4">
                  <img
                    className="w-24 h-24 rounded-full"
                    src={profile.profile_url}
                    alt={profile.name}
                  />
                  <div>
                    <h2 className="text-3xl font-bold">{profile.name}</h2>
                    <p className="text-gray-500">{profile.email}</p>
                  </div>
                </div>
                <button onClick={handleEdit} className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  Edit Profile
                </button>
              </>
            ) : (
              <form onSubmit={handleSave}>
                <div className="flex items-center space-x-4">
                  <img
                    className="w-24 h-24 rounded-full"
                    src={profile.profile_url}
                    alt={profile.name}
                  />
                  <div>
                    <input type="file" onChange={handleFileChange} />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="mt-4">
                  <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    Save
                  </button>
                  <button type="button" onClick={handleCancel} className="ml-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
