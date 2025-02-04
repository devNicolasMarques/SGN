import Reload from '../../../assets/icons/reload-svgrepo-com.svg'
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

type Produto = {
  id: number;
  codigo: string;
  produto: string;
  quantidade: number;
  unidade: string;
  preco_unitario: number;
  preco_total: number;
  nota_id: number;
};

type Nota = {
  nota_id: number;
  nDAV: number;
  data_venda: string;
  cliente_id: number;
  cliente: string;
  cliente_email: string;
  cliente_telefone: string;
  vendedor: string;
  produtos: Produto[];
};

type ArrayDataItemsProps = {
  notas: Nota[];
};

export default function List() {
  const [list, setList] = useState<Nota[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Nota[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filePath, setFilePath] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Estado para controle de carregamento

  useEffect(() => {
    getList();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, list]);

  const getList = async () => {
    const res = await axios.get('http://localhost:3000/api/pdf/notas');
    setList(res.data);
    setFilteredNotes(res.data);
  };

  const handleRegister = async () => {
    setIsLoading(true); // Ativa o carregamento
    try {
      await axios.post('http://localhost:3000/api/pdf/cadastrarNota', {
        caminhoArquivo: filePath, // Passando o caminho do arquivo de forma correta
      });
    } catch (err) {
      console.log(err);
    } finally {
      getList()
      setIsLoading(false); // Desativa o carregamento após a operação
      setIsModalOpen(false)
    }
  };

  const handleSearch = () => {
    const filtered = list.filter(
      (nota) =>
        nota.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nota.nDAV.toString().includes(searchTerm)
    );
    setFilteredNotes(filtered);
  };

  const handleNavigate = (id: number) => {
    navigate(`nota/${id}`);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFilePath(file.name);
    }
  };

  const ArrayDataItems = ({ notas }: ArrayDataItemsProps) => {
    return (
      <>
        {notas.map((nota) => {
          const isInactive = nota.produtos.every((produto) => produto.quantidade === 0);

          return (
            <tr
              key={nota.nota_id}
              onClick={() => handleNavigate(nota.nota_id)}
              className={`transition-colors duration-200 hover:bg-gray-100 cursor-pointer ${
                isInactive ? 'opacity-50' : ''
              }`}
            >
              <td className="px-6 py-4 text-gray-700">{nota.nDAV}</td>
              <td className="px-6 py-4 text-gray-700">{nota.data_venda}</td>
              <td className="px-6 py-4 text-gray-700">{nota.cliente}</td>
              <td className="px-6 py-4 text-gray-700">{nota.vendedor}</td>
              <td className="px-6 py-4 text-center">
                <div
                  className={`w-4 h-4 mx-auto rounded-full ${
                    isInactive ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  title={isInactive ? 'Inativo' : 'Ativo'}
                ></div>
              </td>
            </tr>
          );
        })}
      </>
    );
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center gap-4 mb-4">
          <h1 className='text-2xl'>Lista de notas para retirada</h1>
          <div className='flex gap-4'>
            <input
              type="text"
              placeholder="Buscar por cliente ou nº DAV"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-gray-300 rounded px-4 py-2 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
            <button
              onClick={toggleModal}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Cadastrar nota
            </button>
            <button
              onClick={getList}
              className="bg-yellow-200 px-4 py-2 rounded hover:bg-yellow-300"
            >
              <img src={Reload} className="h-5" alt="" />
            </button>
          </div>
        </div>

        <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-6 py-3 font-medium text-gray-600">N° DAV</th>
              <th className="px-6 py-3 font-medium text-gray-600">Data da Nota</th>
              <th className="px-6 py-3 font-medium text-gray-600">Cliente</th>
              <th className="px-6 py-3 font-medium text-gray-600">Vendedor</th>
              <th className="px-6 py-3 font-medium text-gray-600 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            <ArrayDataItems notas={filteredNotes} />
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Selecione o Arquivo</h2>
            <input
              type="file"
              onChange={handleFileChange}
              className="block w-full text-gray-700 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="flex justify-between">
              <button
                onClick={toggleModal}
                className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition duration-300"
              >
                Fechar
              </button>
              <button
                onClick={handleRegister}
                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-300"
              >
                {isLoading ? 'Carregando...' : 'Cadastrar'}
              </button>
            </div>
          </div>
        </div>
      )}
      {isLoading && (
  <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
        <span className="ml-4 text-xl text-gray-700">Carregando...</span>
      </div>
    </div>
  </div>
)}
</>
   
  );
}
