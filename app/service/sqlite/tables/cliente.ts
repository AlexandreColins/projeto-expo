import { openDatabase } from '../index'; // Importando a função para abrir o banco de dados
import { Cliente } from '../../../types/cliente.interface'; // Importando a interface Cliente
import { Status } from '../../../types/status.interface'; // Importando a interface Status

const db = openDatabase();

// Função para adicionar um cliente
export const addCliente = async (
  nome: string,
  email: string,
  cpf_cnpj: string,
  numero_processo: string,
  link_jusbrasil: string,
  status_id: number
): Promise<void> => {
  try {
    // Inserção no banco de dados
    const result = await db.runAsync(
      'INSERT INTO clientes (nome, email, cpf_cnpj, numero_processo, link_jusbrasil, status_id) VALUES (?, ?, ?, ?, ?, ?)',
      [nome, email, cpf_cnpj, numero_processo, link_jusbrasil, status_id]
    );

    if (result.changes > 0) {
      console.log('Cliente adicionado com sucesso!', result.lastInsertRowId, result.changes);
    } else {
      console.log('Nenhuma alteração foi feita.');
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Erro ao adicionar cliente:', error.message);
    } else {
      console.error('Erro desconhecido ao adicionar cliente:', error);
    }
  }
};


// Função para listar todos os clientes
// Função para listar todos os clientes
export const getClientes = async (): Promise<Cliente[]> => {
  try {
    const result: Cliente[] = await db.getAllAsync('SELECT * FROM clientes');
    return result;
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    throw error;
  }
};


// Função para obter um cliente específico pelo ID
// Função para obter um cliente específico pelo ID
export const getClienteById = async (id: number): Promise<Cliente | null> => {
  try {
    const cliente: Cliente | null = await db.getFirstAsync('SELECT * FROM clientes WHERE id = ?', id);
    return cliente || null;
  } catch (error) {
    console.log('Erro ao buscar cliente: ', error);
    return null;
  }
};


// Função para atualizar um cliente
export const updateCliente = async (
  id: number,
  nome: string,
  email: string,
  cpf_cnpj: string,
  numero_processo: string,
  link_jusbrasil: string,
  status: string
): Promise<void> => {
  try {
    const result = await db.runAsync(
      'UPDATE clientes SET nome = ?, email = ?, cpf_cnpj = ?, numero_processo = ?, link_jusbrasil = ?, status = ? WHERE id = ?',
      [nome, email, cpf_cnpj, numero_processo, link_jusbrasil, status, id]
    );
    if (result.changes > 0) {
      console.log('Cliente atualizado com sucesso!', result.changes);
    } else {
      console.log('Nenhuma alteração foi feita no cliente.');
    }
  } catch (error) {
    console.log('Erro ao atualizar cliente: ', error);
  }
};

// Função para deletar um cliente
export const deleteCliente = async (id: number): Promise<void> => {
  try {
    const result = await db.runAsync('DELETE FROM clientes WHERE id = ?', id);
    if (result.changes > 0) {
      console.log('Cliente excluído com sucesso!', result.changes);
    } else {
      console.log('Cliente não encontrado para exclusão.');
    }
  } catch (error) {
    console.log('Erro ao excluir cliente: ', error);
  }
};
