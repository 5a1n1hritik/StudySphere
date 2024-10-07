import React, { useState, useEffect } from 'react';

const ResourcesComponent = () => {
  // Step 1: Define state to store the API data
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [error, setError] = useState(null); // State to handle errors

  // Step 2: Trigger API call on component mount
  useEffect(() => {
    const fetchResources = async () => {
      try {
        // Step 3: Make the API call
        const response = await fetch('http://localhost:5000/api/users/resources');
        
        // Check if the API call was successful
        if (!response.ok) {
          throw new Error('Network response was not OK');
        }

        const data = await response.json();
        // Step 4: Update the state with the fetched data
        setResources(data);
      } catch (error) {
        // Step 5: Handle any errors during fetch
        setError(error.message);
      } finally {
        // Step 6: Stop loading after the API call completes
        setLoading(false);
      }
    };

    fetchResources();
  }, []); // Empty array ensures useEffect runs once when the component is mounted

  // Step 7: Conditionally render the UI
  if (loading) return <p>Loading resources...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Resources</h1>
      {resources.length > 0 ? (
        <ul>
          {resources.map((resource, index) => (
            <li key={index}>
              <h2>{resource.title}</h2>
              <p>{resource.description}</p>
              <a href={resource.url}>Learn More</a>
            </li>
          ))}
        </ul>
      ) : (
        <p>No resources found</p>
      )}
    </div>
  );
};

export default ResourcesComponent;
