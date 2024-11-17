import { openDatabase } from '../index';
import { Status } from '../../../types/status.interface'; // Importando a interface Status

// Função para obter todos os status
const getAllStatus = async (): Promise<Status[]> => {
    const db = openDatabase();

    try {
        const result = await db.getAllAsync('SELECT * FROM status');
        console.log('Status encontrados:', result);
        return result as Status[]; // Garantindo que o retorno seja do tipo Status[]
    } catch (error) {
        console.error('Erro ao obter todos os status:', error);
        throw error;
    }
};

// Função para obter um status por ID
const getStatusById = async (id: number): Promise<Status | null> => {
    const db = openDatabase();

    try {
        const result = await db.getFirstAsync('SELECT * FROM status WHERE id = ?', [id]);
        console.log('Status encontrado:', result);
        return result ? (result as Status) : null; // Garantindo que retorne Status ou null
    } catch (error) {
        console.error('Erro ao obter status por ID:', error);
        return null;
    }
};

export { getAllStatus, getStatusById };
