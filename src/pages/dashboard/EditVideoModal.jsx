// src/components/EditVideoModal.jsx
import React, { useState } from 'react';
import {useNotification} from "../../context/NotificationContext.jsx";
import {returnToken, updateData} from "../../utils/helper.js";
import {server} from "../../config/server_api.js";

// eslint-disable-next-line react/prop-types
const EditVideoModal = ({ video, isSeries, onClose, onUpdate }) => {
  const [formData, setFormData] = useState(video);
  const { showNotification } = useNotification();
  const token = returnToken();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Using the /params/:id endpoint for basic fields
    const result = await updateData(`${server}/videos/params/${video._id}`, formData, token);
    if (result.error) {
      showNotification(result.error, 'error');
    } else {
      showNotification('Video updated successfully', 'success');
      onUpdate(result.video);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Edit Video</h2>
        <form onSubmit={handleSubmit}>
          {isSeries && (
            <input
              type="number"
              name="season"
              placeholder="Season"
              value={formData.season}
              onChange={handleChange}
              className="w-full p-2 border rounded mb-2 bg-white"
            />
          )}
          <input
            type="number"
            name="episode"
            placeholder="Episode"
            value={formData.episode}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-2 bg-white"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-2 bg-white"
          />
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded mr-2">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVideoModal;