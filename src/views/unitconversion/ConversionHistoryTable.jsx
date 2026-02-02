import React, { useState } from 'react';
import { Archive } from 'lucide-react';

const ConversionHistoryTable = ({ conversions, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = conversions.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(conversions.length / itemsPerPage);

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Vista de tabla para desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                Fecha
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                Valor Inicial
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                Resultado
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                Ingrediente
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                Densidad
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentItems.map((conv) => (
              <tr key={conv._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-700">
                  {new Date(conv.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {conv.value} {conv.fromUnit}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {conv.result?.toFixed(2)} {conv.toUnit}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {conv.ingredientName || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {conv.densityUsed}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onDelete(conv._id)}
                    className="text-red-600 hover:text-red-800"
                    title="Eliminar conversión"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista de tarjetas para móvil */}
      <div className="md:hidden divide-y divide-gray-100">
        {currentItems.map((conv) => (
          <div key={conv._id} className="p-4 hover:bg-gray-50">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">
                  {new Date(conv.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {conv.value} {conv.fromUnit} → {conv.result?.toFixed(2)} {conv.toUnit}
                </p>
              </div>
              <button
                onClick={() => onDelete(conv._id)}
                className="text-red-600 hover:text-red-800 p-2 -mr-2"
                title="Eliminar conversión"
              >
                <Archive className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Ingrediente:</span>
                <p className="text-gray-700 font-medium">
                  {conv.ingredientName || '-'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Densidad:</span>
                <p className="text-gray-700 font-medium">
                  {conv.densityUsed}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-2 p-4 border-t">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-full sm:w-auto px-4 py-2 bg-gray-100 rounded disabled:opacity-50 hover:bg-gray-200 text-sm"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-full sm:w-auto px-4 py-2 bg-gray-100 rounded disabled:opacity-50 hover:bg-gray-200 text-sm"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default ConversionHistoryTable;