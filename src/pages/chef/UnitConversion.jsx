import React, { useState, useEffect } from 'react';
import { Search, Download, Plus } from 'lucide-react';
import { UnitConversion as UnitConversionModel } from '../../models/unitconversion';
import unitConversionService from '../../services/unitconversion';
import ingredientService from '../../services/ingredient';
import ConversionFormModal from '../../views/unitconversion/ConversionFormModal';
import ConversionHistoryTable from '../../views/unitconversion/ConversionHistoryTable';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import Toast from '../../components/ui/Toast';

export default function UnitConversion() {
  const [conversions, setConversions] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [units, setUnits] = useState({ weight: [], volume: [], special: [] });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [conversionsRes, ingredientsRes, unitsRes] = await Promise.all([
        unitConversionService.getAll(),
        ingredientService.getAll(),
        unitConversionService.getUnits()
      ]);
      
      setConversions(conversionsRes.data.map(c => UnitConversionModel.fromResponse(c)));
      setIngredients(ingredientsRes.data);
      setUnits(unitsRes.data);
    } catch (error) {
      showToast({ type: 'error', message: 'Error cargando datos' });
    } finally {
      setLoading(false);
    }
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

  const filteredConversions = conversions.filter(c =>
    c.ingredientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.fromUnit.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.toUnit?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalConversions = conversions.length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-600">
            Conversión de Unidades
          </h1>
          <button className="px-4 py-2 bg-[#D4A89C] text-white rounded-md hover:bg-[#C49888]">
            Salir
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#9FB9B3] rounded-lg p-6 text-white">
            <div className="text-sm opacity-90">Total Conversiones</div>
            <div className="text-3xl font-bold mt-2">{totalConversions}</div>
          </div>
          
          <div className="bg-[#E8C8A0] rounded-lg p-6 text-white">
            <div className="text-sm opacity-90">Ingredientes Disponibles</div>
            <div className="text-3xl font-bold mt-2">{ingredients.length}</div>
          </div>

          <div className="bg-[#C9CBCB] rounded-lg p-6 text-white">
            <div className="text-sm opacity-90">Unidades Activas</div>
            <div className="text-3xl font-bold mt-2">
              {(units.weight?.length || 0) + (units.volume?.length || 0)}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por ingrediente o unidad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent"
                />
              </div>
            </div>
            
            <button className="px-4 py-2 bg-[#E8C8A0] text-white rounded-md hover:bg-[#D8B890] flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </button>
            
            <button
              onClick={() => setShowFormModal(true)}
              className="px-4 py-2 bg-[#D4A89C] text-white rounded-md hover:bg-[#C49888] flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nuevo
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Cargando...</div>
        ) : (
          <ConversionHistoryTable
            conversions={filteredConversions}
            onDelete={(id) => setConfirmModal({ isOpen: true, id })}
          />
        )}

        {/* Modals */}
        <ConversionFormModal
          isOpen={showFormModal}
          onClose={() => {
            setShowFormModal(false);
            loadData();
          }}
          onSuccess={(toast) => {
            showToast(toast);
            setShowFormModal(false);
            loadData();
          }}
          ingredients={ingredients}
          units={units}
        />

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
    </div>
  );
}