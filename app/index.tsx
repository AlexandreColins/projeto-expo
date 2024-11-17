import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, View, Image } from 'react-native';
import { Button, Card, Text, useTheme, Searchbar, ActivityIndicator, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { obterTodosClientesService } from './service/clienteService'; // Atualizado
import { Cliente } from './types/cliente.interface'; // Atualizado
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const Dashboard: React.FC = () => {
    const router = useRouter();
    const theme = useTheme();

    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false); // Para mostrar carregamento durante a busca

    // Função para tentar obter os clientes com retry
    const fetchClientesWithRetry = async (attempts: number = 3) => {
        let lastError: any = null;
        for (let i = 0; i < attempts; i++) {
            try {
                const result = await obterTodosClientesService();
                console.log('Clientes carregados:', result);
                setClientes(result);
                console.log(result);

                return; // Se a query for bem-sucedida, sai da função
            } catch (error) {
                lastError = error;
                console.error(`Tentativa ${i + 1} falhou:`, error);
                if (i < attempts - 1) {
                    // Espera antes de tentar novamente
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }
        // Se todas as tentativas falharem, exibe o erro
        console.error('Erro ao buscar clientes:', lastError);
    };

    // Carregar os clientes do SQLite ao montar o componente
    useEffect(() => {
        const loadClientes = async () => {
            setLoading(true);
            await fetchClientesWithRetry(); // Tenta buscar os clientes com retry
            setLoading(false);
        };
        loadClientes();
    }, []);

    // Filtrar clientes com base na pesquisa
    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const filteredClientes = clientes.filter(cliente =>
        cliente.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cliente.cpf_cnpj.includes(searchQuery) ||
        cliente.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cliente.numero_processo.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <Button
                mode="contained"
                onPress={() => router.push('/create-cliente')}
                style={styles.button}
                labelStyle={styles.buttonText}
                icon={() => <AntDesign name="adduser" size={24} color="white" />}
            >
                Novo Cliente
            </Button>

            {/* Searchbar */}
            <Searchbar
                placeholder="Buscar cliente"
                onChangeText={handleSearch}
                value={searchQuery}
                style={styles.searchbar}
            />
        

            {loading || filteredClientes.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <Image
                        source={loading ? require('../assets/images/search.png') : require('../assets/images/notFound.png')}
                        style={styles.loadingImage}
                    />
                    <Text style={[styles.clienteNome, { fontWeight: 'bold', marginTop: 10, color: theme.colors.secondary }]}>
                        {loading ? 'Carregando dados' : 'Nenhum cliente encontrado'}
                    </Text>
                    {loading && filteredClientes.length === 0 && (
                        <ActivityIndicator size="large" style={styles.activityIndicator} />
                    )}
                </View>
            ) : (
                <FlatList
                    data={filteredClientes}
                    keyExtractor={(item) => item.id?.toString()}
                    contentContainerStyle={styles.listContainer}
                    renderItem={({ item, index }) => (
                        <Card
                            onPress={() => {
                                if (item && item.id) {
                                    router.push(`/cliente/${item.id}`);
                                } else {
                                    console.error('ID do cliente não encontrado');
                                }
                            }} // Navegação dinâmica
                            style={styles.card}
                        >
                            <Card.Content>
                                <View style={styles.chipContainer}>
                                    <Chip>{index + 1}</Chip>
                                    <Chip icon="information">
                                        {item.status || 'Status não disponível'}
                                    </Chip>
                                </View>

                                <Text style={[styles.clienteNome, { fontWeight: 'bold', color: theme.colors.primary }]}>
                                    <AntDesign name="user" size={24} color={theme.colors.primary} /> {item?.nome || 'Nome não disponível'}
                                </Text>

                                <View style={styles.infoContainer}>
                                    <Text><AntDesign name="idcard" size={16} color="black" /> CPF: {item?.cpf_cnpj || 'Não informado'}</Text>
                                    <Text><AntDesign name="mail" size={16} color="black" /> Email: {item?.email || 'Não informado'}</Text>
                                    <Text><MaterialIcons name="numbers" size={16} color="black" /> Processo: {item?.numero_processo || 'Não informado'}</Text>
                                </View>
                            </Card.Content>
                        </Card>
                    )}
                />
            )}
        </>
    );
};

const styles = StyleSheet.create({
    button: {
        margin: 16,
    },
    buttonText: {
        fontSize: 16,
    },
    searchbar: {
        marginHorizontal: 16,
        marginBottom: 10,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 32,
        height: 250, // Reduz a altura fixa do contêiner para 250
    },
    loadingImage: {
        width: '60%', // Reduz a largura da imagem para 60% do contêiner
        height: undefined, // Mantém a altura indefinida para respeitar o aspectRatio
        aspectRatio: 1, // Mantém a proporção da imagem
        resizeMode: 'contain', // Ajusta a imagem dentro do espaço sem cortar
        marginBottom: 16,
    },
    activityIndicator: {
        marginTop: 20,
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingBottom: 50,
    },
    card: {
        marginBottom: 12,
        elevation: 3,
        borderRadius: 8,
        overflow: 'hidden',
    },
    clienteNome: {
        fontSize: 18,
    },
    infoContainer: {
        marginTop: 8,
    },
    chipContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
});

export default Dashboard;
