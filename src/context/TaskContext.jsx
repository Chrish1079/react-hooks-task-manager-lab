import React, { createContext, useState, useEffect, useMemo, useCallback } from "react";

export const TaskContext = createContext();

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetch('http://localhost:6001/tasks')
      .then(r => r.json())
      .then(data => {
        // Handle both array and single object responses
        const tasksArray = Array.isArray(data) ? data : [data];
        setTasks(prevTasks => {
          // If we already have tasks, merge with fetched data (avoid duplicates)
          if (prevTasks.length > 0) {
            const existingIds = new Set(prevTasks.map(t => t.id));
            const newTasks = tasksArray.filter(t => !existingIds.has(t.id));
            return [...prevTasks, ...newTasks];
          }
          return tasksArray;
        });
      });
  }, []);

  const addTask = useCallback(async (taskTitle) => {
    const newTask = {
      title: taskTitle,
      completed: false
    };

    const response = await fetch('http://localhost:6001/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTask),
    });

    const createdTask = await response.json();
    setTasks(prevTasks => [...prevTasks, createdTask]);
  }, []);

  const toggleComplete = useCallback(async (taskId) => {
    setTasks(prevTasks => {
      const task = prevTasks.find(t => t.id === taskId);
      if (!task) return prevTasks;

      const updatedTask = { ...task, completed: !task.completed };

      // Update db.json
      fetch(`http://localhost:6001/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: updatedTask.completed }),
      });

      // Update page immediately
      return prevTasks.map(t => t.id === taskId ? updatedTask : t);
    });
  }, []);

  const value = useMemo(() => ({
    tasks,
    addTask,
    toggleComplete
  }), [tasks, addTask, toggleComplete]);

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}
