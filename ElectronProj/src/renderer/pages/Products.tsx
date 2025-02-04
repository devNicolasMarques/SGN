import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { jsPDF } from "jspdf";
import "../App.css";

type Movimentacao = {
    id: number;
    quantidade: number;
    data_retirada: string;
}

type Produto = {
    id: number;
    descricao: string;
    quantidade: number;
    unidade: string;
    preco_unitario: number;
    preco_total: number;
    data_retirada?: string;
    movimentacoes: Movimentacao[];
};

type Nota = {
    nDAV: string;
    cliente: string;
    vendedor: string;
    data_venda: string;
    produtos: Produto[];
};

export default function Products() {
    const { id } = useParams();
    const [info, setInfo] = useState<Nota>({
        nDAV: "",
        cliente: "",
        vendedor: "",
        data_venda: "",
        produtos: [],
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);
    const [quantityToRemove, setQuantityToRemove] = useState<number>(0);
    const [selectedDate, setSelectedDate] = useState<string>("");

    const navigate = useNavigate();

    const currencyFormat = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    });

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(e.target.value);
    };

    const incrementQuantity = () => {
        if (selectedProduct && quantityToRemove < selectedProduct.quantidade) {
            setQuantityToRemove((prev) => prev + 1);
        }
    };

    const decrementQuantity = () => {
        if (quantityToRemove > 0) {
            setQuantityToRemove((prev) => prev - 1);
        }
    };

    const updateProductQuantity = async (product_id: number, quantity: number, date: string) => {
        try {
            const response = await axios.put(
                "http://localhost:3000/api/pdf/notas/atualizar-quantidade",
                {
                    produtoId: product_id,
                    quantidade: quantity,
                    dataRetirada: date,
                }
            );
            return response.data;
        } catch (error) {
            console.error("Erro ao atualizar quantidade:", error);
        }
    };

    useEffect(() => {
        if (id) {
            axios
                .get(`http://localhost:3000/api/pdf/notas/${id}`)
                .then((response) => {
                    setInfo(response.data);
                    console.log(response.data);
                })
                .catch((error) => {
                    console.error("Erro ao buscar nota:", error);
                });
        }
    }, [id]);
    const handleNavigate = (notaId: number, produtoId: number) => {
        navigate(`/nota/${notaId}/produto/${produtoId}`);
    };

    const handleOpenModal = (produto: Produto) => {
        setSelectedProduct(produto);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
        setQuantityToRemove(0);
    };

    const handleUpdateProduct = async () => {
        if (selectedProduct) {
            if (quantityToRemove > 0 && quantityToRemove <= selectedProduct.quantidade) {
                const updatedProduct = { ...selectedProduct, quantidade: selectedProduct.quantidade - quantityToRemove };
                updatedProduct.preco_total = updatedProduct.preco_unitario * updatedProduct.quantidade;

                const updatedData = await updateProductQuantity(selectedProduct.id, quantityToRemove, selectedDate);
                if (updatedData) {
                    const updatedProdutos = info.produtos.map((produto) =>
                        produto.id === selectedProduct.id ? updatedProduct : produto
                    );
                    setInfo((prevInfo) => ({
                        ...prevInfo,
                        produtos: updatedProdutos,
                    }));
                    handleCloseModal();
                }
            } else {
                alert("Quantidade inválida ou maior que a quantidade disponível!");
            }
        }
    };

    const handlePrintPDF = () => {
        const filteredProducts = info.produtos.filter((produto) => {
            const filteredMovements = produto.movimentacoes.filter((movimentacao) => {
                const retiradaDate = new Date(movimentacao.data_retirada);
                const selectedDateObj = new Date(selectedDate);
                return retiradaDate >= selectedDateObj;
            });

            return filteredMovements.length > 0;
        });

        console.log(filteredProducts);

        const doc = new jsPDF();

        doc.text(`N° DAV: ${info.nDAV}`, 10, 10);
        doc.text(`Cliente: ${info.cliente}`, 10, 20);
        doc.text(`Vendedor: ${info.vendedor}`, 10, 30);
        doc.text(`Data da venda: ${info.data_venda}`, 10, 40);

        let yPosition = 50;
        filteredProducts.forEach((produto) => {
            doc.text(`Produto: ${produto.descricao}`, 10, yPosition);
            yPosition += 10;
            doc.text(`Quantidade: ${produto.quantidade}`, 10, yPosition);
            yPosition += 10;
            doc.text(`Preço Unitário: ${currencyFormat.format(produto.preco_unitario)}`, 10, yPosition);
            yPosition += 10;
            doc.text(`Preço Total: ${currencyFormat.format(produto.preco_total)}`, 10, yPosition);
            yPosition += 20;
        });

        doc.save('venda.pdf');
    };

    const renderProductsTable = (produtos: Produto[], isAtivo: boolean) => (
        <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md mb-6">
            <thead>
                <tr className="bg-gray-100 text-left">
                    <th className="px-6 py-3 font-medium text-gray-600">Nome do Produto</th>
                    <th className="px-6 py-3 font-medium text-gray-600">Quantidade</th>
                    <th className="px-6 py-3 font-medium text-gray-600">Unidade</th>
                    <th className="px-6 py-3 font-medium text-gray-600">Preço Unitário</th>
                    <th className="px-6 py-3 font-medium text-gray-600">Preço Total</th>
                    {isAtivo && <th className="px-6 py-3 font-medium text-gray-600">Ações</th>}
                </tr>
            </thead>
            <tbody>
                {produtos.map((produto) => (
                    <tr
                        key={produto.id}
                        className={`cursor-pointer bg-cyan-300 transition-colors duration-200 ${!isAtivo ? 'bg-red-300' : ''}`}
                        onClick={() => handleNavigate(Number(id), produto.id)}
                    >
                        <td className="px-6 py-4 text-gray-700">{produto.descricao}</td>
                        <td className="px-6 py-4 text-gray-700">{produto.quantidade}</td>
                        <td className="px-6 py-4 text-gray-700">{produto.unidade}</td>
                        <td className="px-6 py-4 text-gray-700">{currencyFormat.format(produto.preco_unitario)}</td>
                        <td className="px-6 py-4 text-gray-700">{currencyFormat.format(produto.preco_total)}</td>
                        {isAtivo && (
                            <td>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenModal(produto);
                                    }}
                                    className="text-red-500"
                                >
                                    Retirar produto
                                </button>
                            </td>
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const activeProducts = info.produtos.filter(p => p.quantidade > 0);
    const inactiveProducts = info.produtos.filter(p => p.quantidade === 0);

    return (
        <>
            <button
                className="bg-blue-500 text-white px-4 py-2 m-5 rounded hover:bg-blue-600 mb-4"
                onClick={() => navigate('../')}
            >
                Voltar
            </button>

            <div className="container mx-auto p-4">
                <div className="flex flex-col">
                    <span><span className="font-bold">N° DAV: </span>{info.nDAV}</span>
                    <span><span className="font-bold">Cliente: </span>{info.cliente}</span>
                    <span><span className="font-bold">Vendedor: </span>{info.vendedor}</span>
                    <span><span className="font-bold">Data e hora da venda: </span>{info.data_venda}</span>
                </div>

                <div className="flex flex-col">
                    <div>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={handleDateChange}
                            className="border px-4 py-2 rounded-lg mr-2"
                        />
                        <button
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-4"
                            onClick={handlePrintPDF}
                        >
                            Imprimir PDF
                        </button>
                    </div>
                </div>

                <div className="mt-6">
                    {renderProductsTable(activeProducts, true)}
                    {renderProductsTable(inactiveProducts, false)}
                </div>
            </div>

            {isModalOpen && selectedProduct && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Retirar Produto</h2>
                        <p><strong>Produto:</strong> {selectedProduct.descricao}</p>
                        <p><strong>Quantidade disponível:</strong> {selectedProduct.quantidade}</p>
                        <p><strong>Preço Unitário:</strong> {currencyFormat.format(selectedProduct.preco_unitario)}</p>
                        <div className="mt-4">
                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                onClick={decrementQuantity}
                            >
                                -
                            </button>
                            <span className="mx-4">{quantityToRemove}</span>
                            <button
                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                onClick={incrementQuantity}
                            >
                                +
                            </button>
                        </div>
                        <div className="mt-6 flex justify-between">
                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                onClick={handleCloseModal}
                            >
                                Cancelar
                            </button>
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                onClick={handleUpdateProduct}
                            >
                                Atualizar Quantidade
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
