import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import unitConversionService from '../../services/unitconversion';
import SearchableSelect from '../../components/ui/SearchableSelect';

const ConversionForm = ({ ingredients, units, onSuccess }) => {
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
      const ingredient = ingredients.find(i => i._id === value);
      if (ingredient) {
        setFormData(prev => ({ ...prev, density: ingredient.density || '1' }));
      }
    }

    // Reset result when changing any conversion parameter
    if (['value', 'fromUnit', 'toUnit', 'conversionType'].includes(name)) {
      setResult(null);
    }
  };

  const handleIngredientSelect = (ingredient) => {
    if (ingredient) {
      setFormData(prev => ({ 
        ...prev, 
        ingredientId: ingredient._id,
        density: ingredient.density || '1'
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        ingredientId: '',
        density: ''
      }));
    }
    setResult(null);
  };

  const validateForm = () => {
    if (!formData.value || parseFloat(formData.value) <= 0) {
      return 'Ingresa una cantidad válida';
    }
    if (!formData.fromUnit) {
      return 'Selecciona la unidad de origen';
    }
    if (formData.conversionType === 'standard' && !formData.toUnit) {
      return 'Selecciona la unidad de destino';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const error = validateForm();
    if (error) {
      onSuccess({ type: 'error', message: error });
      return;
    }

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

      setResult({
        from: response.from,
        to: response.to,
        densityUsed: response.densityUsed
      });

      onSuccess({ type: 'success', message: 'Conversión realizada exitosamente' });
    } catch (error) {
      const errorMsg = error.message || 'Error en la conversión';
      onSuccess({ type: 'error', message: errorMsg });
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

  const allUnits = [...units.weight.map(u => u.name), ...units.volume.map(u => u.name)];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tipo de Conversión */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Conversión
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="conversionType"
              value="standard"
              checked={formData.conversionType === 'standard'}
              onChange={handleChange}
              className="w-4 h-4 text-[#9FB9B3]"
            />
            <span className="ml-2 text-gray-700">Conversión Estándar</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="conversionType"
              value="kitchen"
              checked={formData.conversionType === 'kitchen'}
              onChange={handleChange}
              className="w-4 h-4 text-[#9FB9B3]"
            />
            <span className="ml-2 text-gray-700">Unidades de Cocina</span>
          </label>
        </div>
      </div>

      {/* Ingrediente (Opcional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ingrediente (Opcional)
        </label>
        <SearchableSelect
          items={ingredients}
          getLabel={(item) => item.name}
          getValue={(item) => item._id}
          value={formData.ingredientId ? ingredients.find(i => i._id === formData.ingredientId) : null}
          onChange={handleIngredientSelect}
          placeholder="Busca un ingrediente..."
          emptyMessage="No se encontraron ingredientes"
        />
      </div>

      {/* Cantidad y Unidad Origen */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cantidad
          </label>
          <input
            type="number"
            name="value"
            value={formData.value}
            onChange={handleChange}
            step="0.01"
            min="0"
            placeholder="Ej: 250"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Desde Unidad
          </label>
          <select
            name="fromUnit"
            value={formData.fromUnit}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent"
          >
            <option value="">Seleccionar...</option>
            {units.weight.length > 0 && (
              <optgroup label="Peso">
                {units.weight.map(u => (
                  <option key={u.name} value={u.name}>{u.name}</option>
                ))}
              </optgroup>
            )}
            {units.volume.length > 0 && (
              <optgroup label="Volumen">
                {units.volume.map(u => (
                  <option key={u.name} value={u.name}>{u.name}</option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
      </div>

      {/* Unidad Destino (solo para conversión estándar) */}
      {formData.conversionType === 'standard' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hacia Unidad
          </label>
          <select
            name="toUnit"
            value={formData.toUnit}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent"
          >
            <option value="">Seleccionar...</option>
            {units.weight.length > 0 && (
              <optgroup label="Peso">
                {units.weight.map(u => (
                  <option key={u.name} value={u.name}>{u.name}</option>
                ))}
              </optgroup>
            )}
            {units.volume.length > 0 && (
              <optgroup label="Volumen">
                {units.volume.map(u => (
                  <option key={u.name} value={u.name}>{u.name}</option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
      )}

      {/* Densidad (si se selecciona ingrediente) */}
      {formData.ingredientId && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Densidad (g/ml)
          </label>
          <input
            type="number"
            name="density"
            value={formData.density}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent"
            disabled
          />
          <p className="text-xs text-gray-500 mt-1">Se obtiene automáticamente del ingrediente</p>
        </div>
      )}

      {/* Resultado */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2">Resultado de la conversión:</p>
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <p className="text-gray-600 text-sm">De</p>
              <p className="text-xl font-semibold text-gray-800">{result.from}</p>
            </div>
            <div className="flex items-center justify-center px-4">
              <RefreshCw className="w-5 h-5 text-[#9FB9B3]" />
            </div>
            <div className="text-center flex-1">
              <p className="text-gray-600 text-sm">A</p>
              <p className="text-xl font-semibold text-gray-800">{result.to}</p>
            </div>
          </div>
          {result.densityUsed && (
            <p className="text-xs text-gray-500 mt-3 text-center">
              Densidad utilizada: {result.densityUsed} g/ml
            </p>
          )}
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-[#9FB9B3] text-white rounded-lg hover:bg-[#8FA3A0] disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
        >
          {loading ? 'Procesando...' : 'Convertir'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition"
        >
          Limpiar
        </button>
      </div>
    </form>
  );
};

export default ConversionForm;
