import React, { useState } from 'react';

interface CreateAppointmentProps {
  onSuccess: () => void;
}

export const SetAppointmentModal: React.FC<CreateAppointmentProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    patient_id: '',
    clinic_id: '',
    appointment_date: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Post to your FastAPI endpoint
      const response = await fetch('/api/v1/appointments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: 'PENDING' // Immediately flags it for the clerk's attention
        }),
      });

      if (response.ok) {
        onSuccess();
        // Trigger any notification system to confirm the clerk received it
      }
    } catch (error) {
      console.error("Failed to pass appointment to clerk:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md">
      <h2 className="text-xl font-bold mb-4">Set Express Appointment</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Patient Selection Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Patient Identification</label>
          <input
            type="text"
            placeholder="Enter Patient ID or lookup name..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            value={formData.patient_id}
            onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
            required
          />
        </div>

        {/* Clinic Location Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Dispatch Clinic</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            value={formData.clinic_id}
            onChange={(e) => setFormData({ ...formData, clinic_id: e.target.value })}
            required
          >
            <option value="">Select Clinic Location...</option>
            <option value="1">Main Transit Clinic Alpha</option>
            <option value="2">Express Hub Beta</option>
          </select>
        </div>

        {/* Appointment Target Schedule Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Collection Date & Time</label>
          <input
            type="datetime-local"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            value={formData.appointment_date}
            onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
            required
          />
        </div>

        {/* The Action Trigger to push directly to the Clerk workflow */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Set Appointment (Pass to Clerk)'}
        </button>
      </form>
    </div>
  );
};