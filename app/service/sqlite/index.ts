import * as SQLite from 'expo-sqlite';

// Função para abrir ou inicializar o banco de dados
export const openDatabase = () => {
    return SQLite.openDatabaseSync('app.db'); // Nome do arquivo do banco
};

// Exporta funções úteis ou inicializações globais
export * from './setup'; // Configurações iniciais do banco (criação de tabelas)
