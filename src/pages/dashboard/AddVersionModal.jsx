// src/components/AddVersionModal.jsx
import  { useState } from 'react';
import {useNotification} from "../../context/NotificationContext.jsx";
import {patchData, returnToken} from "../../utils/helper.js";
import {server} from "../../config/server_api.js";

// eslint-disable-next-line react/prop-types
const AddVersionModal = ({ video, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    language: '',
    streamingLink: '',
    downloadLink: '',
  });
  const { showNotification } = useNotification();
  const token = returnToken();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.language || !formData.streamingLink) {
      showNotification('Language and Streaming Link are required', 'error');
      return;
    }
      // eslint-disable-next-line react/prop-types
    const result = await patchData(`${server}/videos/${video._id}/version`, formData, token);
    if (result.error) {
      showNotification(result.error, 'error');
    } else {
      showNotification('Version added/updated successfully', 'success');
      onAdd(result.video);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
          {/* eslint-disable-next-line react/prop-types */}
        <h2 className="text-xl font-bold mb-4">Add/Update Version for Video Episode {video.episode}</h2>
        <form onSubmit={handleSubmit}>
          <select
            name="language"
            value={formData.language}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-2 bg-white"
            required
          >
            <option value="">Select Language</option>
            <option value="rw">rw</option>
            <option value="en">en</option>
            <option value="fr">fr</option>
            <option value="es">es</option>
            <option value="de">de</option>
            <option value="org">org</option>
            <option value="chn">chn</option>
            <option value="jp">jp</option>
            <option value="in">in</option>
            <option value="ko">ko</option>
          </select>
          <input
            type="text"
            name="streamingLink"
            placeholder="Streaming Link *"
            value={formData.streamingLink}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-2 bg-white"
            required
          />
          <input
            type="text"
            name="downloadLink"
            placeholder="Download Link"
            value={formData.downloadLink}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-2 bg-white"
          />
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded mr-2">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVersionModal;