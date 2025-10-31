import React, { useState } from "react";

const ToDoCard = () => {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Assignment 1 Due: 15/9", completed: false },
    { id: 2, text: "Attend Class", completed: true },
    { id: 3, text: "Answer Quiz", completed: false }
  ]);

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="card todo-card">
      <h2 className="card-title">To-do</h2>
      <ul className="card-list">
        {tasks.map(task => (
          <li key={task.id} className="todo-item">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id)}
              className="todo-checkbox"
            />
            <span className={task.completed ? "completed" : ""}>{task.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ToDoCard;
