import { useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { useMockData } from '../contexts/MockDataContext';
import type { Driver } from '../contexts/MockDataContext';

export function DriversPage() {
  const { drivers, setDrivers } = useMockData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    bus_plate: ''
  });

  const openModal = (driver?: Driver) => {
    if (driver) {
      setEditingDriver(driver);
      setFormData({
        email: driver.email,
        password: '', // Don't populate password for editing
        bus_plate: driver.bus_plate
      });
    } else {
      setEditingDriver(null);
      setFormData({ email: '', password: '', bus_plate: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDriver(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingDriver) {
      setDrivers(drivers.map(d => d.id === editingDriver.id ? { ...d, email: formData.email, bus_plate: formData.bus_plate } : d));
    } else {
      const newId = drivers.length > 0 ? Math.max(...drivers.map(d => d.id)) + 1 : 1;
      setDrivers([...drivers, { id: newId, email: formData.email, bus_plate: formData.bus_plate }]);
    }
    closeModal();
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this driver?')) {
      setDrivers(drivers.filter(d => d.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Drivers Management</h2>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <Plus className="mr-2 -ml-1 h-5 w-5" aria-hidden="true" />
          Add Driver
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Bus Plate</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {drivers.map((driver) => (
              <tr key={driver.id} className="hover:bg-slate-50 transition-colors">
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{driver.id}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">{driver.email}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                    {driver.bus_plate}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <button onClick={() => openModal(driver)} className="text-blue-600 hover:text-blue-900 mr-4 inline-flex items-center">
                    <Edit2 className="h-4 w-4 mr-1" /> Edit
                  </button>
                  <button onClick={() => handleDelete(driver.id)} className="text-red-600 hover:text-red-900 inline-flex items-center">
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </button>
                </td>
              </tr>
            ))}
            {drivers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">No drivers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md transform rounded-xl bg-white p-6 shadow-2xl transition-all">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-slate-900">{editingDriver ? 'Edit Driver' : 'Add Driver'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-500">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="driver@example.com"
                />
              </div>
              {!editingDriver && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              )}
              <div>
                <label htmlFor="bus_plate" className="block text-sm font-medium text-slate-700">Bus Plate</label>
                <input
                  type="text"
                  id="bus_plate"
                  required
                  value={formData.bus_plate}
                  onChange={(e) => setFormData({ ...formData, bus_plate: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="WPE 3575"
                />
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {editingDriver ? 'Save Changes' : 'Add Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
