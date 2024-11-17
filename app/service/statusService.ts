import { getAllStatus, getStatusById } from './sqlite/tables/status'; 
import { Status } from '../types/status.interface'; // Importando a interface Status

// Função para obter todos os status
export const obterTodosStatus = async (): Promise<Status[]> => {
    try {
        const status = await getAllStatus();
        return status; // O retorno será um array de Status
    } catch (error) {
        console.error('Erro ao obter todos os status:', error);
        throw error;
    }
};

// Função para obter status por ID
export const obterStatusPorId = async (statusId: number): Promise<Status | null> => {
    try {
        const status = await getStatusById(statusId); // Usando a função getStatusById
        return status; // O retorno será do tipo Status ou null
    } catch (error) {
        console.error('Erro ao buscar status:', error);
        return null;
    }
};
