// src/components/AddVideoModal.jsx
import { useState } from 'react';
import {useNotification} from "../../context/NotificationContext.jsx";
import {returnToken, sendData} from "../../utils/helper.js";
import {server} from "../../config/server_api.js";

// eslint-disable-next-line react/prop-types
const AddVideoModal = ({ movieId, isSeries, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    season: isSeries ? 1 : undefined,
    episode: 1,
    description: '',
    versions: [{ language: 'en', streamingLink: '', downloadLink: '', subtitles: [] }],
  });
  const { showNotification } = useNotification();
  const token = returnToken();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVersionChange = (index, field, value) => {
    const newVersions = [...formData.versions];
    newVersions[index][field] = value;
    setFormData((prev) => ({ ...prev, versions: newVersions }));
  };

  const addVersion = () => {
    setFormData((prev) => ({
      ...prev,
      versions: [...prev.versions, { language: '', streamingLink: '', downloadLink: '', subtitles: [] }],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, movieId };
    const result = await sendData(server+'/videos', payload, token);
    if (result.error) {
      showNotification(result.error, 'error');
    } else {
      showNotification('Video added successfully', 'success');
      onAdd(result.videos[0]); // Assuming single add
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-[30rem] overflow-y-auto max-h-96">
        <h2 className="text-xl font-bold mb-4">Add New Video</h2>
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
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-2 bg-white"
          />
          <h3 className="font-bold mb-2 bg-white">Versions</h3>
          {formData.versions.map((ver, index) => (
            <div key={index} className="mb-4 border p-2 rounded">
              <select
                value={ver.language}
                onChange={(e) => handleVersionChange(index, 'language', e.target.value)}
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
                placeholder="Streaming Link"
                value={ver.streamingLink}
                onChange={(e) => handleVersionChange(index, 'streamingLink', e.target.value)}
                className="w-full p-2 border rounded mb-2 bg-white"
                required
              />
              <input
                type="text"
                placeholder="Download Link"
                value={ver.downloadLink}
                onChange={(e) => handleVersionChange(index, 'downloadLink', e.target.value)}
                className="w-full p-2 border rounded mb-2 bg-white"
              />
            </div>
          ))}
          <button type="button" onClick={addVersion} className="mb-2 bg-white px-2 py-1 bg-gray-300 rounded">
            Add Another Version
          </button>
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded mr-2">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVideoModal;