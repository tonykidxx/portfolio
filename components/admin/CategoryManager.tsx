"use client";

import { useState } from "react";
import Link from "next/link";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/actions/category-actions";
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  FolderTree,
  AlertTriangle,
  ArrowUpDown,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  order: number;
  _count?: { projects: number };
}

export function CategoryManager({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [newCatName, setNewCatName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setLoading(true);
    try {
      const created = await createCategory(newCatName);
      setCategories([...categories, created]);
      setNewCatName("");
    } catch (err: any) {
      alert(err.message || "Erro ao criar categoria.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;

    try {
      await updateCategory(id, editName);
      setCategories(
        categories.map((c) => (c.id === id ? { ...c, name: editName } : c))
      );
      setEditingId(null);
    } catch (err: any) {
      alert(err.message || "Erro ao atualizar categoria.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteCategory(deleteId);
      setCategories(categories.filter((c) => c.id !== deleteId));
      setDeleteId(null);
    } catch (err: any) {
      alert(err.message || "Erro ao excluir categoria.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Create New Category Form */}
      <div className="bg-[#141414] border border-white/10 p-6 rounded-xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <FolderTree size={20} className="text-[#e50914]" />
          <span>Nova Categoria</span>
        </h2>

        <form onSubmit={handleCreate} className="flex gap-3 max-w-xl">
          <input
            type="text"
            placeholder="Ex: Comercial, Videoclipe, Documentário"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="flex-1 bg-[#222] border border-[#5a5a5a] focus:border-[#e50914] focus:outline-none rounded-lg px-4 py-2.5 text-white text-sm"
          />
          <button
            type="submit"
            disabled={loading || !newCatName.trim()}
            className="bg-[#e50914] hover:bg-[#f6121d] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Plus size={18} />
            <span>Adicionar</span>
          </button>
        </form>
      </div>

      {/* Category List */}
      <div className="bg-[#141414] border border-white/10 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-white text-base">Categorias Cadastradas</h3>
            <span className="text-xs text-gray-400">Total: {categories.length} seções</span>
          </div>

          <Link
            href="/admin/organize?tab=sections"
            className="flex items-center gap-2 bg-[#222] hover:bg-[#333] text-gray-200 hover:text-white border border-white/10 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow"
          >
            <ArrowUpDown size={14} className="text-[#e50914]" />
            <span>Organizar Ordem (Drag & Drop)</span>
          </Link>
        </div>

        {categories.length === 0 ? (
          <div className="p-12 text-center text-gray-400 space-y-2">
            <p>Nenhuma categoria cadastrada.</p>
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {categories.map((cat) => (
              <li
                key={cat.id}
                className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors"
              >
                {editingId === cat.id ? (
                  <div className="flex items-center gap-2 flex-1 max-w-md">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 bg-[#222] border border-[#e50914] rounded px-3 py-1.5 text-white text-sm focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(cat.id)}
                      className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded cursor-pointer"
                      title="Salvar"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded cursor-pointer"
                      title="Cancelar"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-white font-medium text-base">{cat.name}</span>
                    {cat._count?.projects !== undefined && (
                      <span className="text-xs text-gray-400 bg-white/10 px-2 py-0.5 rounded-full">
                        {cat._count.projects} projetos
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {editingId !== cat.id && (
                    <button
                      onClick={() => {
                        setEditingId(cat.id);
                        setEditName(cat.name);
                      }}
                      className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                      title="Editar Nome"
                    >
                      <Edit2 size={16} />
                    </button>
                  )}

                  <button
                    onClick={() => setDeleteId(cat.id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                    title="Excluir Categoria"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/10 p-6 rounded-xl max-w-md w-full space-y-5">
            <div className="flex items-center gap-3 text-red-500 font-bold text-lg">
              <AlertTriangle size={24} />
              <span>Confirmar Exclusão</span>
            </div>
            <p className="text-gray-300 text-sm">
              Tem certeza que deseja excluir esta categoria? Todos os projetos associados a ela também serão excluídos do banco de dados.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-md cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-[#e50914] hover:bg-[#f6121d] text-white text-sm font-semibold rounded-md cursor-pointer"
              >
                Excluir Categoria
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
