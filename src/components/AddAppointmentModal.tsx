import { useState, useEffect } from 'react';
import type { AgendaItem } from '../context/DashboardContext';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../context/DashboardContext';
import { supabase } from '../lib/supabase';

// ============================================================
// Modal de Registro de Atendimento / Visita
// ============================================================

const TIPOS_PRODUTO = [
  'Pão Francês Congelado',
  'Pão de Forma Premium',
  'Croissant Premium',
  'Baguete Artesanal',
  'Ciabatta Especial',
  'Pão de Queijo CG',
  'Mix Pães Especiais',
  'Kit Café da Manhã',
  'Focaccia Especial',
  'Outro',
];

interface AddAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type VendorOption = { id: string; name: string; role: string };

export default function AddAppointmentModal({ isOpen, onClose }: AddAppointmentModalProps) {
  const { currentUser } = useAuth();
  const { addAgendaItem } = useDashboard();
  const [vendors, setVendors] = useState<VendorOption[]>([]);

  useEffect(() => {
    if (currentUser?.role === 'GERENTE' || currentUser?.role === 'SUPERVISOR') {
      supabase
        .from('users_profile')
        .select('id, name, role')
        .then(({ data }) => setVendors((data ?? []) as VendorOption[]));
    }
  }, [currentUser?.role]);

  const today = new Date().toISOString().split('T')[0];
  const nowTime = new Date().toTimeString().slice(0, 5);

  const [form, setForm] = useState({
    cliente: '',
    tipo: TIPOS_PRODUTO[0],
    hora: nowTime,
    data: today,
    valor: '',
    status: 'confirmado' as AgendaItem['status'],
    vendedorId: currentUser?.id || '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.cliente.trim()) errs.cliente = 'Nome do cliente obrigatório';
    if (!form.hora) errs.hora = 'Horário obrigatório';
    if (!form.data) errs.data = 'Data obrigatória';
    if (!form.valor || isNaN(Number(form.valor.replace(',', '.'))) || Number(form.valor.replace(',', '.')) <= 0)
      errs.valor = 'Valor deve ser maior que zero';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    await addAgendaItem({
      cliente: form.cliente.trim(),
      tipo: form.tipo,
      hora: form.hora,
      data: form.data,
      status: form.status,
      valor: Number(form.valor.replace(',', '.')),
      vendedorId: form.vendedorId,
    });
    setSaving(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setForm({ cliente: '', tipo: TIPOS_PRODUTO[0], hora: nowTime, data: today, valor: '', status: 'confirmado', vendedorId: currentUser?.id || '' });
      setErrors({});
      onClose();
    }, 1200);
  };

  const field = (label: string, key: keyof typeof form, type = 'text', children?: React.ReactNode) => (
    <div>
      <label className="block text-xs font-semibold text-ice-600 mb-1.5 tracking-wide uppercase">{label}</label>
      {children ?? (
        <input
          type={type}
          value={form[key] as string}
          onChange={(e) => { setForm({ ...form, [key]: e.target.value }); setErrors({ ...errors, [key]: '' }); }}
          className={`w-full px-3 py-2.5 text-sm rounded-xl border bg-white text-ice-900 transition-all
            focus:outline-none focus:ring-2 focus:ring-wine-400 focus:border-transparent
            ${errors[key] ? 'border-red-400 bg-red-50' : 'border-ice-200 hover:border-wine-300'}`}
        />
      )}
      {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-wine-950/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl shadow-wine-950/20 overflow-hidden animate-[modalIn_0.25s_ease]">
        {/* Header do modal */}
        <div className="bg-gradient-to-r from-wine-900 to-wine-700 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-display font-bold text-white">Registrar Atendimento</h2>
            <p className="text-xs text-wine-300 mt-0.5">Preencha os dados da visita ou pedido</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-wine-800/50 hover:bg-wine-700 flex items-center justify-center text-wine-300 hover:text-white transition-all"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {field('Cliente / Estabelecimento', 'cliente')}

          <div className="grid grid-cols-2 gap-4">
            {field('Data', 'data', 'date')}
            {field('Horário', 'hora', 'time')}
          </div>

          {/* Tipo de produto */}
          <div>
            <label className="block text-xs font-semibold text-ice-600 mb-1.5 tracking-wide uppercase">Produto</label>
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-ice-200 hover:border-wine-300 bg-white text-ice-900 focus:outline-none focus:ring-2 focus:ring-wine-400 transition-all cursor-pointer"
            >
              {TIPOS_PRODUTO.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Valor */}
            <div>
              <label className="block text-xs font-semibold text-ice-600 mb-1.5 tracking-wide uppercase">Valor (R$)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-ice-400">R$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={form.valor}
                  onChange={(e) => { setForm({ ...form, valor: e.target.value }); setErrors({ ...errors, valor: '' }); }}
                  className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border bg-white text-ice-900 transition-all
                    focus:outline-none focus:ring-2 focus:ring-wine-400 focus:border-transparent
                    ${errors.valor ? 'border-red-400 bg-red-50' : 'border-ice-200 hover:border-wine-300'}`}
                />
              </div>
              {errors.valor && <p className="text-xs text-red-500 mt-1">{errors.valor}</p>}
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-ice-600 mb-1.5 tracking-wide uppercase">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as AgendaItem['status'] })}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-ice-200 hover:border-wine-300 bg-white text-ice-900 focus:outline-none focus:ring-2 focus:ring-wine-400 transition-all cursor-pointer"
              >
                <option value="confirmado">✅ Confirmado</option>
                <option value="pendente">⏳ Pendente</option>
                <option value="concluido">🎯 Concluído</option>
              </select>
            </div>
          </div>

          {/* Vendedor (só gerente/supervisor vê) */}
          {(currentUser?.role === 'GERENTE' || currentUser?.role === 'SUPERVISOR') && (
            <div>
              <label className="block text-xs font-semibold text-ice-600 mb-1.5 tracking-wide uppercase">Atribuir a</label>
              <select
                value={form.vendedorId}
                onChange={(e) => setForm({ ...form, vendedorId: e.target.value })}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-ice-200 hover:border-wine-300 bg-white text-ice-900 focus:outline-none focus:ring-2 focus:ring-wine-400 transition-all cursor-pointer"
              >
                {vendors.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
          )}

          {/* Botão */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-ice-200 text-sm font-semibold text-ice-600 hover:bg-ice-50 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || success}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2
                ${success
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gradient-to-r from-wine-800 to-wine-600 hover:from-wine-700 hover:to-wine-500 text-white shadow-lg shadow-wine-900/30 hover:shadow-wine-800/40 hover:-translate-y-0.5'
                }`}
            >
              {saving ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Salvando...</>
              ) : success ? (
                <>✓ Registrado!</>
              ) : (
                <>💾 Salvar Registro</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
