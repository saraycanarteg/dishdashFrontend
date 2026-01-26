import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import unitConversionService from '../../services/unitconversion';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import Toast from '../../components/ui/Toast';

export default function ConversionsHistoryPage() {
  const navigate = useNavigate();
  const [conversions, setConversions] = useState([]);
  const [filteredConversions, setFilteredConversions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, weight, volume
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });

  const itemsPerPage = 10;

  useEffect(() => {
    loadConversions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [conversions, searchTerm, filterType]);

  const loadConversions = async () => {
    setLoading(true);
    try {
      const response = await unitConversionService.getAll();
      const data = (response.data || response || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setConversions(data);
    } catch (error) {
      console.error('Error loading conversions:', error);
      showToast({ type: 'error', message: 'Error cargando historial' });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = conversions;

    // Filter by search term
    if (searchTerm) {
      result = result.filter(c =>
        (c.ingredientName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (c.fromUnit?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (c.toUnit?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType === 'weight') {
      result = result.filter(c => {
        const weightUnits = ['g', 'kg', 'oz', 'lb', 'mg'];
        return weightUnits.includes(c.fromUnit) || weightUnits.includes(c.toUnit);
      });
    } else if (filterType === 'volume') {
      result = result.filter(c => {
        const volumeUnits = ['ml', 'l', 'cups', 'tbsp', 'tsp', 'fl oz'];
        return volumeUnits.includes(c.fromUnit) || volumeUnits.includes(c.toUnit);
      });
    }

    setFilteredConversions(result);
    setCurrentPage(1);
  };

  const showToast = (config) => {
    const id = Date.now();
    setToast({ ...config, id });
  };

  const handleDelete = async () => {
    try {
      await unitConversionService.delete(confirmModal.id);
      setConversions(prev => prev.filter(c => c._id !== confirmModal.id));
      showToast({ type: 'success', message: 'Conversión eliminada' });
    } catch (error) {
      showToast({ type: 'error', message: 'Error al eliminar' });
    } finally {
      setConfirmModal({ isOpen: false, id: null });
    }
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredConversions.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredConversions.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Encabezado */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/unit-conversion')}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
            title="Volver"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Historial de Conversiones</h1>
            <p className="text-gray-600 mt-1">Administra tus conversiones previas</p>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600">Total de Conversiones</div>
              <div className="text-3xl font-bold text-[#9FB9B3] mt-2">{conversions.length}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Mostrando</div>
              <div className="text-3xl font-bold text-[#E8C8A0] mt-2">{currentItems.length}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Con Ingrediente</div>
              <div className="text-3xl font-bold text-[#D4A89C] mt-2">
                {conversions.filter(c => c.ingredientName).length}
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Ingrediente, unidad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtro por tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Conversión</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent"
              >
                <option value="all">Todas</option>
                <option value="weight">Peso</option>
                <option value="volume">Volumen</option>
              </select>
            </div>

            {/* Espaciador */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                }}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Cargando...</div>
        ) : filteredConversions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No hay conversiones para mostrar</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Valor Inicial
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Resultado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Ingrediente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Densidad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentItems.map((conv) => (
                      <tr key={conv._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {new Date(conv.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {conv.value} {conv.fromUnit}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-[#9FB9B3]">
                          {typeof conv.result === 'number' 
                            ? conv.result.toFixed(2) 
                            : conv.result} {conv.toUnit}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {conv.ingredientName || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {conv.densityUsed || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setConfirmModal({ isOpen: true, id: conv._id })}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded transition"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
                >
                  Anterior
                </button>
                <span className="text-sm text-gray-600 min-w-[100px] text-center">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title="Eliminar Conversión"
        message="¿Estás seguro de que deseas eliminar esta conversión? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        onCancel={() => setConfirmModal({ isOpen: false, id: null })}
        confirmText="Eliminar"
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
