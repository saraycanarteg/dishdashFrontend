import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChefHat } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      // Obtener token y user de los query params
      const token = searchParams.get('token');
      const userStr = searchParams.get('user');

      if (token && userStr) {
        try {
          // Parsear el usuario
          const user = JSON.parse(decodeURIComponent(userStr));
          
          // Guardar en localStorage
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          // Forzar actualización del contexto
          window.location.href = user.role === 'chef' ? '/calendar' : '/recipes-menus';
        } catch (error) {
          console.error('Error processing Google callback:', error);
          navigate('/login');
        }
      } else {
        // Si no hay token, redirigir a login
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#9FB9B3' }}>
      <div className="rounded-3xl shadow-2xl p-10 max-w-md w-full text-center" style={{ backgroundColor: '#ffffff' }}>
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 animate-pulse" style={{ backgroundColor: '#E8D5C7' }}>
            <ChefHat size={40} style={{ color: '#9FB9B3' }} />
          </div>
          <h2 className="text-2xl font-semibold mb-2" style={{ color: '#9FB9B3' }}>
            Autenticando...
          </h2>
          <p className="text-sm" style={{ color: '#B8C9D0' }}>
            Procesando tu inicio de sesión con Google
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoogleCallback;
