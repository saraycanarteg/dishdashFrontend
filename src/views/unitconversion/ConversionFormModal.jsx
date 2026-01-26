import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import unitConversionService from '../../services/unitconversion';

const ConversionFormModal = ({ isOpen, onClose, onSuccess, ingredients, units }) => {
  const [formData, setFormData] = useState({
    value: '',
    fromUnit: '',
    toUnit: '',
    density: '',
    ingredientId: '',
    conversionType: 'standard'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'ingredientId' && value) {
      const ingredient = ingredients.find(i => i.productId === value);
      if (ingredient) {
        setFormData(prev => ({ ...prev, density: ingredient.density || '' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const data = {
        value: parseFloat(formData.value),
        fromUnit: formData.fromUnit,
        density: formData.density ? parseFloat(formData.density) : undefined,
        ingredientId: formData.ingredientId || undefined
      };

      let response;
      if (formData.conversionType === 'kitchen') {
        response = await unitConversionService.kitchenConversion(data);
      } else {
        data.toUnit = formData.toUnit;
        response = await unitConversionService.convertAndSave(data);
      }

      setResult(response.data);
      onSuccess({ type: 'success', message: 'Conversión realizada exitosamente' });
    } catch (error) {
      onSuccess({ type: 'error', message: error.response?.data?.message || 'Error en la conversión' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      value: '',
      fromUnit: '',
      toUnit: '',
      density: '',
      ingredientId: '',
      conversionType: 'standard'
    });
    setResult(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Nueva Conversión</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Conversión
          </label>
          <select
            name="conversionType"
            value={formData.conversionType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent"
          >
            <option value="standard">Conversión Estándar</option>
            <option value="kitchen">Conversión de Cocina</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
            <input
              type="number"
              name="value"
              value={formData.value}
              onChange={handleChange}
              step="0.01"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Desde Unidad
            </label>
            <select
              name="fromUnit"
              value={formData.fromUnit}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent"
            >
              <option value="">Seleccionar...</option>
              {units.weight && (
                <optgroup label="Peso">
                  {units.weight.map(u => <option key={u} value={u}>{u}</option>)}
                </optgroup>
              )}
              {units.volume && (
                <optgroup label="Volumen">
                  {units.volume.map(u => <option key={u} value={u}>{u}</option>)}
                </optgroup>
              )}
            </select>
          </div>
        </div>

        {formData.conversionType === 'standard' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hacia Unidad
            </label>
            <select
              name="toUnit"
              value={formData.toUnit}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent"
            >
              <option value="">Seleccionar...</option>
              {units.weight && (
                <optgroup label="Peso">
                  {units.weight.map(u => <option key={u} value={u}>{u}</option>)}
                </optgroup>
              )}
              {units.volume && (
                <optgroup label="Volumen">
                  {units.volume.map(u => <option key={u} value={u}>{u}</option>)}
                </optgroup>
              )}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ingrediente (Opcional)
          </label>
          <select
            name="ingredientId"
            value={formData.ingredientId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent"
          >
            <option value="">Sin ingrediente</option>
            {ingredients.map(ing => (
              <option key={ing.productId} value={ing.productId}>
                {ing.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Densidad</label>
          <input
            type="number"
            name="density"
            value={formData.density}
            onChange={handleChange}
            step="0.01"
            placeholder="1.0 por defecto"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent"
          />
        </div>

        {result && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm font-medium text-green-800">Resultado:</p>
            <p className="text-lg font-semibold text-green-900">
              {result.from} = {result.to}
            </p>
            <p className="text-xs text-green-700 mt-1">
              Densidad usada: {result.densityUsed}
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            <RefreshCw className="inline-block w-4 h-4 mr-1" />
            Limpiar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-[#9FB9B3] text-white rounded-md hover:bg-[#8FA9A3] disabled:opacity-50"
          >
            {loading ? 'Convirtiendo...' : 'Convertir'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConversionFormModal;