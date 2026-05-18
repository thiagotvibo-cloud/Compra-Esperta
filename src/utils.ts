import { Unit } from './types';

export const formatMoney = (val: number) => {
  if (isNaN(val)) return 'R$ 0,00';
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const formatItemName = (name: string) => {
  return name.replace(/\//g, '/\u200B').replace(/-/g, '-\u200B');
};

// Remove acentos e deixa minúsculo para busca/matching eficiente
export const normalizeStr = (str: string) =>
  str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

// Converte unidades de base para facilitar a comparação (g -> kg, ml -> L)
export const convertToBaseUnit = (qty: number, unit: Unit): { qty: number, unit: string } => {
  if (unit === 'g') return { qty: qty / 1000, unit: 'kg' };
  if (unit === 'ml') return { qty: qty / 1000, unit: 'L' };
  return { qty, unit };
};

// Ex: Encontra quanto custa 1 kg sabendo que 300g custam R$ 5,00
export const getPricePerBaseUnit = (price: number, qty: number, unit: Unit) => {
  const base = convertToBaseUnit(qty, unit);
  if (base.qty === 0) return 0;
  return price / base.qty;
};

// Gera ID único
export const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
