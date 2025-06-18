const axios = require('axios');

const getYouTubeVideoDetails = async (videoId) => {
  const apiKey = process.env.YT_API_KEY;

  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    const video = response.data.items[0];
    if (!video) return null;

    const { title, description, thumbnails } = video.snippet;
    return {
      title,
      description,
      img: thumbnails?.high?.url || thumbnails?.default?.url
    };
  } catch (error) {
    console.error("YouTube API Error:", error.message);
    return null;
  }
};

module.exports = getYouTubeVideoDetails;
