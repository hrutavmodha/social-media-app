const API_URL = 'http://localhost:3000';

const fetchOptions = {
  credentials: 'include' as RequestCredentials,
};

const postOptions = (body: any) => ({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    ...fetchOptions
})

const postFormOptions = (formData: FormData) => ({
    method: 'POST',
    body: formData,
    ...fetchOptions
})


export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/login`, postOptions({ email, password }));
  if (!response.ok) {
    throw new Error('Login failed');
  }
  return response.json();
};

export const register = async (username: string, email: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/register`, postOptions({ username, email, password }));
  if (!response.ok) {
    throw new Error('Registration failed');
  }
  return response.json();
};

export const getPosts = async () => {
  const response = await fetch(`${API_URL}/posts`, fetchOptions);
  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }
  return response.json();
};

export const createPost = async (caption: string, media: File[]) => {
  const formData = new FormData();
  formData.append('caption', caption);
  media.forEach(file => {
    formData.append('media', file);
  });

  const response = await fetch(`${API_URL}/posts`, postFormOptions(formData));

  if (!response.ok) {
    throw new Error('Failed to create post');
  }

  return response.json();
};

export const logout = async () => {
  const response = await fetch(`${API_URL}/auth/logout`, { method: 'POST', ...fetchOptions });
  if (!response.ok) {
    throw new Error('Logout failed');
  }
  return response.json();
};

export const getTrending = async () => {
  const response = await fetch(`${API_URL}/trending`, fetchOptions);
  if (!response.ok) {
    throw new Error('Failed to fetch trending topics');
  }
  return response.json();
};

export const getWhoToFollow = async () => {
  const response = await fetch(`${API_URL}/who-to-follow`, fetchOptions);
  if (!response.ok) {
    throw new Error('Failed to fetch users to follow');
  }
  return response.json();
};

export const getProfile = async () => {
    const response = await fetch(`${API_URL}/profile`, fetchOptions);
    if (!response.ok) {
        throw new Error('Failed to fetch profile');
    }
    return response.json();
}

export const updateProfile = async (formData: FormData) => {
    const response = await fetch(`${API_URL}/profile`, postFormOptions(formData));
    if (!response.ok) {
        throw new Error('Failed to update profile');
    }
    return response.json();
}

export const forgotPassword = async (email: string) => {
  const response = await fetch(`${API_URL}/auth/forgot-password`, postOptions({ email }));
  console.log(JSON.stringify(response, null, 4))
  if (!response.ok) {
    throw new Error('Failed to send password reset email');
  }
  return response.json();
};

export const resetPassword = async (token: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/reset-password`, postOptions({ token, password }));
  if (!response.ok) {
    throw new Error('Failed to reset password');
  }
  return response.json();
};

export const changePassword = async (oldPassword: string, newPassword: string) => {
  const response = await fetch(`${API_URL}/user/change-password`, postOptions({ oldPassword, newPassword }));
  if (!response.ok) {
    throw new Error('Failed to change password');
  }
  return response.json();
};

export const postComment = async (postId: number, text: string) => {
  const response = await fetch(`${API_URL}/comment`, postOptions({ postId, text }));
  if (!response.ok) {
    throw new Error('Failed to post comment');
  }
  return response.json();
};

