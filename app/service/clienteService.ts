import { addCliente, getClientes, getClienteById, updateCliente, deleteCliente } from '../service/sqlite/tables/cliente';  // Importando as funções do arquivo de tabelas
import { Cliente } from '../types/cliente.interface';  // Importando a interface Cliente
// import { Status } from '../types/status.interface';  // Importando a interface Status
import { obterStatusPorId } from './statusService';  // Importando o serviço para obter o status pelo ID

// Serviço para criar um cliente
export const criarClienteService = async (cliente: Cliente): Promise<void> => {
  try {
    // Chamando a função addCliente para adicionar o cliente ao banco de dados
    await addCliente(
      cliente.nome,
      cliente.email,
      cliente.cpf_cnpj,
      cliente.numero_processo,
      cliente.link_jusbrasil,
      cliente.status_id
    );
    console.log('Cliente criado com sucesso');
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    throw error;
  }
};

// Serviço para obter todos os clientes com o status
export const obterTodosClientesService = async (): Promise<(Cliente & { status: string })[]> => {
  try {
    // Buscando todos os clientes
    const clientes = await getClientes();
    // Obtendo o status de cada cliente e retornando a lista com status
    const clientesComStatus = await Promise.all(
      clientes.map(async (cliente) => {
        const status = await obterStatusPorId(cliente.status_id);
        return { ...cliente, status: status?.descricao || 'Desconhecido' };
      })
    );
    return clientesComStatus;
  } catch (error) {
    console.error('Erro ao obter todos os clientes:', error);
    throw error;
  }
};

// Serviço para obter um cliente específico com seu status
export const obterClientePorIdService = async (id: number): Promise<(Cliente & { status: string }) | null> => {
  try {
    // Buscando o cliente pelo ID
    const cliente = await getClienteById(id);
    if (cliente) {
      // Obtendo o status do cliente
      const status = await obterStatusPorId(cliente.status_id);
      return { ...cliente, status: status?.descricao || 'Desconhecido' };
    }
    return null;
  } catch (error) {
    console.error('Erro ao obter cliente por ID:', error);
    throw error;
  }
};

// Serviço para atualizar um cliente
export const atualizarClienteService = async (id: number, clienteAtualizado: Partial<Cliente>): Promise<void> => {
  try {
    const {
      nome,
      email,
      cpf_cnpj,
      numero_processo,
      link_jusbrasil,
      status_id,
    } = clienteAtualizado;
    // Atualizando os dados do cliente no banco
    await updateCliente(
      id,
      nome || '',
      email || '',
      cpf_cnpj || '',
      numero_processo || '',
      link_jusbrasil || '',
      status_id ? String(status_id) : ''
    );
    console.log('Cliente atualizado com sucesso');
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    throw error;
  }
};

// Serviço para excluir um cliente
export const excluirClienteService = async (id: number): Promise<void> => {
  try {
    // Deletando o cliente pelo ID
    await deleteCliente(id);
    console.log('Cliente excluído com sucesso');
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    throw error;
  }
};
