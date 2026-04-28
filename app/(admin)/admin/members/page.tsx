'use client';

import { useCallback, useEffect, useState } from 'react';
import { Icon } from '@iconify/react';

type Role = 'USER' | 'SUPPORT' | 'EDITOR' | 'ADMIN';

interface Member {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

const ROLE_OPTIONS: Role[] = ['USER', 'SUPPORT', 'EDITOR', 'ADMIN'];

const ROLE_COLOR: Record<Role, string> = {
  ADMIN: 'text-red-400 bg-red-500/10',
  EDITOR: 'text-yellow-400 bg-yellow-500/10',
  SUPPORT: 'text-blue-400 bg-blue-500/10',
  USER: 'text-slate-400 bg-slate-800',
};

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Member | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Member | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const LIMIT = 20;

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 400);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(LIMIT),
      ...(debouncedQ ? { q: debouncedQ } : {}),
    });
    const res = await fetch(`/api/admin/members?${params}`);
    const data = await res.json();
    setMembers(data.users ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, debouncedQ]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    await fetch('/api/admin/members', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editing.id, role: editing.role, isActive: editing.isActive }),
    });
    setSaving(false);
    setEditing(null);
    load();
  };

  const handleDeleteOpen = (m: Member) => {
    setDeleting(m);
    setDeleteReason('');
    setDeleteConfirm('');
  };

  const handleDeleteConfirm = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    const params = new URLSearchParams({ id: deleting.id });
    if (deleteReason.trim()) params.set('reason', deleteReason.trim());
    await fetch(`/api/admin/members?${params}`, { method: 'DELETE' });
    setDeleteLoading(false);
    setDeleting(null);
    load();
  };

  const totalPages = Math.ceil(total / LIMIT);
  const deleteReady = deleteConfirm === deleting?.email;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Manrope',sans-serif] text-2xl font-bold text-white">會員管理</h1>
          <p className="mt-1 text-sm text-slate-400">共 {total.toLocaleString()} 位會員</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Icon
          icon="mdi:magnify"
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-slate-500"
        />
        <input
          type="text"
          placeholder="搜尋姓名或 Email..."
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          className="w-full rounded-xl bg-slate-900/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4648d4]/50"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-slate-900/60">
        {loading ? (
          <div className="space-y-3 p-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-800/50" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Icon icon="mdi:account-search-outline" className="mx-auto mb-3 text-4xl" />
            <p>找不到會員</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800/60">
                <th className="px-6 py-3 text-left font-medium text-slate-500">會員</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">角色</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">狀態</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">加入日期</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {members.map((m) => (
                <tr key={m.id} className="transition-colors hover:bg-slate-800/30">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-700">
                        <span className="text-xs font-medium text-slate-300">
                          {(m.name ?? m.email ?? '?')[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">{m.name ?? '未命名'}</p>
                        <p className="truncate text-xs text-slate-500">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLOR[m.role]}`}
                    >
                      {m.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        m.isActive
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {m.isActive ? '啟用' : '停用'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {new Date(m.createdAt).toLocaleDateString('zh-TW')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditing({ ...m })}
                        className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-700 hover:text-white"
                        title="編輯"
                      >
                        <Icon icon="mdi:pencil-outline" className="text-base" />
                      </button>
                      <button
                        onClick={() => handleDeleteOpen(m)}
                        className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                        title="刪除"
                      >
                        <Icon icon="mdi:trash-can-outline" className="text-base" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white disabled:pointer-events-none disabled:opacity-30"
          >
            <Icon icon="mdi:chevron-left" />
          </button>
          <span className="text-sm text-slate-400">
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white disabled:pointer-events-none disabled:opacity-30"
          >
            <Icon icon="mdi:chevron-right" />
          </button>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setEditing(null)}
          />
          <div className="relative w-full max-w-sm space-y-5 rounded-2xl bg-slate-900/90 p-6 shadow-2xl backdrop-blur-[12px]">
            <div className="flex items-center justify-between">
              <h2 className="font-['Manrope',sans-serif] font-semibold text-white">編輯會員</h2>
              <button
                onClick={() => setEditing(null)}
                className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-700 hover:text-white"
              >
                <Icon icon="mdi:close" />
              </button>
            </div>

            <div className="space-y-1">
              <p className="font-medium text-white">{editing.name ?? '未命名'}</p>
              <p className="text-sm text-slate-400">{editing.email}</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs text-slate-400">角色</label>
                <select
                  value={editing.role}
                  onChange={(e) => setEditing({ ...editing, role: e.target.value as Role })}
                  className="w-full rounded-xl bg-slate-800 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#4648d4]/50"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Toggle switch — isActive */}
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm text-slate-300">啟用帳號</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {editing.isActive ? '帳號正常使用中' : '帳號已停用，無法登入'}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={editing.isActive}
                  onClick={() => setEditing({ ...editing, isActive: !editing.isActive })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4648d4] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                    editing.isActive ? 'bg-[#4648d4]' : 'bg-slate-600'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      editing.isActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full rounded-xl bg-gradient-to-r from-[#4648d4] to-[#6063ee] py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
            >
              {saving ? '儲存中…' : '儲存變更'}
            </button>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setDeleting(null)}
          />
          <div className="relative w-full max-w-md space-y-5 rounded-2xl border border-red-500/20 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-[12px]">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-500/10">
                <Icon icon="mdi:alert-outline" className="text-xl text-red-400" />
              </div>
              <div>
                <h2 className="font-['Manrope',sans-serif] font-semibold text-white">刪除會員</h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  此操作無法復原，所有相關資料將一併移除
                </p>
              </div>
              <button
                onClick={() => setDeleting(null)}
                className="ml-auto rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-700 hover:text-white"
              >
                <Icon icon="mdi:close" />
              </button>
            </div>

            {/* Target user info */}
            <div className="space-y-1 rounded-xl bg-slate-800/60 p-4">
              <p className="text-sm font-medium text-white">{deleting.name ?? '未命名'}</p>
              <p className="text-xs text-slate-400">{deleting.email}</p>
              <span
                className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLOR[deleting.role]}`}
              >
                {deleting.role}
              </span>
            </div>

            {/* Reason (optional) */}
            <div>
              <label className="mb-1.5 block text-xs text-slate-400">刪除原因（選填）</label>
              <input
                type="text"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="例：違反使用條款、本人申請…"
                className="w-full rounded-xl bg-slate-800 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/40"
              />
            </div>

            {/* Email confirmation */}
            <div>
              <label className="mb-1.5 block text-xs text-slate-400">
                請輸入 <span className="font-medium text-white">{deleting.email}</span> 以確認刪除
              </label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="輸入 Email 確認..."
                className="w-full rounded-xl bg-slate-800 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/40"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleting(null)}
                className="flex-1 rounded-xl bg-slate-800 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700"
              >
                取消
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={!deleteReady || deleteLoading}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {deleteLoading ? '刪除中…' : '確認刪除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
