import './App.scss';
import { TodoList } from './components/TodoList';
import { useState } from 'react';
import usersFromServer from './api/users';
import todosFromServer from './api/todos';
import { Todo } from './type/Todo';
import { User } from './type/User';

const ENGLISH_SUMBOLS = 'abcdefhijgklmnopqrstuvwxyz';
const UKRAINIAN_SUMBOLS = 'абвгдеєжзиіїйклмнопрстуфхцчшщьюя';
const NUMBER = ' 0123456789';

const todosWithUser = todosFromServer.map(todo => {
  const userNow: User = usersFromServer.find((user: User) => {
    if (user.id === todo.userId) {
      return true;
    }

    return false;
  })!;

  return {
    ...todo,
    user: userNow,
  };
});

export const App = () => {
  const [todos, setTodos] = useState(todosWithUser);
  const users: User[] = usersFromServer;

  const [newUser, setNewUser] = useState(0);
  const [newTitle, setNewTitle] = useState('');

  const [submit, setSubmit] = useState(false);

  const clearForm = () => {
    setNewUser(0);
    setNewTitle('');
  };

  const validationTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const word = String(e.target.value);
    let valid: boolean = true;

    word.split('').map(w => {
      if (
        !NUMBER.includes(w) &&
        !UKRAINIAN_SUMBOLS.includes(w) &&
        !ENGLISH_SUMBOLS.includes(w) &&
        !UKRAINIAN_SUMBOLS.toUpperCase().includes(w) &&
        !ENGLISH_SUMBOLS.toUpperCase().includes(w)
      ) {
        valid = false;
      }
    });

    if (valid) {
      setNewTitle(e.target.value);
    } else {
      return;
    }
  };

  const validationForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmit(true);

    if (newUser !== 0 && newTitle !== '') {
      const maxId = Math.max(0, ...todos.map((todo: Todo) => +todo.id));
      const userNow: User = usersFromServer.find((user: User) => {
        if (user.id === newUser) {
          return true;
        }

        return false;
      })!;

      const newTodo: Todo = {
        id: maxId + 1,
        title: newTitle,
        completed: false,
        userId: newUser,
        user: userNow,
      };

      setTodos(prev => [...prev, newTodo]);
      setSubmit(false);
      clearForm();
    }
  };

  return (
    <div className="App">
      <h1>Add todo form</h1>

      <form
        action="/api/todos"
        method="POST"
        onSubmit={e => {
          validationForm(e);
        }}
      >
        <div className="field">
          <label htmlFor="title">Enter a title:</label>
          <input
            type="text"
            id="title"
            placeholder="title..."
            data-cy="titleInput"
            value={newTitle}
            onChange={e => {
              validationTitle(e);
            }}
          />
          {submit && !newTitle && (
            <span className="error">Please enter a title</span>
          )}
        </div>

        <div className="field">
          <label htmlFor="select">Choose a user:</label>
          <select
            data-cy="userSelect"
            value={newUser}
            id="select"
            onChange={e => {
              setNewUser(+e.target.value);
            }}
          >
            <option value="0" disabled>
              Choose a user
            </option>
            {users.map(user => {
              return (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              );
            })}
          </select>

          {submit && !newUser && (
            <span className="error">Please choose a user</span>
          )}
        </div>

        <button type="submit" data-cy="submitButton">
          Add
        </button>
      </form>

      <TodoList todos={todos} />
    </div>
  );
};
