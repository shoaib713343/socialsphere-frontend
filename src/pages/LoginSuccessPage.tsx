// src/pages/LoginSuccessPage.tsx
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import { jwtDecode } from 'jwt-decode';
import type { User } from '../store/authSlice';

const LoginSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      const user = jwtDecode<User>(token);
      dispatch(setCredentials({ user, token }));
      navigate('/');
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, dispatch]);

  return <div className="text-center mt-10">Logging you in...</div>;
};
export default LoginSuccessPage;