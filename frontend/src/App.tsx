import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // State for storing the message from backend
  const [message, setMessage] = useState('');

  // State for storing data from database
  const [data, setData] = useState<any[]>([]);

  // Get API URL from environment variables or use localhost as fallback
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  // Effect hook to fetch data when component mounts
  useEffect(() => {
    // Fetch simple message from backend
    fetch(`${apiUrl}/api/message`)
      .then(res => res.json())
      .then(data => setMessage(data.text))
      .catch(err => console.error('Error fetching message:', err));

    // Fetch data from backend (which comes from database)
    fetch(`${apiUrl}/api/data`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setData(data);
        } else {
          setData([]);
          console.error("API did not return array:", data);
        }
      })
      .catch(err => console.error('Error fetching data:', err));
  }, [apiUrl]); // Dependency array ensures effect runs when apiUrl changes

  return (
    <div className="App">
      <header className="App-header">
        <h1>Cloud Infrastructure Project</h1>

        {/* Display message from backend */}
        <p>Message from backend: {message}</p>

        <h2>Data from Database:</h2>
        <ul>
          {/* Map through data array and display each item */}
          {data.map((item, index) => (
            <li key={index}>{JSON.stringify(item)}</li>
          ))}
        </ul>
      </header>
    </div>
  );
}

export default App;