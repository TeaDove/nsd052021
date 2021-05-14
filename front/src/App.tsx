import React, { useState, useEffect } from "react";

function App() {
  const [response, setresponse] = useState(null);
  useEffect(() => {
    fetch(window.location.protocol + "//" + window.location.hostname + ":8000/")
      .then((res) => res.json())
      .then((res) => {
        console.log("Got from server", res);
        setresponse(res);
      });
  }, []);

  return (
    <div>
      <main>
        <h1>Здарова</h1>

        <div>
          {response === null ? <span>Загрузка</span> : JSON.stringify(response)}
        </div>
      </main>
    </div>
  );
}

export default App;
