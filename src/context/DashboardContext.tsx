import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';

export interface AgendaItem {
  id: string;
  hora: string;
  cliente: string;
  tipo: string;
  status: 'confirmado' | 'pendente' | 'concluido';
  valor: number;
  vendedorId: string;
  data: string;
}

export interface DashboardContextType {
  agendaItems: AgendaItem[];
  allItems: AgendaItem[];
  isLoading: boolean;
  addAgendaItem: (item: Omit<AgendaItem, 'id'>) => Promise<void>;
  updateItemStatus: (id: string, status: AgendaItem['status']) => Promise<void>;
}

type DbRow = {
  id: string;
  hora: string;
  cliente: string;
  tipo: string;
  status: 'confirmado' | 'pendente' | 'concluido';
  valor: number;
  vendedor_id: string;
  data: string;
};

function rowToItem(row: DbRow): AgendaItem {
  return {
    id: row.id,
    hora: row.hora,
    cliente: row.cliente,
    tipo: row.tipo,
    status: row.status,
    valor: row.valor,
    vendedorId: row.vendedor_id,
    data: row.data,
  };
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children, userId, isFullAccess }: {
  children: React.ReactNode;
  userId: string;
  isFullAccess: boolean;
}) {
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    let query = supabase.from('agenda_items').select('*').order('data').order('hora');
    if (!isFullAccess) query = query.eq('vendedor_id', userId);
    query.then(({ data }) => {
      setItems((data ?? []).map((r) => rowToItem(r as DbRow)));
      setIsLoading(false);
    });
  }, [userId, isFullAccess]);

  const agendaItems = useMemo(() =>
    [...items].sort((a, b) =>
      a.data !== b.data ? a.data.localeCompare(b.data) : a.hora.localeCompare(b.hora)
    ), [items]);

  const addAgendaItem = useCallback(async (item: Omit<AgendaItem, 'id'>) => {
    const { data } = await supabase
      .from('agenda_items')
      .insert({
        hora: item.hora,
        cliente: item.cliente,
        tipo: item.tipo,
        status: item.status,
        valor: item.valor,
        vendedor_id: item.vendedorId,
        data: item.data,
      })
      .select()
      .single();
    if (data) setItems((prev) => [...prev, rowToItem(data as DbRow)]);
  }, []);

  const updateItemStatus = useCallback(async (id: string, status: AgendaItem['status']) => {
    const { data } = await supabase
      .from('agenda_items')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (data) setItems((prev) => prev.map((i) => i.id === id ? rowToItem(data as DbRow) : i));
  }, []);

  return (
    <DashboardContext.Provider value={{ agendaItems, allItems: agendaItems, isLoading, addAgendaItem, updateItemStatus }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard(): DashboardContextType {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard deve ser usado dentro de <DashboardProvider>');
  return ctx;
}
