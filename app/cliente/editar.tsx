import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { TextInput, Button, RadioButton, Dialog, Portal, ActivityIndicator, Menu, Provider } from 'react-native-paper';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { cpf, cnpj } from 'cpf-cnpj-validator';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSnackbar } from '../context/SnackbarContext';
import { obterClientePorIdService, atualizarClienteService } from '../service/clienteService';
import { obterTodosStatus } from '../service/statusService'; // Importando a função de status
import { Cliente } from '../types/cliente.interface';
import { Status } from '../types/status.interface';

interface FormData {
    nome: string;
    email: string;
    cpf: string;
    cnpj: string;
    numero_processo?: string;
    link_jusbrasil?: string;
    tipoCliente: string;
    status_id: number; // Adicionando status_id
}

const EditCliente: React.FC = () => {
    const { control, handleSubmit, setValue, formState: { errors } } = useForm<FormData>();
    const [tipoCliente, setTipoCliente] = useState('pf');
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusOptions, setStatusOptions] = useState<{ id: number, name: string }[]>([]); // Estado para armazenar os status
    const [selectedStatus, setSelectedStatus] = useState<number>(0); // Estado para o status selecionado
    const [showMenu, setShowMenu] = useState(false); // Novo estado para controlar a visibilidade do Menu
    const router = useRouter();
    const { showSnackbar } = useSnackbar();
    const { id } = useLocalSearchParams(); // Obtém o ID do cliente pela URL

    // Função para buscar e preencher os dados do cliente
    useEffect(() => {
        const loadCliente = async () => {
            try {
                if (id) {
                    const cliente = await obterClientePorIdService(Number(id));
                    if (cliente) {
                        setValue('nome', cliente.nome);
                        setValue('email', cliente.email);
                        setValue('cpf', cliente.cpf_cnpj);
                        setValue('cnpj', cliente.cpf_cnpj); // Preenche o campo CNPJ se for PJ
                        setValue('numero_processo', cliente.numero_processo);
                        setValue('link_jusbrasil', cliente.link_jusbrasil);
                        setValue('status_id', cliente.status_id); // Preenche o status do cliente
                        setSelectedStatus(cliente.status_id); // Seleciona o status carregado
                        setTipoCliente(cliente.cpf_cnpj.length === 11 ? 'pf' : 'pj');
                    }
                }
            } catch (error) {
                console.error('Erro ao carregar cliente', error);
                showSnackbar('Erro ao carregar dados do cliente');
            } finally {
                setLoading(false);
            }
        };

        // Função para buscar os status disponíveis
        const loadStatus = async () => {
            try {
                const statusList = await obterTodosStatus(); // Obtendo os status
                setStatusOptions(statusList.map(status => ({
                    id: status.id,
                    name: status.descricao // Garantindo que 'name' existe no status
                })));
            } catch (error) {
                console.error('Erro ao carregar os status:', error);
            }
        };

        loadCliente();
        loadStatus(); // Carrega os status ao iniciar
    }, [id, setValue, showSnackbar]);

    // Função de envio para salvar as alterações
    const onSubmit: SubmitHandler<FormData> = async (data) => {
        try {
            setIsSubmitting(true);
            if (id) {
                const clienteAtualizado: Partial<Cliente> = {
                    nome: data.nome,
                    email: data.email,
                    cpf_cnpj: tipoCliente === 'pf' ? data.cpf : data.cnpj, // Envia CPF ou CNPJ de acordo com o tipo
                    numero_processo: data.numero_processo || '',
                    link_jusbrasil: data.link_jusbrasil || '',
                    status_id: selectedStatus, // Envia o status selecionado
                };

                await atualizarClienteService(Number(id), clienteAtualizado);

                showSnackbar('Cliente atualizado com sucesso');
                router.push('/'); // Redireciona para o dashboard
            }
        } catch (error) {
            console.error('Erro ao atualizar cliente', error);
            showSnackbar('Erro ao atualizar cliente');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveChanges = () => {
        setShowDialog(true); // Exibe o Dialog para confirmar a ação
    };

    const handleConfirmEdit = () => {
        setShowDialog(false); // Fecha o Dialog
        handleSubmit(onSubmit)(); // Executa o onSubmit para salvar
    };

    const handleCancelEdit = () => {
        setShowDialog(false); // Fecha o Dialog sem salvar
    };

    const handleSelectStatus = (statusId: number) => {
        setSelectedStatus(statusId);
        setShowMenu(false); // Fecha o Menu após selecionar o status
    };

    if (loading) {
        return <ActivityIndicator animating={true} size="large" />;
    }

    return (
        <View style={styles.container}>
            {/* Campo de Status */}
            <Text style={styles.label}>Status</Text>
            <Menu
                visible={showMenu}
                onDismiss={() => setShowMenu(false)}
                anchor={
                    <Button
                        mode="outlined"
                        onPress={() => setShowMenu(true)}
                        style={{ marginBottom: 10 }}
                    >
                        {statusOptions.find(status => status.id === selectedStatus)?.name || 'Selecione o Status'}
                    </Button>
                }
            >
                {statusOptions.map(status => (
                    <Menu.Item
                        key={status.id}
                        onPress={() => handleSelectStatus(status.id)}
                        title={status.name}
                    />
                ))}
            </Menu>

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

            {/* Campo de CPF ou CNPJ baseado no tipo de cliente */}
            {tipoCliente === 'pf' ? (
                <Controller
                    name="cpf"
                    control={control}
                    defaultValue=""
                    rules={{ required: 'CPF é obrigatório' }}
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            label="CPF"
                            value={value}
                            onChangeText={onChange}
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
                    rules={{ required: 'CNPJ é obrigatório' }}
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            label="CNPJ"
                            value={value}
                            onChangeText={onChange}
                            style={styles.input}
                            keyboardType="numeric"
                            error={!!errors.cnpj}
                        />
                    )}
                />
            )}

            {/* Campo de número de processo */}
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

            {/* Campo de Link JusBrasil */}
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

            <Button mode="contained" onPress={handleSaveChanges} disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </Button>

            {/* Dialog de confirmação */}
            <Portal>
                <Dialog visible={showDialog} onDismiss={handleCancelEdit}>
                    <Dialog.Title>Confirmar Alterações</Dialog.Title>
                    <Dialog.Content>
                        <Text>Tem certeza de que deseja salvar as alterações?</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={handleCancelEdit}>Cancelar</Button>
                        <Button onPress={handleConfirmEdit}>Confirmar</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    input: {
        marginBottom: 16,
    },
    radioButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    error: {
        color: 'red',
        fontSize: 12,
        marginBottom: 10,
    },
});

export default EditCliente;
