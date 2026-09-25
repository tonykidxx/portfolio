"use client";

import { useState } from "react";
import Link from "next/link";
import {
  createClient,
  updateClient,
  deleteClient,
  seedDefaultClients,
} from "@/actions/client-actions";
import {
  Users,
  Upload,
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Loader2,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  ArrowUpDown,
} from "lucide-react";

interface Client {
  id: string;
  name: string;
  followers: string;
  imageUrl: string;
  role?: string | null;
  profileUrl?: string | null;
  order: number;
}

export function ClientManager({ initialClients }: { initialClients: Client[] }) {
  const [clients, setClients] = useState<Client[]>(initialClients);

  // New Client Form State
  const [name, setName] = useState("");
  const [followers, setFollowers] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [role, setRole] = useState("");
  const [profileUrl, setProfileUrl] = useState("");

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Edit State
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editName, setEditName] = useState("");
  const [editFollowers, setEditFollowers] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editProfileUrl, setEditProfileUrl] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleFileUpload = async (file: File, isEdit: boolean = false) => {
    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Erro no upload da imagem.");
      const data = await res.json();

      if (isEdit) {
        setEditImageUrl(data.url);
      } else {
        setImageUrl(data.url);
      }
    } catch (err: any) {
      alert(err.message || "Falha ao enviar arquivo.");
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !followers.trim() || !imageUrl.trim()) {
      setError("Nome, Seguidores e Foto da bolinha são obrigatórios.");
      return;
    }

    setSubmitting(true);
    try {
      const created = await createClient({
        name,
        followers,
        imageUrl,
        role,
        profileUrl,
      });

      setClients([...clients, created]);
      setName("");
      setFollowers("");
      setImageUrl("");
      setRole("");
      setProfileUrl("");
    } catch (err: any) {
      setError(err.message || "Erro ao adicionar cliente.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (client: Client) => {
    setEditingClient(client);
    setEditName(client.name);
    setEditFollowers(client.followers);
    setEditImageUrl(client.imageUrl);
    setEditRole(client.role || "");
    setEditProfileUrl(client.profileUrl || "");
  };

  const handleSaveEdit = async () => {
    if (!editingClient) return;
    if (!editName.trim() || !editFollowers.trim() || !editImageUrl.trim()) {
      alert("Nome, Seguidores e Foto são obrigatórios.");
      return;
    }

    setSavingEdit(true);
    try {
      const updated = await updateClient(editingClient.id, {
        name: editName,
        followers: editFollowers,
        imageUrl: editImageUrl,
        role: editRole,
        profileUrl: editProfileUrl,
      });

      setClients(clients.map((c) => (c.id === editingClient.id ? updated : c)));
      setEditingClient(null);
    } catch (err: any) {
      alert(err.message || "Erro ao salvar alterações.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteClient(deleteId);
      setClients(clients.filter((c) => c.id !== deleteId));
      setDeleteId(null);
    } catch (err: any) {
      alert(err.message || "Erro ao excluir cliente.");
    } finally {
      setDeleting(false);
    }
  };

  const handleSeed = async () => {
    try {
      await seedDefaultClients();
      window.location.reload();
    } catch (err) {
      alert("Erro ao carregar exemplos.");
    }
  };

  return (
    <div className="space-y-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users size={24} className="text-[#e50914]" />
            <span>Clientes & Criadores ("Bolinhas")</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Gerencie os clientes e influenciadores destacados em formato de círculo/stories com foto, nome e seguidores.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/organize?tab=clients"
            className="flex items-center gap-2 bg-[#222] hover:bg-[#333] border border-white/10 text-white text-xs px-4 py-2.5 rounded-lg transition-colors cursor-pointer shadow"
          >
            <ArrowUpDown size={14} className="text-[#e50914]" />
            <span>Organizar Ordem (Drag & Drop)</span>
          </Link>

          {clients.length === 0 && (
            <button
              onClick={handleSeed}
              className="flex items-center gap-2 bg-[#222] hover:bg-[#333] border border-white/10 text-white text-xs px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              <Sparkles size={14} className="text-[#e50914]" />
              <span>Carregar Exemplos Prontos</span>
            </button>
          )}
        </div>
      </div>

      {/* Form: Add New Client */}
      <div className="bg-[#141414] border border-white/10 p-6 sm:p-8 rounded-xl space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
          <Plus size={20} className="text-[#e50914]" />
          <span>Cadastrar Nova Bolinha de Cliente</span>
        </h2>

        {error && (
          <div className="p-4 bg-red-950/40 border border-red-500/50 text-red-200 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Inputs */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-200">
                  Nome do Cliente / Criador *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Alok, Whindersson, Nubank"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#222] border border-[#5a5a5a] focus:border-[#e50914] focus:outline-none rounded-lg px-4 py-2.5 text-white text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-200">
                  Número de Seguidores *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 28.5M seguidores ou 850K"
                  value={followers}
                  onChange={(e) => setFollowers(e.target.value)}
                  className="w-full bg-[#222] border border-[#5a5a5a] focus:border-[#e50914] focus:outline-none rounded-lg px-4 py-2.5 text-white text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-200">
                  Cargo / Categoria (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: DJ & Produtor, Creator, Marca"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#222] border border-[#5a5a5a] focus:border-[#e50914] focus:outline-none rounded-lg px-4 py-2.5 text-white text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-200">
                  Link do Perfil / Instagram (Opcional)
                </label>
                <input
                  type="url"
                  placeholder="https://instagram.com/usuario"
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  className="w-full bg-[#222] border border-[#5a5a5a] focus:border-[#e50914] focus:outline-none rounded-lg px-4 py-2.5 text-white text-sm"
                />
              </div>
            </div>

            {/* Right Column: Photo Upload & Live Circular Preview */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-200 flex items-center justify-between">
                  <span>Foto da Bolinha (Avatar) *</span>
                  <span className="text-xs text-gray-400">JPG, PNG ou WebP</span>
                </label>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    required
                    placeholder="URL da imagem ou faça upload"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 bg-[#222] border border-[#5a5a5a] focus:border-[#e50914] focus:outline-none rounded-lg px-4 py-2.5 text-white text-sm"
                  />

                  <label className="bg-[#333] hover:bg-[#444] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer border border-white/10 shrink-0">
                    {uploading ? (
                      <Loader2 size={16} className="animate-spin text-[#e50914]" />
                    ) : (
                      <Upload size={16} />
                    )}
                    <span>Upload Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFileUpload(f, false);
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Live Story Circle Preview */}
              <div className="p-6 bg-black/60 border border-white/10 rounded-xl flex flex-col items-center justify-center space-y-3">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                  Pré-visualização da Bolinha
                </p>

                <div className="flex flex-col items-center p-2">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-[#222] shadow-lg flex items-center justify-center">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <Users size={32} className="text-gray-500" />
                    )}
                  </div>

                  <div className="text-center mt-2.5 max-w-[130px] space-y-0.5">
                    <p className="text-white text-sm font-semibold truncate">
                      {name || "Nome do Cliente"}
                    </p>
                    <p className="text-xs text-gray-400 font-normal truncate">
                      {followers || "0 seguidores"}
                    </p>
                    {role && (
                      <span className="text-[10px] text-gray-500 truncate block font-light">
                        {role}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting || uploading}
              className="bg-[#e50914] hover:bg-[#f6121d] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Check size={18} />
                  <span>Salvar Bolinha de Cliente</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Clients List / Grid */}
      <div className="bg-[#141414] border border-white/10 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-bold text-white">Bolinhas Cadastradas ({clients.length})</h3>
          <span className="text-xs text-gray-400">Exibidas na Landing Page</span>
        </div>

        {clients.length === 0 ? (
          <div className="p-12 text-center text-gray-400 space-y-3">
            <p>Nenhum cliente cadastrado no momento.</p>
            <p className="text-xs text-gray-500">
              Use o formulário acima para adicionar ou clique em "Carregar Exemplos Prontos".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6">
            {clients.map((client) => (
              <div
                key={client.id}
                className="bg-[#1c1c1c] border border-white/10 rounded-xl p-5 flex flex-col justify-between items-center text-center gap-4 hover:border-white/20 transition-all group"
              >
                {/* Clean Circular Avatar */}
                <div className="w-20 h-20 rounded-full overflow-hidden bg-[#141414] shadow-md group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={client.imageUrl}
                    alt={client.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="space-y-1 w-full px-2">
                  <h4 className="text-white font-bold text-base truncate">
                    {client.name}
                  </h4>
                  <p className="text-sm text-gray-300 font-medium truncate">
                    {client.followers}
                  </p>
                  {client.role && (
                    <span className="inline-block text-xs text-gray-400 px-2 py-0.5 bg-white/5 rounded">
                      {client.role}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-white/10 w-full justify-center">
                  {client.profileUrl && (
                    <a
                      href={client.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                      title="Abrir Link Externo"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}

                  <button
                    onClick={() => startEdit(client)}
                    className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                    title="Editar"
                  >
                    <Edit2 size={16} />
                  </button>

                  <button
                    onClick={() => setDeleteId(client.id)}
                    className="p-2 text-gray-400 hover:text-red-400 bg-white/5 hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingClient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/10 rounded-xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-bold text-white text-lg">Editar Bolinha de Cliente</h3>
              <button
                onClick={() => setEditingClient(null)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-300 font-semibold">Nome</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#222] border border-[#555] rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-300 font-semibold">Seguidores</label>
                <input
                  type="text"
                  value={editFollowers}
                  onChange={(e) => setEditFollowers(e.target.value)}
                  className="w-full bg-[#222] border border-[#555] rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-300 font-semibold">URL da Foto</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    className="flex-1 bg-[#222] border border-[#555] rounded-lg px-3 py-2 text-white text-sm"
                  />
                  <label className="bg-[#333] hover:bg-[#444] text-white px-3 py-2 rounded-lg text-xs font-medium cursor-pointer border border-white/10 shrink-0 flex items-center gap-1">
                    <Upload size={14} />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFileUpload(f, true);
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-300 font-semibold">Cargo / Categoria</label>
                <input
                  type="text"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full bg-[#222] border border-[#555] rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-300 font-semibold">Link do Perfil</label>
                <input
                  type="url"
                  value={editProfileUrl}
                  onChange={(e) => setEditProfileUrl(e.target.value)}
                  className="w-full bg-[#222] border border-[#555] rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingClient(null)}
                className="px-4 py-2 bg-[#222] hover:bg-[#333] text-gray-300 rounded-lg text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={savingEdit}
                onClick={handleSaveEdit}
                className="px-5 py-2 bg-[#e50914] hover:bg-[#f6121d] text-white rounded-lg text-sm font-semibold flex items-center gap-2"
              >
                {savingEdit && <Loader2 size={16} className="animate-spin" />}
                <span>Salvar Alterações</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/10 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-500">
              <AlertTriangle size={24} />
              <h3 className="font-bold text-white text-lg">Confirmar Exclusão</h3>
            </div>
            <p className="text-gray-300 text-sm">
              Tem certeza que deseja remover esta bolinha de cliente? Ela não aparecerá mais no site público.
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-[#222] hover:bg-[#333] text-gray-300 rounded-lg text-sm cursor-pointer"
              >
                Cancelar
              </button>
              <button
                disabled={deleting}
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer"
              >
                {deleting && <Loader2 size={16} className="animate-spin" />}
                <span>Excluir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
