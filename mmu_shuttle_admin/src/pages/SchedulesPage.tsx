import { useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { useMockData } from '../contexts/MockDataContext';
import type { Schedule } from '../contexts/MockDataContext';

export function SchedulesPage() {
  const { schedules, setSchedules } = useMockData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  const [formData, setFormData] = useState<{ name: string; time_slots: string[] }>({
    name: '',
    time_slots: []
  });
  const [newTime, setNewTime] = useState('');

  const openModal = (schedule?: Schedule) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        name: schedule.name,
        time_slots: [...schedule.time_slots]
      });
    } else {
      setEditingSchedule(null);
      setFormData({ name: '', time_slots: [] });
    }
    setNewTime('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSchedule(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingSchedule) {
      setSchedules(schedules.map(s => s.id === editingSchedule.id ? { ...s, name: formData.name, time_slots: formData.time_slots } : s));
    } else {
      const newId = schedules.length > 0 ? Math.max(...schedules.map(s => s.id)) + 1 : 1;
      setSchedules([...schedules, { id: newId, name: formData.name, time_slots: formData.time_slots }]);
    }
    closeModal();
  };

  const addTimeSlot = () => {
    if (newTime.trim() !== '') {
      const [hoursStr, minutes] = newTime.split(':');
      let hours = parseInt(hoursStr, 10);
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const formattedTime = `${hours}:${minutes} ${ampm}`;

      setFormData({ ...formData, time_slots: [...formData.time_slots, formattedTime] });
      setNewTime('');
    }
  };

  const removeTimeSlot = (index: number) => {
    setFormData({ ...formData, time_slots: formData.time_slots.filter((_, i) => i !== index) });
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this schedule?')) {
      setSchedules(schedules.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Station Arrival Schedules</h2>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <Plus className="mr-2 -ml-1 h-5 w-5" aria-hidden="true" />
          Add Arrival Schedule Template
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Template Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Arrival Times</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {schedules.map((schedule) => (
              <tr key={schedule.id} className="hover:bg-slate-50 transition-colors">
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{schedule.id}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">{schedule.name}</td>
                <td className="px-6 py-4 text-sm text-slate-500 max-w-sm truncate" title={schedule.time_slots.join(', ')}>
                  <div className="flex flex-wrap gap-1">
                    {schedule.time_slots.slice(0, 3).map((time, idx) => (
                      <span key={idx} className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        {time}
                      </span>
                    ))}
                    {schedule.time_slots.length > 3 && (
                      <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                        +{schedule.time_slots.length - 3} more
                      </span>
                    )}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <button onClick={() => openModal(schedule)} className="text-blue-600 hover:text-blue-900 mr-4 inline-flex items-center">
                    <Edit2 className="h-4 w-4 mr-1" /> Edit
                  </button>
                  <button onClick={() => handleDelete(schedule.id)} className="text-red-600 hover:text-red-900 inline-flex items-center">
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </button>
                </td>
              </tr>
            ))}
            {schedules.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">No arrival schedules found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md transform rounded-xl bg-white p-6 shadow-2xl transition-all">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-slate-900">{editingSchedule ? 'Edit Arrival Schedule Template' : 'Add Arrival Schedule Template'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-500">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700">Template Name</label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="e.g. Standard Run"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Bus Arrival Times</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={addTimeSlot}
                    className="inline-flex items-center rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 border border-slate-300 transition-colors"
                  >
                    Add Time
                  </button>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 min-h-[120px] max-h-[200px] overflow-y-auto">
                  {formData.time_slots.length === 0 ? (
                    <div className="text-center text-sm text-slate-400 py-4">No times added yet.</div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {formData.time_slots.map((time, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                          {time}
                          <button
                            type="button"
                            onClick={() => removeTimeSlot(idx)}
                            className="text-blue-600 hover:text-blue-900 focus:outline-none hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
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
                  {editingSchedule ? 'Save Changes' : 'Add Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
