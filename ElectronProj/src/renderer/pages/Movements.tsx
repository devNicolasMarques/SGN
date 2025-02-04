import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

type Movimentacao = {
    id: number;
    quantidade: number;
    data_retirada: string;
};

type Produto = {
    id: number;
    descricao: string;
    movimentacoes: Movimentacao[];
};

export default function Movements() {
    const { notaId, id } = useParams(); // ID do produto
    console.log(notaId, id);
    const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
    const [produtoDescricao, setProdutoDescricao] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Substitua pela sua API ou endpoint real
        axios
            .get(`http://localhost:3000/api/pdf/notas/${notaId}`) // Buscar nota completa
            .then((response) => {
                const nota = response.data;
                const produto = nota.produtos.find((p: Produto) => p.id === Number(id));
                console.log(nota);

                if (produto) {
                    setProdutoDescricao(produto.descricao);
                    setMovimentacoes(produto.movimentacoes || []);
                } else {
                    setError("Produto não encontrado nesta nota.");
                }
            })
            .catch((error) => {
                console.error("Erro ao buscar dados:", error);
                setError("Erro ao buscar movimentações.");
            })
            .finally(() => setLoading(false));
    }, [notaId, id]);

    return (
        <div className="container mx-auto p-4">
            <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 "
                onClick={() => navigate(-1)}
            >
                Voltar
            </button>
            <h1 className="text-2xl font-bold mb-4">Movimentações de {produtoDescricao}</h1>

            {loading ? (
                <p>Carregando...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : movimentacoes.length === 0 ? (
                <p>Nenhuma movimentação encontrada para este produto.</p>
            ) : (
                <table className="table-auto w-full border-collapse border border-gray-300">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 px-4 py-2">Quantidade</th>
                            <th className="border border-gray-300 px-4 py-2">Data Retirada</th>
                        </tr>
                    </thead>
                    <tbody>
                        {movimentacoes.map((mov) => (
                            <tr key={mov.id}>
                                <td className="border border-gray-300 px-4 py-2 text-center">{mov.quantidade}</td>
                                <td className="border border-gray-300 px-4 py-2 text-center">
                                    {new Date(mov.data_retirada).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
