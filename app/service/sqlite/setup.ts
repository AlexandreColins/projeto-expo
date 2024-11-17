import { openDatabase } from './index'; // Supondo que 'openDatabase' seja uma função que retorna a conexão com o banco

// Definição de tipo para as colunas retornadas do PRAGMA table_info
interface TableColumn {
    cid: number;
    name: string;
    type: string;
    notnull: number;
    dflt_value: string | null;
    pk: number;
}

// Função para verificar a existência da tabela
const verifyTableExists = async (tableName: string): Promise<boolean> => {
    const db = await openDatabase();
    try {
        const result = await db.getAllSync('SELECT name FROM sqlite_master WHERE type="table" AND name=?', [tableName]);
        return result.length > 0;
    } catch (error) {
        console.log(`Erro ao verificar a tabela ${tableName}:`, error);
        return false;
    }
};

// Função para verificar a estrutura da tabela
const verifyTableStructure = async (tableName: string, requiredColumns: string[]): Promise<string[]> => {
    const db = await openDatabase();
    try {
        const result: TableColumn[] = await db.getAllAsync(`PRAGMA table_info(${tableName})`);
        console.log(`Estrutura da tabela ${tableName}:`, result);
        
        // Extraímos os nomes das colunas
        const columns = result.map((column) => column.name);
        const missingColumns = requiredColumns.filter(col => !columns.includes(col));
        return missingColumns;
    } catch (error) {
        console.log(`Erro ao verificar estrutura da tabela ${tableName}:`, error);
        return [];
    }
};

// Função para recriar a tabela se faltar algum campo
const recreateTableIfNeeded = async (tableName: string, createTableFn: Function, requiredColumns: string[]): Promise<void> => {
    const db = await openDatabase();

    // Verifique a existência da tabela
    const tableExists = await verifyTableExists(tableName);
    if (tableExists) {
        // Verifique se faltam campos na tabela
        const missingColumns = await verifyTableStructure(tableName, requiredColumns);
        if (missingColumns.length > 0) {
            console.log(`Campos ausentes detectados na tabela ${tableName}:`, missingColumns);
            console.log(`Recriando a tabela ${tableName}...`);
            await dropTable(tableName);
            await createTableFn();  // Criação da tabela, dependendo da função específica
        } else {
            console.log(`A tabela ${tableName} está com a estrutura correta.`);
        }
    } else {
        console.log(`Tabela ${tableName} não existe. Criando a tabela...`);
        await createTableFn();
    }
};

// Função para apagar a tabela
const dropTable = async (tableName: string): Promise<void> => {
    const db = await openDatabase();
    try {
        await db.execAsync(`DROP TABLE IF EXISTS ${tableName}`);
        console.log(`Tabela ${tableName} apagada com sucesso.`);
    } catch (error) {
        console.log(`Erro ao apagar a tabela ${tableName}:`, error);
    }
};

// Função de criação da tabela `status`
const createStatusTable = async (): Promise<void> => {
    const db = await openDatabase();
    try {
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS status (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                descricao TEXT NOT NULL CHECK(LENGTH(descricao) <= 255)
            );
        `);
        console.log('Tabela "status" criada ou já existente.');
    } catch (error) {
        console.error('Erro ao criar tabela status:', error);
    }
};

// Função de criação da tabela `clientes`
const createClientesTable = async (): Promise<void> => {
    const db = await openDatabase();
    try {
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS clientes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL CHECK(LENGTH(nome) <= 255),
                email TEXT NOT NULL CHECK(LENGTH(email) <= 255),
                cpf_cnpj TEXT NOT NULL CHECK(LENGTH(cpf_cnpj) <= 18),
                numero_processo TEXT NOT NULL CHECK(LENGTH(numero_processo) <= 50),
                link_jusbrasil TEXT,
                status_id INTEGER NOT NULL,
                FOREIGN KEY (status_id) REFERENCES status(id)
            );
        `);
        console.log('Tabela "clientes" criada ou já existente.');
    } catch (error) {
        console.error('Erro ao criar tabela clientes:', error);
    }
};

const inserirStatusPadrao = async () => {
    const db = await openDatabase();

    const status = [
        { descricao: 'Novo' },
        { descricao: 'Em andamento' },
        { descricao: 'Finalizado' },
        { descricao: 'Aguardando pagamento' },
        { descricao: 'Em recurso' },
        { descricao: 'Deferido' },
        { descricao: 'Suspenso' },
        { descricao: 'Concluído' },
        { descricao: 'Arquivado' },
        { descricao: 'Cancelado por desistência' },
    ];

    try {
        for (const item of status) {
            // Verificar se o status já existe antes de inserir
            const result = await db.getFirstAsync('SELECT id FROM status WHERE descricao = ?', [item.descricao]);
            if (!result) {
                // Inserir apenas se o status não existir
                await db.runAsync('INSERT INTO status (descricao) VALUES (?)', [item.descricao]);
                console.log(`Status "${item.descricao}" inserido com sucesso.`);
            } else {
                console.log(`Status "${item.descricao}" já existe.`);
            }
        }
    } catch (error) {
        console.error('Erro ao inserir status padrão: ', error);
    }
};

export const initializeDatabase = async (): Promise<void> => {
    const requiredStatusColumns: string[] = ['id', 'descricao'];
    const requiredClientesColumns: string[] = ['id', 'nome', 'email', 'cpf_cnpj', 'numero_processo', 'link_jusbrasil', 'status_id'];

    // Verificar a tabela e estrutura do `status`
    await recreateTableIfNeeded('status', createStatusTable, requiredStatusColumns);

    // Verificar a tabela e estrutura do `clientes`
    await recreateTableIfNeeded('clientes', createClientesTable, requiredClientesColumns);

    // Inserir os status padrão caso não existam
    await inserirStatusPadrao();

    // dropTablesIfNeed();
};

const dropTablesIfNeed = async (): Promise<void> => {
    const db = await openDatabase();
    try {
        // Apagar a tabela 'status'
        await db.execAsync('DROP TABLE IF EXISTS status');
        console.log('Tabela "status" apagada com sucesso.');

        // Apagar a tabela 'clientes'
        await db.execAsync('DROP TABLE IF EXISTS clientes');
        console.log('Tabela "clientes" apagada com sucesso.');
    } catch (error) {
        console.error('Erro ao apagar as tabelas:', error);
    }
};
