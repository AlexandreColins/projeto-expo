import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { Text, ScrollView, StyleSheet, Linking } from 'react-native';
import { Avatar, Button, Card, IconButton, Paragraph } from 'react-native-paper';
import { obterClientePorIdService } from '../service/clienteService';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const ClienteDetalhes = () => {
    const [cliente, setCliente] = useState<any>(null);
    const router = useRouter();
    const { id } = useLocalSearchParams();

    useEffect(() => {
        const fetchCliente = async () => {
            if (id) {
                const data = await obterClientePorIdService(Number(id));
                setCliente(data);
            }
        };
        fetchCliente();
    }, [id]);

    if (!cliente) {
        return <Text>Carregando...</Text>;
    }

    return (
        <ScrollView style={styles.container}>
            <Button
                mode="contained"
                onPress={() => router.push({ pathname: "/cliente/editar", params: { id } })}
                style={styles.button}
            >
                Editar Cliente
            </Button>

            <Card style={styles.card}>
                <Card.Title
                    title={"Nome: " + cliente?.nome}
                    left={(props) => <Avatar.Icon {...props} icon="mail" />}
                    // right={(props) => <IconButton {...props} icon="dots-vertical" onPress={() => { }} />}
                />
                <Card.Content>
                    <Paragraph>
                        <AntDesign name="mail" size={16} color="black" /> Email: {cliente?.email || 'Não informado'}
                    </Paragraph>
                    <Paragraph>
                        <AntDesign name="idcard" size={16} color="black" /> CPF: {cliente?.cpf_cnpj || 'Não informado'}
                    </Paragraph>
                    <Paragraph>
                        <MaterialIcons name="numbers" size={16} color="black" /> Processo: {cliente?.numero_processo || 'Não informado'}
                    </Paragraph>
                    <Paragraph>
                        <AntDesign name="link" size={16} color="black" />JusBrasil:{' '}
                        {cliente?.link_jusbrasil ? (
                            <Text
                                style={{ color: 'blue', textDecorationLine: 'underline' }}
                                onPress={() => Linking.openURL(cliente.link_jusbrasil)}
                            >
                                {cliente.link_jusbrasil}
                            </Text>
                        ) : (
                            'Não informado'
                        )}
                    </Paragraph>
                    <Paragraph>
                        <AntDesign name="info" size={16} color="black" /> Status: {cliente?.status || 'Não informado'}
                    </Paragraph>
                </Card.Content>
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    card: {
        marginBottom: 20,
        elevation: 5,
    },
    button: {
        marginBottom: 20,
    },
});

export default ClienteDetalhes;
