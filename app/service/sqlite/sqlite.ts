// import * as SQLite from 'expo-sqlite';

// // Definição da interface Cliente
// interface Cliente {
//     id: string;
//     nome: string;
//     email: string;
//     cpf: string;
//     numero_processo: string;
//     link_jusbrasil: string;
//     status: string;
// }

// // Função para abrir o banco de dados
// const openDatabase = async () => {
//     return await SQLite.openDatabaseAsync('clientes.db');
// };

// // Função para verificar a existência da tabela
// const verifyTableExists = async () => {
//     const db = await openDatabase();
//     try {
//         const result = await db.getAllSync('SELECT name FROM sqlite_master WHERE type="table" AND name="clientes"');
//         return result.length > 0;
//     } catch (error) {
//         console.log('Erro ao verificar a tabela: ', error);
//         return false;
//     }
// };

// // Função para verificar os campos da tabela 'clientes'
// const verifyTableStructure = async () => {
//     const db = await openDatabase();
//     try {
//         const result = await db.getAllAsync('PRAGMA table_info(clientes)');
//         console.log('Estrutura da tabela:', result);  // Adicionei esse log para ajudar a depurar
//         const columns = result.map((column: any) => column.name);
//         const requiredColumns = ['id', 'nome', 'email', 'cpf', 'numero_processo', 'link_jusbrasil', 'status'];

//         // Verifica se todos os campos necessários existem
//         const missingColumns = requiredColumns.filter(col => !columns.includes(col));
//         return missingColumns;
//     } catch (error) {
//         console.log('Erro ao verificar estrutura da tabela: ', error);
//         return [];
//     }
// };


// // Função para recriar a tabela se faltar algum campo
// const recreateTableIfNeeded = async () => {
//     const db = await openDatabase();

//     // Verifique a existência da tabela
//     const tableExists = await verifyTableExists();
//     if (tableExists) {
//         // Verifique se faltam campos na tabela
//         const missingColumns = await verifyTableStructure();
//         if (missingColumns.length > 0) {
//             console.log('Campos ausentes detectados:', missingColumns);
//             console.log('Recriando a tabela...');
//             await dropTable();
//             await createTable();
//         } else {
//             console.log('A tabela "clientes" está com a estrutura correta.');
//         }
//     } else {
//         console.log('Tabela "clientes" não existe. Criando a tabela...');
//         await createTable();
//     }
// };


// recreateTableIfNeeded();

// // Função para apagar a tabela
// const dropTable = async () => {
//     const db = await openDatabase();
//     try {
//         await db.execAsync('DROP TABLE IF EXISTS clientes');
//         console.log('Tabela "clientes" apagada com sucesso.');
//     } catch (error) {
//         console.log('Erro ao apagar a tabela: ', error);
//     }
// };

// // dropTable();

// // Função para criar a tabela 'clientes'
// const createTable = async () => {
//     const db = await openDatabase();

//     try {
//         await db.execAsync(`
//             PRAGMA journal_mode = WAL;
//             CREATE TABLE IF NOT EXISTS clientes (
//                 id INTEGER PRIMARY KEY AUTOINCREMENT,
//                 nome TEXT NOT NULL,
//                 email TEXT NOT NULL,
//                 cpf TEXT NOT NULL,
//                 numero_processo TEXT NOT NULL,
//                 link_jusbrasil TEXT NOT NULL,
//                 status TEXT NOT NULL
//             );
//         `);
//         console.log('Tabela "clientes" criada com sucesso!');
//     } catch (error) {
//         console.log('Erro ao criar tabela: ', error);
//     }
// };

// // Função para adicionar um cliente
// const addCliente = async (nome: string, email: string, cpf: string, numero_processo: string, link_jusbrasil: string, status: string) => {
//     const db = await openDatabase();
//     try {
//         const result = await db.runAsync(
//             'INSERT INTO clientes (nome, email, cpf, numero_processo, link_jusbrasil, status) VALUES (?, ?, ?, ?, ?, ?)',
//             nome, email, cpf, numero_processo, link_jusbrasil, status
//         );
//         console.log('Cliente adicionado com sucesso!', result.lastInsertRowId, result.changes);
//     } catch (error) {
//         console.log('Erro ao adicionar cliente: ', error);
//     }
// };

// // Função para buscar todos os clientes
// const getClientes = async (): Promise<Cliente[]> => {
//     const db = await openDatabase();
//     try {
//         const clientes = await db.getAllAsync('SELECT * FROM clientes');
//         console.log('Clientes encontrados:', clientes);
//         return clientes as Cliente[];
//     } catch (error) {
//         console.log('Erro ao buscar clientes: ', error);
//         return [];
//     }
// };

// // Função para buscar um cliente pelo ID
// const getClienteById = async (id: number): Promise<Cliente | null> => {
//     const db = await openDatabase();
//     try {
//         const cliente = await db.getFirstAsync('SELECT * FROM clientes WHERE id = ?', id);
//         return cliente ? cliente as Cliente : null;
//     } catch (error) {
//         console.log('Erro ao buscar cliente: ', error);
//         return null;
//     }
// };

// // Função para atualizar um cliente
// const updateCliente = async (id: number, nome: string, email: string, cpf: string, numero_processo: string, link_jusbrasil: string, status: string) => {
//     const db = await openDatabase();
//     try {
//         const result = await db.runAsync(
//             'UPDATE clientes SET nome = ?, email = ?, cpf = ?, numero_processo = ?, link_jusbrasil = ?, status = ? WHERE id = ?',
//             nome, email, cpf, numero_processo, link_jusbrasil, status, id
//         );
//         console.log('Cliente atualizado com sucesso!', result.changes);
//     } catch (error) {
//         console.log('Erro ao atualizar cliente: ', error);
//     }
// };

// // Função para excluir um cliente
// const deleteCliente = async (id: number) => {
//     const db = await openDatabase();
//     try {
//         const result = await db.runAsync('DELETE FROM clientes WHERE id = ?', id);
//         console.log('Cliente excluído com sucesso!', result.changes);
//     } catch (error) {
//         console.log('Erro ao excluir cliente: ', error);
//     }
// };



// export { createTable, addCliente, getClientes, getClienteById, updateCliente, deleteCliente, openDatabase, recreateTableIfNeeded };
