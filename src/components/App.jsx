import React from "react";
import TaskForm from "./TaskForm";
import SearchBar from "./SearchBar";

function App() {
  return (
    <div>
      <h1>Task Manager</h1>
      <TaskForm />
      <SearchBar />
    </div>
  );
}

export default App;
