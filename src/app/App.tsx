import { RouterProvider } from 'react-router';
import { router } from './routes';

function App() {
  return (
    <div className="light">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
