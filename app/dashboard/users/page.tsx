"use client";

import { useState, useEffect, useCallback } from "react";
import { offices } from "@/lib/config/offices";
import type { TeamMember, TeamMemberRole } from "@/types/dashboard";

const ROLES: { value: TeamMemberRole; label: string }[] = [
  { value: "admin", label: "Administrador" },
  { value: "attorney", label: "Abogado" },
  { value: "paralegal", label: "Paralegal" },
  { value: "intake", label: "Intake" },
];

export default function UsersPage() {
  const [users, setUsers] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, available: 0, totalCapacity: 0, currentLoad: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", role: "intake" as TeamMemberRole, office_location: "", max_concurrent_chats: 5, can_receive_assignments: true });

  const fetchUsers = useCallback(async () => {
    const res = await fetch("/api/users");
    const json = await res.json();
    setUsers(json.users || []);
    setStats(json.stats || stats);
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const url = editingId ? `/api/users/${editingId}` : "/api/users";
    const method = editingId ? "PATCH" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, office_location: form.office_location || null }),
    });
    setShowForm(false);
    setEditingId(null);
    setForm({ name: "", email: "", role: "intake", office_location: "", max_concurrent_chats: 5, can_receive_assignments: true });
    fetchUsers();
  }

  async function toggleAvailable(user: TeamMember) {
    await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_available: !user.is_available }),
    });
    fetchUsers();
  }

  async function toggleActive(user: TeamMember) {
    if (user.is_active === false) {
      await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: true }),
      });
    } else {
      await fetch(`/api/users/${user.id}`, { method: "DELETE" });
    }
    fetchUsers();
  }

  function startEdit(user: TeamMember) {
    setEditingId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      office_location: user.office_location || "",
      max_concurrent_chats: user.max_concurrent_chats,
      can_receive_assignments: user.can_receive_assignments,
    });
    setShowForm(true);
  }

  if (loading) {
    return <div className="flex h-full items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-300 border-t-primary-700" /></div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-primary-900">Equipo</h1>
        <button type="button" onClick={() => { setEditingId(null); setForm({ name: "", email: "", role: "intake", office_location: "", max_concurrent_chats: 5, can_receive_assignments: true }); setShowForm(true); }} className="rounded-lg bg-primary-800 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          Agregar usuario
        </button>
      </div>

      {/* Stats */}
      <div className="mt-4 grid gap-3 sm:grid-cols-5">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Activos" value={stats.active} />
        <StatCard label="Disponibles" value={stats.available} />
        <StatCard label="Capacidad" value={stats.totalCapacity} />
        <StatCard label="Carga actual" value={stats.currentLoad} />
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="mt-6 rounded-xl border border-surface-border bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg text-primary-900">{editingId ? "Editar usuario" : "Nuevo usuario"}</h2>
          <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-text-secondary">Nombre</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary">Email</label>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm" disabled={!!editingId} />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary">Rol</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as TeamMemberRole })} className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm">
                {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary">Oficina</label>
              <select value={form.office_location} onChange={(e) => setForm({ ...form, office_location: e.target.value })} className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm">
                <option value="">Sin asignar</option>
                {offices.map((o) => <option key={o.slug} value={o.slug}>{o.city}, {o.stateCode}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary">Max chats simultaneos</label>
              <input type="number" min={1} value={form.max_concurrent_chats} onChange={(e) => setForm({ ...form, max_concurrent_chats: parseInt(e.target.value) || 5 })} className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm" />
            </div>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.can_receive_assignments} onChange={(e) => setForm({ ...form, can_receive_assignments: e.target.checked })} className="rounded" />
                Recibe asignaciones automaticas
              </label>
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="rounded-lg bg-primary-800 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">{editingId ? "Guardar" : "Crear"}</button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-surface-border px-4 py-2 text-sm text-text-secondary hover:bg-surface-muted">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-surface-border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-surface-border bg-surface-muted">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Nombre</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Rol</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Oficina</th>
              <th className="px-4 py-3 text-center font-medium text-text-secondary">Chats</th>
              <th className="px-4 py-3 text-center font-medium text-text-secondary">Asignados</th>
              <th className="px-4 py-3 text-center font-medium text-text-secondary">Ganados</th>
              <th className="px-4 py-3 text-center font-medium text-text-secondary">Perdidos</th>
              <th className="px-4 py-3 text-center font-medium text-text-secondary">Estado</th>
              <th className="px-4 py-3 text-right font-medium text-text-secondary">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {users.map((user) => (
              <tr key={user.id} className={`${user.is_active === false ? "opacity-50" : ""} hover:bg-surface-muted`}>
                <td className="px-4 py-3">
                  <div className="font-medium text-text-primary">{user.name}</div>
                  <div className="text-xs text-text-tertiary">{user.email}</div>
                </td>
                <td className="px-4 py-3 capitalize text-text-secondary">{user.role}</td>
                <td className="px-4 py-3 text-text-secondary">{user.office_location || "—"}</td>
                <td className="px-4 py-3 text-center text-text-secondary">{user.current_chat_count}/{user.max_concurrent_chats}</td>
                <td className="px-4 py-3 text-center text-text-secondary">{user.total_assigned}</td>
                <td className="px-4 py-3 text-center text-green-700">{user.total_closed_won}</td>
                <td className="px-4 py-3 text-center text-red-600">{user.total_closed_lost}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex h-2 w-2 rounded-full ${user.is_available && user.is_active !== false ? "bg-green-500" : "bg-gray-300"}`} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button type="button" onClick={() => toggleAvailable(user)} className="rounded px-2 py-1 text-xs text-text-secondary hover:bg-surface-muted">{user.is_available ? "Pausar" : "Activar"}</button>
                    <button type="button" onClick={() => startEdit(user)} className="rounded px-2 py-1 text-xs text-text-link hover:bg-surface-muted">Editar</button>
                    <button type="button" onClick={() => toggleActive(user)} className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50">{user.is_active === false ? "Reactivar" : "Desactivar"}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-surface-border bg-white p-3 text-center shadow-sm">
      <p className="text-xs text-text-tertiary">{label}</p>
      <p className="font-display text-xl text-primary-900">{value}</p>
    </div>
  );
}
