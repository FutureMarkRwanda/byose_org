import { useState } from 'react';
import Dropzone from 'react-dropzone';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { useNotification } from "../../context/NotificationContext.jsx";
import {returnToken, sendData} from "../../utils/helper.js";
import { server } from "../../config/server_api.js";

export default function CreatePost() {
    const { showNotification } = useNotification();
    const [loader, setLoader] = useState(false);

    const [data, setData] = useState({
        title: '',
        description: '',
        images: [],
        youtube_video: []
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDrop = (acceptedFiles) => {
        acceptedFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setData((prev) => ({
                    ...prev,
                    images: [...prev.images, e.target.result]
                }));
            };
            reader.readAsDataURL(file);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (data.images.length === 0) {
            showNotification("Please upload at least one image.", "error");
            return;
        }
        setLoader(true);
        try {
            const result = await sendData(server + "/blog", data, returnToken());
            if (result.error) {
                showNotification(result.error, "error");
            } else {
                showNotification(result.message, "success");
                setTimeout(() => {
                    window.location.reload();
                    e.target.reset();
                }, 500);
            }
        } catch (error) {
            showNotification(error.message, "error");
        } finally {
            setLoader(false);
        }
    };

    const renderPreviews = () =>
        data.images.map((img, idx) => (
            <img
                key={idx}
                src={img}
                alt={`preview-${idx}`}
                className="w-20 h-20 object-cover rounded-lg shadow-sm border border-gray-200"
            />
        ));

    return (
        <div className=" flex items-center justify-center ">
            <form onSubmit={handleSubmit} className="container bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800">
                    Create a New Post
                </h2>

                {/* Dropzone for multiple images */}
                <Dropzone onDrop={handleDrop} accept={{'image/*': []}} multiple>
                    {({ getRootProps, getInputProps }) => (
                        <div
                            {...getRootProps()}
                            className="border-2 border-dashed border-gray-300 p-6 rounded-lg cursor-pointer text-center hover:bg-gray-50 transition-colors"
                        >
                            <input {...getInputProps()} />
                            <div className="flex flex-col items-center space-y-3">
                                <FaCloudUploadAlt className="text-gray-500" size={32} />
                                <p className="text-sm text-gray-600 italic">
                                    Drop or select multiple images
                                </p>
                                <div className="flex flex-wrap gap-3 mt-3 justify-center">
                                    {renderPreviews()}
                                </div>
                            </div>
                        </div>
                    )}
                </Dropzone>

                <input
                    type="text"
                    name="title"
                    value={data.title}
                    onChange={handleChange}
                    placeholder="Post Title"
                    className="w-full p-3 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    required
                />

                <textarea
                    name="description"
                    value={data.description}
                    onChange={handleChange}
                    placeholder="Post Description"
                    className="w-full p-3 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 resize-none transition-all"
                    required
                />

                <input
                    type="text"
                    name="youtube_video"
                    value={data.youtube_video}
                    onChange={(e) =>
                        setData((prev) => ({
                            ...prev,
                            youtube_video: e.target.value.split(',').map((v) => v.trim())
                        }))
                    }
                    placeholder="YouTube links (comma-separated)"
                    className="w-full p-3 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />

                {!loader ? (
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
                    >
                        Submit Post
                    </button>
                ) : (
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600"></div>
                    </div>
                )}
            </form>
        </div>
    );
}