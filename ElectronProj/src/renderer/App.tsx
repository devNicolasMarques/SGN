import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import List from './pages/List';
import Products from './pages/Products';
import Movements from './pages/Movements';
import './App.css'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<List />} />
        <Route path="/nota/:id" element={<Products />} />
        <Route path="/nota/:notaId/produto/:id" element={<Movements />} />
      </Routes>
    </Router>
  );
}
