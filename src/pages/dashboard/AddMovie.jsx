import {useState} from "react";
import {generateYouTubeEmbedURL, returnToken, sendData} from "../../utils/helper.js";
import {server} from "../../config/server_api.js";

const MOVIE_TYPES = ["movie", "series"];
const VERSION_LANGUAGES = ["rw","en", "fr", "es", "de","org","chn","jp","in","ko"];

const initialEpisode = (isSeries) => ({
    season: isSeries ? "" : undefined,
    episode: "",
    description: "",
    versions: [
        {
            language: "en",
            streamingLink: ""
        }
    ]
});

const initialMovieState = {
    title: "",
    poster: "",
    backdrop: "",
    trailer_url: "",
    category: "",
    tags: [],
    movie_type: "movie",
    description: "",
    episodes: []
};

export default function MovieCreatePage() {
    const [form, setForm] = useState(initialMovieState);
    const [tagInput, setTagInput] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState("");
    const [apiSuccess, setApiSuccess] = useState("");
    const [validationError, setValidationError] = useState("");

    // Handle input change
    const handleChange = (e) => {
        const {name, value} = e.target;

        // If switching type, reset episodes to avoid leftover season fields
        if (name === "movie_type" && value !== form.movie_type) {
            setForm((prev) => ({
                ...prev,
                [name]: value,
                episodes: []
            }));
        } else {
            setForm((prev) => ({...prev, [name]: value}));
        }
    };

    // Handle tags
    const handleAddTag = () => {
        if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
            setForm((prev) => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput("");
        }
    };
    const handleRemoveTag = (idx) => {
        setForm((prev) => ({
            ...prev,
            tags: prev.tags.filter((_, i) => i !== idx)
        }));
    };

    // Handle episodes
    const handleAddEpisode = () => {
        setForm((prev) => ({
            ...prev,
            episodes: [...prev.episodes, initialEpisode(form.movie_type === "series")]
        }));
    };
    const handleRemoveEpisode = (idx) => {
        setForm((prev) => ({
            ...prev,
            episodes: prev.episodes.filter((_, i) => i !== idx)
        }));
    };

    // Handle episode fields
    const handleEpisodeChange = (idx, field, value) => {
        setForm((prev) => {
            const episodes = [...prev.episodes];
            episodes[idx][field] = value;
            return {...prev, episodes};
        });
    };

    // Handle version fields
    const handleVersionChange = (epIdx, vIdx, field, value) => {
        setForm((prev) => {
            const episodes = [...prev.episodes];
            episodes[epIdx].versions[vIdx][field] = value;
            return {...prev, episodes};
        });
    };

    const handleRemoveVersion = (epIdx, vIdx) => {
        setForm((prev) => {
            const episodes = [...prev.episodes];
            episodes[epIdx].versions.splice(vIdx, 1);
            return {...prev, episodes};
        });
    };



    const handleAddVersion = (epIdx) => {
        setForm((prev) => {
            const episodes = prev.episodes.map((ep, i) =>
                i === epIdx
                    ? {
                        ...ep,
                        versions: [
                            ...ep.versions,
                            {
                                language: "en",
                                streamingLink: ""
                            }
                        ]
                    }
                    : ep
            );
            return {...prev, episodes};
        });
    };





    // Basic client-side validation
    const validate = () => {
        if (
            !form.title ||
            !form.poster ||
            !form.backdrop ||
            !form.trailer_url ||
            !form.category ||
            !form.movie_type ||
            !form.description
        )
            return "All mandatory fields must be filled.";

        // Must have at least one video/episode
        if (!form.episodes.length)
            return "At least one video/episode must be present.";

        // Each video/episode must have at least one version
        for (const ep of form.episodes) {
            if (!ep.episode)
                return "Each video/episode must have an episode number.";
            if (!ep.versions || !ep.versions.length)
                return "Each video/episode must have at least one version.";
            for (const v of ep.versions) {
                if (!v.language || !v.streamingLink )
                    return "Each version must have language, streaming link, and download link.";
            }
        }
        return null;
    };

    // Submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError("");
        setApiSuccess("");
        setValidationError("");
        const validationMsg = validate();
        if (validationMsg) {
            setValidationError(validationMsg);
            return;
        }
        setSubmitting(true);
        const url = server + "/movies"; // Adjust as needed
        const payload = {...form};
        // Remove season from episodes if movie type
        if (form.movie_type === "movie") {
            payload.episodes = payload.episodes.map(({season, ...rest}) => rest);
        }
        const {error, data, message} = await sendData(url, payload, returnToken());
        setSubmitting(false);
        if (error) setApiError(error);
        else {
            setApiSuccess(message || "Movie created successfully!");
            setForm(initialMovieState);
        }
    };

    const isValidYouTubeUrl = (url) => {
        const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w\-]{11}$/;
        return pattern.test(url);
    };

    // --- Preview helpers ---
    const renderPreview = () => (
        <div className="w-full  bg-white rounded-lg shadow p-6 mx-auto mt-6 border border-blue-50">
            <div className="flex gap-6 flex-col md:flex-row">
                <div className="flex-shrink-0">
                    <img
                        src={form.poster || "https://via.placeholder.com/150x220?text=Poster"}
                        alt="Poster"
                        className="w-48 h-48 object-cover rounded-md border border-blue-100"
                    />
                    <img
                        src={form.backdrop || "https://via.placeholder.com/150x60?text=Backdrop"}
                        alt="Backdrop"
                        className="w-48 h-36 object-cover rounded-md border border-blue-100 mt-2"
                    />
                    <iframe
                        src={`${generateYouTubeEmbedURL(form.trailer_url)||generateYouTubeEmbedURL("https://www.youtube.com/watch?v=GyAAYf-oUp8")}`}
                        title="Movie Trailer"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                        className="mt-2 h-36 w-48 border-none"
                    />
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-1 text-blue-700">{form.title || "Movie Title"}</h2>
                    <div className="flex gap-2 items-center mb-2">
                        <span
                            className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">{form.category || "Category"}</span>
                        <span
                            className="px-2 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-semibold">{form.movie_type}</span>
                    </div>
                    <p className="text-gray-700 mb-2">{form.description || "Movie description..."}</p>
                    <div className="flex gap-2 flex-wrap mb-2">
                        {form.tags.length
                            ? form.tags.map((tag, idx) => (
                                <span key={idx}
                                      className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full text-xs">{tag}</span>
                            ))
                            : <span className="text-gray-400 text-xs">No tags</span>
                        }
                    </div>
                    <div>
                        <h3 className="font-semibold mt-4 mb-2 text-lg text-blue-600">{form.movie_type === "series" ? "Episodes" : "Videos"}</h3>
                        {form.episodes.length ? (
                            <div className="space-y-4">
                                {form.episodes.map((ep, epIdx) => (
                                    <div key={epIdx} className="border rounded-md p-3 bg-blue-50 border-blue-100">
                                        <div className="flex gap-4 items-center">
                                            <div className="font-semibold text-base mb-1 text-blue-700">
                                                {form.movie_type === "series" ? (
                                                    <>Season {ep.season || "?"}, Episode {ep.episode || epIdx + 1}</>
                                                ) : (
                                                    <>Episode {ep.episode || epIdx + 1}</>
                                                )}
                                            </div>
                                            <div
                                                className="text-gray-600 text-sm">{ep.description || "No description"}</div>
                                        </div>
                                        <div>
                                            <span className="font-semibold text-sm text-blue-700">Versions:</span>
                                            <div className="space-y-2 mt-1">
                                                {ep.versions.map((v, vIdx) => (
                                                    <div key={vIdx}
                                                         className="border rounded p-2 bg-white border-blue-100">
                                                        <div className="flex gap-2 items-center text-xs mb-1">
                                                            <span
                                                                className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">{v.language}</span>
                                                            <a className="text-blue-600 underline"
                                                               href={v.streamingLink || "#"} target="_blank"
                                                               rel="noopener noreferrer">
                                                                Stream
                                                            </a>
                                                            <a className="ml-2 text-teal-600 underline"
                                                               href={v.streamingLink || "#"} target="_blank"
                                                               rel="noopener noreferrer">
                                                                Download
                                                            </a>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div
                                className="text-gray-400 text-sm">No {form.movie_type === "series" ? "episodes" : "videos"} added
                                yet.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen #bg-blue-50 py-8">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 px-2">
                {/* FORM */}
                <form
                    className="bg-white rounded-lg shadow p-4 flex flex-col gap-4 border border-blue-50"
                    onSubmit={handleSubmit}
                >
                    <h2 className="text-xl font-bold mb-2 text-blue-700">Create Movie / Series</h2>
                    <div>
                        <label className="font-semibold text-blue-700">Title *</label>
                        <input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            required
                            className="mt-1 w-full px-3 py-2 border border-blue-100 rounded focus:outline-none focus:ring focus:ring-blue-100 bg-blue-50"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="font-semibold text-blue-700">Poster URL *</label>
                            <input
                                name="poster"
                                value={form.poster}
                                onChange={handleChange}
                                required
                                className="mt-1 w-full px-3 py-2 border border-blue-100 rounded focus:outline-none focus:ring focus:ring-blue-100 bg-blue-50"
                            />
                        </div>
                        <div>
                            <label className="font-semibold text-blue-700">Backdrop URL *</label>
                            <input
                                name="backdrop"
                                value={form.backdrop}
                                onChange={handleChange}
                                required
                                className="mt-1 w-full px-3 py-2 border border-blue-100 rounded focus:outline-none focus:ring focus:ring-blue-100 bg-blue-50"
                            />
                        </div>
                        <div className="flex-1">
                            <input
                                type="text"
                                value={form.trailer_url}
                                placeholder="https://www.youtube.com/watch?v=..."
                                onChange={(e) => handleChange({target: {name: 'trailer_url', value: e.target.value}})}
                                className={`w-full p-3 border-blue-100 rounded focus:outline-none focus:ring focus:ring-blue-100 bg-blue-50 ${
                                    isValidYouTubeUrl(form.trailer_url)
                                        ? 'border-gray-600 focus:border-indigo-500'
                                        : 'border-red-500 focus:border-red-400'
                                } focus:outline-none focus:ring-2 ${
                                    isValidYouTubeUrl(form.trailer_url) ? 'focus:ring-indigo-500' : 'focus:ring-red-500'
                                }`}
                            />
                            {!isValidYouTubeUrl(form.trailer_url) && (
                                <p className="text-red-400 text-xs mt-1">Invalid YouTube URL format</p>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="font-semibold text-blue-700">Tags or Genre</label>
                        <div className="flex gap-2">
                            <input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddTag();
                                    }
                                }}
                                placeholder="Action"
                                className="w-full px-3 py-2 border border-blue-100 rounded focus:outline-none focus:ring focus:ring-blue-100 bg-blue-50"
                            />
                            <button
                                type="button"
                                onClick={handleAddTag}
                                className="bg-yellow-50 text-yellow-700 px-4 py-2 rounded hover:bg-yellow-100"
                            >
                                Add
                            </button>
                        </div>
                        <div className="flex gap-2 flex-wrap mt-2">
                            {form.tags.map((tag, idx) => (
                                <span key={tag}
                                      className="bg-yellow-50 px-3 py-1 rounded-full text-xs text-yellow-700 flex items-center">
                  {tag}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveTag(idx)}
                                        className="ml-2 text-yellow-600 hover:text-yellow-800"
                                    >×</button>
                </span>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="font-semibold text-blue-700">Category(One of the Tags or genre) *</label>
                            <input
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                required
                                className="mt-1 w-full px-3 py-2 border border-blue-100 rounded focus:outline-none focus:ring focus:ring-blue-100 bg-blue-50"
                            />
                        </div>
                        <div>
                            <label className="font-semibold text-blue-700">Type *</label>
                            <select
                                name="movie_type"
                                value={form.movie_type}
                                onChange={handleChange}
                                required
                                className="mt-1 w-full px-3 py-2 border border-blue-100 rounded focus:outline-none focus:ring focus:ring-blue-100 bg-blue-50"
                            >
                                {MOVIE_TYPES.map((type) => (
                                    <option key={type} value={type}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="font-semibold text-blue-700">Description *</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            required
                            rows={3}
                            className="mt-1 w-full px-3 py-2 border border-blue-100 rounded focus:outline-none focus:ring focus:ring-blue-100 bg-blue-50"
                        />
                    </div>
                    {/* Episodes Section */}
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                        <h3 className="font-semibold mb-2 text-blue-700">{form.movie_type === "series" ? "Episodes" : "Videos"}</h3>
                        {form.episodes.map((ep, epIdx) => (
                            <div className="border rounded-md p-3 mb-4 bg-white border-blue-100" key={epIdx}>
                                <div
                                    className={`grid grid-cols-1 ${form.movie_type === "series" ? "md:grid-cols-3" : "md:grid-cols-2"} gap-2`}>
                                    {form.movie_type === "series" && (
                                        <div>
                                            <label className="text-sm font-semibold text-blue-700">Season *</label>
                                            <input
                                                type="number"
                                                value={ep.season}
                                                onChange={(e) =>
                                                    handleEpisodeChange(epIdx, "season", e.target.value)
                                                }
                                                required
                                                className="mt-1 w-full px-2 py-1 border border-blue-100 rounded bg-blue-50"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-sm font-semibold text-blue-700">Episode Number *</label>
                                        <input
                                            type="number"
                                            value={ep.episode}
                                            onChange={(e) =>
                                                handleEpisodeChange(epIdx, "episode", e.target.value)
                                            }
                                            required
                                            className="mt-1 w-full px-2 py-1 border border-blue-100 rounded bg-blue-50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-blue-700">Description</label>
                                        <input
                                            value={ep.description}
                                            onChange={(e) =>
                                                handleEpisodeChange(epIdx, "description", e.target.value)
                                            }
                                            className="mt-1 w-full px-2 py-1 border border-blue-100 rounded bg-blue-50"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveEpisode(epIdx)}
                                    className="mt-2 text-xs text-blue-400 hover:underline"
                                >
                                    Remove {form.movie_type === "series" ? "Episode" : "Video"}
                                </button>
                                <div className="mt-3">
                                    <h4 className="font-semibold text-sm mb-1 text-indigo-700">Versions</h4>
                                    {ep.versions.map((v, vIdx) => (
                                        <div className="border rounded p-2 mb-2 bg-blue-100 border-blue-100" key={vIdx}>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                <div>
                                                    <label className="text-xs font-semibold text-indigo-700">Language
                                                        *</label>
                                                    <select
                                                        value={v.language}
                                                        onChange={(e) =>
                                                            handleVersionChange(epIdx, vIdx, "language", e.target.value)
                                                        }
                                                        required
                                                        className="mt-1 w-full px-2 py-1 border border-blue-100 rounded bg-white"
                                                    >
                                                        {VERSION_LANGUAGES.map((lang) => (
                                                            <option key={lang} value={lang}>
                                                                {lang.toUpperCase()}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-semibold text-indigo-700">Streaming
                                                        Link *</label>
                                                    <input
                                                        value={v.streamingLink}
                                                        onChange={(e) =>
                                                            handleVersionChange(epIdx, vIdx, "streamingLink", e.target.value)
                                                        }
                                                        required
                                                        className="mt-1 w-full px-2 py-1 border border-blue-100 rounded bg-white"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveVersion(epIdx, vIdx)}
                                                className="mt-2 text-xs text-blue-400 hover:underline"
                                            >
                                                Remove Version
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => handleAddVersion(epIdx)}
                                        className="mt-1 text-xs text-indigo-700 hover:underline"
                                    >
                                        Add Version
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={handleAddEpisode}
                            className="mt-2 text-sm bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200"
                        >
                            Add {form.movie_type === "series" ? "Episode" : "Video"}
                        </button>
                    </div>
                    {/* Error & Success Feedback */}
                    {validationError && (
                        <div
                            className="text-blue-700 bg-blue-100 rounded px-3 py-2 text-sm mt-2 border border-blue-200">
                            {validationError}
                        </div>
                    )}
                    {apiError && (
                        <div
                            className="text-blue-700 bg-blue-100 rounded px-3 py-2 text-sm mt-2 border border-blue-200">
                            {apiError}
                        </div>
                    )}
                    {apiSuccess && (
                        <div
                            className="text-green-700 bg-green-100 rounded px-3 py-2 text-sm mt-2 border border-green-200">
                            {apiSuccess}
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition"
                    >
                        {submitting ? "Submitting..." : "Create"}
                    </button>
                </form>
                {/* PREVIEW */}
                <div>
                    <h2 className="text-xl font-bold mb-4 text-blue-700">Live Preview</h2>
                    {renderPreview()}
                </div>
            </div>
        </div>
    );
}