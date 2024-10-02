// Utility function to fetch the description from the JSON based on the link
export const fetchDescriptionByLink = async (link) => {
    try {
      const response = await fetch('/toolCategories.json'); // Fetch the JSON file
      const data = await response.json(); // Parse the JSON response
  
      // Loop through each category and each tool to find a matching link
      for (const category of data) {
        const tool = category.tools.find(tool => tool.link === link); // Find the tool by link
        if (tool) {
          return tool.description; // Return the description if found
        }
      }
  
      // If no matching tool is found, return a default description
      return 'Rajlabs offers a variety of tools for text sanitization, formatting, and encryption. Boost your productivity with these powerful utilities.';
    } catch (error) {
      console.error('Error fetching description:', error); // Log any errors
      return ''; // Return an empty string in case of an error
    }
  };
  