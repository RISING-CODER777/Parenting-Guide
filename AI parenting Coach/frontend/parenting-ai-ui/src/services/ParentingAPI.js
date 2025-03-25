import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL; // Ensure this is set to https://example.amazonaws.com/dev/parenting_guide

export const fetchParentingAdvice = async (query) => {
  try {
    const response = await axios.post(
      API_URL,
      { query },
      {
        headers: {
          "Content-Type": "application/json", // Explicitly set Content-Type
        },
      }
    );
    return response.data.advice;
  } catch (error) {
    console.error("Error fetching parenting advice:", error);
    return "Sorry, something went wrong. Try again later!";
  }
};
