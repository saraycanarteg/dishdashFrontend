import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar as CalendarIcon, Link2, Unlink, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import Toast from '../../components/ui/Toast';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

const Calendar = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [googleStatus, setGoogleStatus] = useState({
    isLinked: false,
    email: null,
    hasValidToken: false,
    loading: true
  });
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, action: null, loading: false });

  useEffect(() => {
    checkGoogleStatus();
    handleUrlParams();
  }, []);

  const handleUrlParams = () => {
    const googleParam = searchParams.get('google');
    const messageParam = searchParams.get('message');

    if (googleParam === 'linked') {
      showToast('Google Calendar vinculado exitosamente', 'success');
      checkGoogleStatus(); // Recargar estado
    } else if (googleParam === 'error') {
      const errorMsg = messageParam ? decodeURIComponent(messageParam) : 'Error al vincular Google Calendar';
      showToast(errorMsg, 'error');
    }

    // Limpiar parámetros de la URL
    if (googleParam) {
      setSearchParams({});
    }
  };

  const checkGoogleStatus = async () => {
    try {
      const status = await api.auth.checkGoogleCalendarStatus();
      setGoogleStatus({
        ...status,
        loading: false
      });
    } catch (error) {
      console.error('Error checking Google status:', error);
      setGoogleStatus(prev => ({ ...prev, loading: false }));
    }
  };

  const handleLinkGoogle = () => {
    api.auth.googleCalendarLink();
  };

  const handleUnlinkGoogle = async () => {
    setConfirm({
      open: true,
      action: 'unlink',
      loading: false
    });
  };

  const confirmUnlink = async () => {
    try {
      setConfirm(prev => ({ ...prev, loading: true }));
      await api.auth.unlinkGoogleCalendar();
      setGoogleStatus({
        isLinked: false,
        email: null,
        hasValidToken: false,
        loading: false
      });
      showToast('Google Calendar desvinculado exitosamente', 'success');
      setConfirm({ open: false, action: null, loading: false });
    } catch (error) {
      console.error('Error unlinking Google:', error);
      showToast(error.message || 'Error al desvincular Google Calendar', 'error');
      setConfirm(prev => ({ ...prev, loading: false }));
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
  };

  if (googleStatus.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#9FB9B3' }}></div>
          <p style={{ color: '#9FB9B3' }}>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl" style={{ backgroundColor: '#E8D5C7' }}>
              <CalendarIcon size={32} style={{ color: '#9FB9B3' }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#9FB9B3' }}>
                Calendario de Cotizaciones
              </h1>
              <p className="text-sm mt-1" style={{ color: '#B8C9D0' }}>
                Gestiona tus cotizaciones y eventos
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Google Calendar Integration Card */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#9FB9B3' }}>
            Integración con Google Calendar
          </h2>

          {!googleStatus.isLinked ? (
            // No vinculado
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-3 rounded-lg" style={{ backgroundColor: '#FFF3E0' }}>
                <AlertCircle size={24} style={{ color: '#FF9800' }} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2" style={{ color: '#9FB9B3' }}>
                  Conecta tu cuenta de Google
                </h3>
                <p className="text-sm mb-4" style={{ color: '#B8C9D0' }}>
                  Vincula tu cuenta de Google para sincronizar automáticamente tus cotizaciones con Google Calendar. 
                  Esto te permitirá ver y gestionar tus eventos desde cualquier dispositivo.
                </p>
                <button
                  onClick={handleLinkGoogle}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all shadow-sm"
                  style={{ backgroundColor: '#9FB9B3', color: '#ffffff' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B8C9D0'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#9FB9B3'}
                >
                  <Link2 size={18} />
                  Vincular Google Calendar
                </button>
              </div>
            </div>
          ) : (
            // Vinculado
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-3 rounded-lg" style={{ backgroundColor: '#E8F5E9' }}>
                <CheckCircle size={24} style={{ color: '#4CAF50' }} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2" style={{ color: '#9FB9B3' }}>
                  Google Calendar Conectado
                </h3>
                <p className="text-sm mb-2" style={{ color: '#B8C9D0' }}>
                  Tu cuenta <span className="font-semibold">{googleStatus.email}</span> está vinculada correctamente.
                </p>
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-2 h-2 rounded-full ${googleStatus.hasValidToken ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className="text-xs" style={{ color: '#B8C9D0' }}>
                    {googleStatus.hasValidToken ? 'Token válido' : 'Token expirado (se renovará automáticamente)'}
                  </span>
                </div>
                <button
                  onClick={handleUnlinkGoogle}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all shadow-sm border-2"
                  style={{ borderColor: '#E8D5C7', color: '#9FB9B3', backgroundColor: '#ffffff' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#FEE';
                    e.currentTarget.style.borderColor = '#E57373';
                    e.currentTarget.style.color = '#E57373';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.borderColor = '#E8D5C7';
                    e.currentTarget.style.color = '#9FB9B3';
                  }}
                >
                  <Unlink size={18} />
                  Desvincular Google Calendar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Calendar Section - Coming Soon */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="text-center">
            <div className="inline-flex p-4 rounded-full mb-4" style={{ backgroundColor: '#E8D5C7' }}>
              <CalendarIcon size={48} style={{ color: '#9FB9B3' }} />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#9FB9B3' }}>
              Vista de Calendario
            </h3>
            <p className="text-sm" style={{ color: '#B8C9D0' }}>
              Próximamente: Visualización de cotizaciones en formato calendario
            </p>
            {googleStatus.isLinked && (
              <p className="text-xs mt-4 p-3 rounded-lg" style={{ backgroundColor: '#E8F5E9', color: '#4CAF50' }}>
                ✓ Una vez implementado, tus cotizaciones se sincronizarán automáticamente con Google Calendar
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          toast={toast}
          onClose={() => setToast(null)}
          duration={4000}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirm.open}
        onClose={() => !confirm.loading && setConfirm({ open: false, action: null, loading: false })}
        onConfirm={confirmUnlink}
        title="Desvincular Google Calendar"
        message="¿Estás seguro de que deseas desvincular tu cuenta de Google Calendar? Perderás la sincronización automática de eventos."
        confirmText="Desvincular"
        cancelText="Cancelar"
        loading={confirm.loading}
      />
    </div>
  );
};

export default Calendar;