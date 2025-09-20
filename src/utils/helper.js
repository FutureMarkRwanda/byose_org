
import {jwtDecode} from "jwt-decode";
import axios from "axios";


export const getTextColor = (hex) => {
    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // Calculate luminance
    const luminance = 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);

    // If the color is dark, return a lighter contrasting color
    if (luminance < 0.5) {
        return `rgb(${r + 100 > 255 ? 255 : r + 130}, ${g + 100 > 255 ? 255 : g + 130}, ${b + 100 > 255 ? 255 : b + 130})`;
    }
    // If the color is light, return a darker contrasting color
    else {
        return `rgb(${r - 100 < 0 ? 0 : r - 120}, ${g - 100 < 0 ? 0 : g - 120}, ${b - 100 < 0 ? 0 : b - 120})`;
    }
};


export async function fetchData(url, token) {
    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return { data: response.data, message: response.data.message };
    } catch (error) {
        let errorMessage = "Server is down";

        if (error.response && error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }

        return { error: errorMessage, data: -1 };
    }
}

export async function sendData(url,data,token) {
    try {
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
        const response = await axios.post(url,data);
        return {data:response.data,message:response.data.message};
    } catch (error) {
        let errorMessage = "Server is down";

        if (error.response && error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }

        return { error: errorMessage, data: -1 };
    }
}

export async function updateData(url,data,token) {
    try {
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
        const response = await axios.put(url,data);
        return {data:response.data,message:response.data.message};
    } catch (error) {
        let errorMessage = "Server is down";

        if (error.response && error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }

        return { error: errorMessage, data: -1 };
    }
}

export async function deleteData(url,data,token) {
    try {
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
        const response = await axios.delete(url);

        return {data:response.data,message:response.data.message};
    } catch (error) {
        let errorMessage = "Server is down";

        if (error.response && error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }

        return { error: errorMessage, data: -1 };
    }
}


export async function patchData(url,data,token) {
    try {
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
        const response = await axios.patch(url);

        return {data:response.data,message:response.data.message};
    } catch (error) {
        let errorMessage = "Server is down";

        if (error.response && error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }

        return { error: errorMessage, data: -1 };
    }
}

export function handleLogout(tokenName=null,pathName){
    localStorage.removeItem(tokenName||'movie-rw');
    window.location = pathName||"/dashboard";
}
export function returnToken(tokenName){
    return localStorage.getItem(tokenName||'movie-rw');
}

export function setToken(token){
    localStorage.setItem('movie-rw',token);
}

export const decodeToken =() => {
    const token = localStorage.getItem('movie-rw'); // Replace 'your_token_key' with the actual key used in local storage
    if (!token) {
        return null;
    }
    try {
        const decoded = jwtDecode(token);
        const { firstName, lastName, ...otherProperties } = decoded;
        return { firstName, lastName, ...otherProperties };
        // eslint-disable-next-line no-unused-vars
    } catch (error) {
        return null;
    }
};

export  function combineFirstChars(sentence) {
    // Split the sentence into words
    const words = sentence.split(' ');

    // Map each word to its first character and join them
    const initials = words.map(word => word[0]).join('');

    // Capitalize the result and return
    return initials.toUpperCase();
}


export  function containsKeyWord(text, keyword) {
    if (typeof text !== "string"||typeof keyword !== "string") {
        throw new Error("The input must be a string");
    }
    return text.toLowerCase().includes(keyword);
}

export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function findObjectByKeyword(array, property, keyword) {
  // Check if inputs are valid
  if (!Array.isArray(array) || !property || typeof keyword !== 'string') {
    return null;
  }

  // Find the first object where the specified property contains the keyword
  return array.find(obj => {
    // Ensure the object has the property and it's a string
    if (obj && typeof obj[property] === 'string') {
      // Case-insensitive search for the keyword
      return obj[property].toLowerCase().includes(keyword.toLowerCase());
    }
    return false;
  }) || null; // Return null if no match is found
}


export function generateYouTubeEmbedURL(url) {
  try {
    const parsedUrl = new URL(url);
    const videoId = parsedUrl.searchParams.get('v');

    if (!videoId) {
      // throw new Error('Invalid YouTube URL: missing video ID');
        return null;
    }

    // Construct the embed URL with desired parameters
    return `https://www.youtube.com/embed/${videoId}?loop=1&autoplay=1&fs=0&controls=0&modestbranding=1&enablejsapi=1&mute=1&start=0&playlist=${videoId}`;
  } catch (error) {
    // console.error(error);
    return null;
  }
}
