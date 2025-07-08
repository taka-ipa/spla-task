import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/tasks')  // 👈ここLaravelのURL
      .then(response => {
        setTasks(response.data);
      })
      .catch(error => {
        console.error('API取得エラー:', error);
      });
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">今日の課題一覧</h1>
      <ul className="space-y-2">
        {tasks.map(task => (
          <li key={task.id} className="border p-2 rounded">
            {task.title}：{task.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;

