// app/criar-cliente.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { TextInput, Button, RadioButton } from 'react-native-paper';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { cpf, cnpj } from 'cpf-cnpj-validator';
import { useRouter } from 'expo-router'; // Para navegação
import { useSnackbar } from './context/SnackbarContext'; // Importe o hook para usar a snackbar
import { criarClienteService } from './service/clienteService'; // Importe a função addCliente

// Função para adicionar máscara ao CPF
const formatCPF = (cpf: string) => {
    return cpf
        .replace(/\D/g, '') // Remove todos os caracteres não numéricos
        .replace(/(\d{3})(\d)/, '$1.$2') // Adiciona ponto
        .replace(/(\d{3})(\d)/, '$1.$2') // Adiciona ponto
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2'); // Adiciona traço
};

// Função para adicionar máscara ao CNPJ
const formatCNPJ = (cnpj: string) => {
    return cnpj
        .replace(/\D/g, '') // Remove todos os caracteres não numéricos
        .replace(/(\d{2})(\d)/, '$1.$2') // Adiciona ponto
        .replace(/(\d{3})(\d)/, '$1.$2') // Adiciona ponto
        .replace(/(\d{3})(\d{1,2})$/, '$1/$2'); // Adiciona barra
};

interface FormData {
    nome: string;
    email: string;
    cpf: string;
    cnpj: string;
    numero_processo?: string;
    link_jusbrasil?: string;
    tipoCliente: string; // 'pf' ou 'pj'
}

const CreateCliente: React.FC = () => {
    const { control, handleSubmit, formState: { errors } } = useForm<FormData>();
    const [tipoCliente, setTipoCliente] = React.useState('pf');
    const [loading, setLoading] = useState(false); // Adicionando o estado de carregamento
    const router = useRouter(); // Hook do Expo Router para navegação
    const { showSnackbar } = useSnackbar(); // Usando o hook para consumir o contexto da snackbar

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        setLoading(true); // Inicia o carregamento
        try {
            // Chama a função addCliente para inserir o cliente no banco de dados SQLite
            await criarClienteService({
                nome: data.nome,
                email: data.email,
                cpf_cnpj: tipoCliente === 'pf' ? data.cpf : data.cnpj,
                numero_processo: data.numero_processo || '',
                link_jusbrasil: data.link_jusbrasil || '',
                status_id: 1,
            });            

            // Exibe a mensagem de sucesso no Snackbar
            showSnackbar('Cliente cadastrado com sucesso');

            router.push('/'); // Navega de volta para o dashboard

        } catch (error) {
            console.error('Erro ao salvar cliente', error);
            showSnackbar('Erro ao salvar cliente');
        } finally {
            setLoading(false); // Finaliza o carregamento
        }
    };

    return (
        <View style={styles.container}>
            {/* Mostra o ActivityIndicator durante o carregamento */}
            {loading ? (
                <ActivityIndicator size="large" color="#000" />
            ) : (
                <>
                    {/* Tipo de Cliente */}
                    <Text style={styles.label}>Tipo de Cliente</Text>
                    <RadioButton.Group
                        onValueChange={value => setTipoCliente(value)}
                        value={tipoCliente}
                    >
                        <View style={styles.radioButtonContainer}>
                            <RadioButton.Item label="Pessoa Física" value="pf" />
                            <RadioButton.Item label="Pessoa Jurídica" value="pj" />
                        </View>
                    </RadioButton.Group>

                    {/* Nome */}
                    <Controller
                        name="nome"
                        control={control}
                        defaultValue=""
                        rules={{ required: 'Nome é obrigatório' }}
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                label="Nome"
                                value={value}
                                onChangeText={onChange}
                                style={styles.input}
                                error={!!errors.nome}
                            />
                        )}
                    />
                    {errors.nome && <Text style={styles.error}>{errors.nome.message}</Text>}

                    {/* Email */}
                    <Controller
                        name="email"
                        control={control}
                        defaultValue=""
                        rules={{
                            required: 'Email é obrigatório',
                            pattern: { value: /\S+@\S+\.\S+/, message: 'Email inválido' }
                        }}
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                label="Email"
                                value={value}
                                onChangeText={onChange}
                                style={styles.input}
                                error={!!errors.email}
                            />
                        )}
                    />
                    {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

                    {/* CPF ou CNPJ */}
                    {tipoCliente === 'pf' ? (
                        <Controller
                            name="cpf"
                            control={control}
                            defaultValue=""
                            rules={{
                                required: 'CPF é obrigatório',
                                validate: (value) => cpf.isValid(value.replace(/\D/g, '')) || 'CPF inválido',
                                maxLength: { value: 11, message: 'CPF deve ter 11 dígitos' }
                            }}
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    label="CPF"
                                    value={formatCPF(value)}
                                    onChangeText={text => {
                                        const cleanedText = text.replace(/\D/g, ''); // Limpa a string
                                        if (cleanedText.length <= 11) { // Limita a quantidade de caracteres
                                            onChange(cleanedText);
                                        }
                                    }}
                                    style={styles.input}
                                    keyboardType="numeric"
                                    error={!!errors.cpf}
                                />
                            )}
                        />
                    ) : (
                        <Controller
                            name="cnpj"
                            control={control}
                            defaultValue=""
                            rules={{
                                required: 'CNPJ é obrigatório',
                                validate: (value) => cnpj.isValid(value.replace(/\D/g, '')) || 'CNPJ inválido',
                                maxLength: { value: 14, message: 'CNPJ deve ter 14 dígitos' }
                            }}
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    label="CNPJ"
                                    value={formatCNPJ(value)}
                                    onChangeText={text => {
                                        const cleanedText = text.replace(/\D/g, ''); // Limpa a string
                                        if (cleanedText.length <= 14) { // Limita a quantidade de caracteres
                                            onChange(cleanedText);
                                        }
                                    }}
                                    style={styles.input}
                                    keyboardType="numeric"
                                    error={!!errors.cnpj}
                                />
                            )}
                        />
                    )}

                    {errors.cpf && <Text style={styles.error}>{errors.cpf.message}</Text>}
                    {errors.cnpj && <Text style={styles.error}>{errors.cnpj.message}</Text>}

                    {/* Número do Processo */}
                    <Controller
                        name="numero_processo"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                label="Número do Processo"
                                value={value}
                                onChangeText={onChange}
                                style={styles.input}
                            />
                        )}
                    />

                    {/* Link JusBrasil */}
                    <Controller
                        name="link_jusbrasil"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                label="Link JusBrasil"
                                value={value}
                                onChangeText={onChange}
                                style={styles.input}
                            />
                        )}
                    />

                    {/* Botão de Submissão */}
                    <Button mode="contained" onPress={handleSubmit(onSubmit)} disabled={loading} loading={loading}>
                {loading ? 'Cadastrando...' : 'Cadastrar Cliente'}
            </Button>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20 },
    input: { marginBottom: 10 },
    label: { fontSize: 16, marginBottom: 8 },
    radioButtonContainer: { flexDirection: 'row' },
    error: { color: 'red' },
});

export default CreateCliente;
