
export interface Pessoa {
  id: string;
  nome: string;
  gestor: string | null;
  cargo: string;
  empresa: string;
  time: string;
  children: Pessoa[];
}
