import React, { useState, useEffect } from 'react';
import { History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import unitConversionService from '../../services/unitconversion';
import ingredientService from '../../services/ingredient';
import ConversionForm from '../../views/unitconversion/ConversionForm';
import Toast from '../../components/ui/Toast';

export default function UnitConversion() {
  const navigate = useNavigate();
  const [ingredients, setIngredients] = useState([]);
  const [units, setUnits] = useState({ weight: [], volume: [] });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const processUnits = (unitsArray) => {
    if (!Array.isArray(unitsArray)) return { weight: [], volume: [] };
    
    const activeUnits = unitsArray.filter(u => u.isActive);
    
    return {
      weight: activeUnits.filter(u => u.type === 'weight').map(u => ({ name: u.name, toBase: u.toBase })),
      volume: activeUnits.filter(u => u.type === 'volume').map(u => ({ name: u.name, toBase: u.toBase }))
    };
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [ingredientsRes, unitsRes] = await Promise.all([
        ingredientService.getAll(),
        unitConversionService.getAllUnits()
      ]);
      
      // axiosInstance retorna response.data directamente
      const ingredients = Array.isArray(ingredientsRes) ? ingredientsRes : (ingredientsRes.data || []);
      const units = Array.isArray(unitsRes) ? unitsRes : (unitsRes.data || []);
      
      setIngredients(ingredients);
      const processedUnits = processUnits(units);
      setUnits(processedUnits);
      
      console.log('✅ Datos cargados:', { ingredientes: ingredients.length, unidades: processedUnits });
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      showToast({ type: 'error', message: 'Error cargando datos' });
    } finally {
      setLoading(false);
    }
  };

  const showToast = (config) => {
    const id = Date.now();
    setToast({ ...config, id });
  };

  const handleConversionSuccess = () => {
    showToast({ type: 'success', message: 'Conversión guardada exitosamente' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Convertidor de Unidades</h1>
            <p className="text-gray-600 mt-2">Convierte entre diferentes unidades de medida</p>
          </div>
          <button
            onClick={() => navigate('/unit-conversion/history')}
            className="px-4 py-2 bg-[#9FB9B3] text-white rounded-lg hover:bg-[#8FA3A0] flex items-center gap-2 transition"
          >
            <History className="w-5 h-5" />
            Ver Historial
          </button>
        </div>

        {/* Formulario de Conversión */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <ConversionForm
            ingredients={ingredients}
            units={units}
            onSuccess={handleConversionSuccess}
          />
        </div>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}