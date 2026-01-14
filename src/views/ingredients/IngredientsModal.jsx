import React, { useEffect, useState } from 'react';

const IngredientsModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null,
  categories = []
}) => {
  const [formData, setFormData] = useState({
    productId: '',
    name: '',
    category: '',
    product: '',
    brand: '',
    size: '',
    sizeUnit: 'ml',
    price: '',
    supplier: '',
    availableUnits: 0
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        productId: initialData.productId || '',
        name: initialData.name || '',
        category: initialData.category || '',
        product: initialData.product || '',
        brand: initialData.brand || '',
        size: initialData.size || '',
        sizeUnit: initialData.sizeUnit || 'ml',
        price: initialData.price ?? '',
        supplier: initialData.supplier || '',
        availableUnits: initialData.availableUnits ?? 0
      });
    } else {
      resetForm();
    }
    setErrors({});
    setGeneralError('');
  }, [initialData, isOpen]);

  const resetForm = () => {
    setFormData({
      productId: '',
      name: '',
      category: '',
      product: '',
      brand: '',
      size: '',
      sizeUnit: 'ml',
      price: '',
      supplier: '',
      availableUnits: 0
    });
    setErrors({});
    setGeneralError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const e = {};
    if (!formData.productId?.trim()) e.productId = 'Código requerido';
    if (!formData.name?.trim()) e.name = 'Nombre requerido';
    if (!formData.category?.trim()) e.category = 'Categoría requerida';
    if (formData.price === '' || isNaN(Number(formData.price))) e.price = 'Precio inválido';
    if (formData.availableUnits === '' || isNaN(Number(formData.availableUnits))) e.availableUnits = 'Unidades inválidas';
    return e;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setGeneralError('');
    const clientErrors = validateForm();
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      return { success: false, fieldErrors: clientErrors };
    }

    setIsSubmitting(true);
    try {
      const result = await onSubmit({
        ...formData,
        price: formData.price === '' ? 0 : Number(formData.price),
        availableUnits: Number(formData.availableUnits)
      });

      if (result && result.success === false) {
        if (result.fieldErrors) {
          setErrors(result.fieldErrors);
        }
        if (result.message) setGeneralError(result.message);
        setIsSubmitting(false);
        return result;
      }
      resetForm();
      onClose();
      setIsSubmitting(false);
      return { success: true };
    } catch (err) {
      const msg = err?.message || 'Error inesperado';
      setGeneralError(msg);
      setIsSubmitting(false);
      return { success: false, message: msg };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 max-w-xl w-full">
        <h3 className="text-lg font-semibold mb-4">{initialData ? 'Editar ingrediente' : 'Nuevo ingrediente'}</h3>

        {generalError && <div className="text-sm text-red-600 mb-3">{generalError}</div>}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs">Código</label>
            <input name="productId" value={formData.productId} onChange={handleInputChange} className={`w-full p-2 border rounded ${errors.productId ? 'border-red-500' : 'border-gray-200'}`} />
            {errors.productId && <div className="text-xs text-red-600 mt-1">{errors.productId}</div>}
          </div>

          <div>
            <label className="text-xs">Nombre</label>
            <input name="name" value={formData.name} onChange={handleInputChange} className={`w-full p-2 border rounded ${errors.name ? 'border-red-500' : 'border-gray-200'}`} />
            {errors.name && <div className="text-xs text-red-600 mt-1">{errors.name}</div>}
          </div>

          <div>
            <label className="text-xs">Categoría</label>
            <select name="category" value={formData.category} onChange={handleInputChange} className={`w-full p-2 border rounded ${errors.category ? 'border-red-500' : 'border-gray-200'}`}>
              <option value="">Seleccionar</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            {errors.category && <div className="text-xs text-red-600 mt-1">{errors.category}</div>}
          </div>

          <div>
            <label className="text-xs">Producto</label>
            <input name="product" value={formData.product} onChange={handleInputChange} className="w-full p-2 border rounded border-gray-200" />
          </div>

          <div>
            <label className="text-xs">Marca</label>
            <input name="brand" value={formData.brand} onChange={handleInputChange} className="w-full p-2 border rounded border-gray-200" />
          </div>

          <div>
            <label className="text-xs">Tamaño</label>
            <div className="flex gap-2">
              <input name="size" value={formData.size} onChange={handleInputChange} className="w-1/2 p-2 border rounded border-gray-200" />
              <input name="sizeUnit" value={formData.sizeUnit} onChange={handleInputChange} className="w-1/2 p-2 border rounded border-gray-200" />
            </div>
          </div>

          <div>
            <label className="text-xs">Precio</label>
            <input name="price" value={formData.price} onChange={handleInputChange} className={`w-full p-2 border rounded ${errors.price ? 'border-red-500' : 'border-gray-200'}`} />
            {errors.price && <div className="text-xs text-red-600 mt-1">{errors.price}</div>}
          </div>

          <div>
            <label className="text-xs">Proveedor</label>
            <input name="supplier" value={formData.supplier} onChange={handleInputChange} className="w-full p-2 border rounded border-gray-200" />
          </div>

          <div>
            <label className="text-xs">Unidades disponibles</label>
            <input name="availableUnits" value={formData.availableUnits} onChange={handleInputChange} className={`w-full p-2 border rounded ${errors.availableUnits ? 'border-red-500' : 'border-gray-200'}`} />
            {errors.availableUnits && <div className="text-xs text-red-600 mt-1">{errors.availableUnits}</div>}
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={() => { resetForm(); onClose(); }} className="px-4 py-2 bg-gray-100 rounded">Cancelar</button>
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-[#9FB9B3] text-white rounded">
            {isSubmitting ? 'Guardando...' : (initialData ? 'Actualizar' : 'Crear')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IngredientsModal;