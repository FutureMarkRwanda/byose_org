import React, { useState } from 'react';
import { returnToken, sendData } from "../utils/helper.js";
import { presence_server } from "../config/server_api.js";

const AddRemoteModal = ({ isOpen, onClose, onCreated }) => {
  const [price, setPrice] = useState('');
  const [hasHardware, setHasHardware] = useState(false);
  const [powered, setPowered] = useState('BYOSE Tech');
  const [manufacture, setManufacture] = useState('BYOSE Tech Labs');
  const [version, setVersion] = useState('2.0.0');
  const [buttons, setButtons] = useState([{ buttonType: 'push' }]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleButtonTypeChange = (index, value) => {
    const newButtons = [...buttons];
    newButtons[index].buttonType = value;
    setButtons(newButtons);
  };

  const addButton = () => setButtons([...buttons, { buttonType: 'push' }]);
  const removeButton = (index) => setButtons(buttons.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        price: Number(price),
        hasHardware,
        powered,
        manufacture,
        version,
        buttons
      };

      const { data, error } = await sendData(`${presence_server}/buttons`, payload, returnToken());

      if (error) {
        alert(error);
      } else {
        if (onCreated) onCreated(data);
        onClose();
      }
    } catch (err) {
      console.error(err);
      alert('Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl"
        >
          &times;
        </button>

        <h2 className="text-gray-900 text-xl font-semibold mb-4">Add New Remote</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Price(FRW)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Has Hardware?</label>
            <select
              value={hasHardware}
              onChange={(e) => setHasHardware(e.target.value === 'true')}
              className="w-full border border-gray-300 bg-white rounded px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
            >
              <option value={true}>Yes</option>
              <option value={false}>No</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Powered</label>
            <input
              type="text"
              value={powered}
              onChange={(e) => setPowered(e.target.value)}
              className="w-full border border-gray-300 bg-white rounded px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Manufacture</label>
            <input
              type="text"
              value={manufacture}
              onChange={(e) => setManufacture(e.target.value)}
              className="w-full border border-gray-300 bg-white rounded px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Version</label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-full border bg-white border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
            />
          </div>

          {/* Buttons */}
          <div>
            <label className="block mb-1 font-medium text-gray-700 bg-white">Buttons</label>
            {buttons.map((btn, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <select
                  value={btn.buttonType}
                  onChange={(e) => handleButtonTypeChange(index, e.target.value)}
                  className="border bg-white border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                >
                  <option value="push">Push</option>
                  <option value="rocker">Rocker</option>
                </select>
                {buttons.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeButton(index)}
                    className="bg-red-500 text-white px-2 rounded hover:bg-red-600"
                  >
                    -
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addButton}
              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
            >
              Add Button
            </button>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Remote'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddRemoteModal;
