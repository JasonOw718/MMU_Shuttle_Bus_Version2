import { useNavigate } from 'react-router';
import { Plus, Trash2, Map as MapIcon } from 'lucide-react';
import { useMockData } from '../contexts/MockDataContext';

export function RoutesPage() {
  const navigate = useNavigate();
  const { routes, setRoutes } = useMockData();

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this route?')) {
      setRoutes(routes.filter(r => r.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Routes Management</h2>
        <button
          onClick={() => navigate('/routes/new/edit')}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <Plus className="mr-2 -ml-1 h-5 w-5" aria-hidden="true" />
          Add Route
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Total Stations</th>

              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {routes.map((route) => (
              <tr key={route.id} className="hover:bg-slate-50 transition-colors">
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{route.id}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">{route.name}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{route.total_station}</td>

                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <button onClick={() => navigate(`/routes/${route.id}/edit`)} className="text-blue-600 hover:text-blue-900 mr-4 inline-flex items-center">
                    <MapIcon className="h-4 w-4 mr-1" /> Edit
                  </button>
                  <button onClick={() => handleDelete(route.id)} className="text-red-600 hover:text-red-900 inline-flex items-center">
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </button>
                </td>
              </tr>
            ))}
            {routes.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">No routes found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
