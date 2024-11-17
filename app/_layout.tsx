import React, { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Provider as PaperProvider } from 'react-native-paper'; // Provider do React Native Paper
import SnackbarProvider from './context/SnackbarContext'; // Contexto para Snackbars
import { initializeDatabase } from './service/sqlite/setup'; // Função de inicialização do banco

export default function Layout() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setupApp = async () => {
      try {
        // Inicializa o banco de dados antes de continuar
        await initializeDatabase();
        console.log('Banco de dados inicializado com sucesso.');
      } catch (error) {
        console.error('Erro ao inicializar o banco de dados:', error);
      } finally {
        setLoading(false); // Finaliza o estado de carregamento
      }
    };

    setupApp();
  }, []);

  if (loading) {
    // Tela de carregamento durante a inicialização
    return (
      <View style={styles.container}>
        <Text style={styles.title}>SIGA</Text>
        <Text style={styles.subtitle}>Sistema Integrado de Gestão e Acompanhamento</Text>
        <ActivityIndicator size="large" color="#000" style={styles.loader} />
      </View>
    );
  }

  // Layout principal após a inicialização
  return (
    <PaperProvider> {/* Provider do React Native Paper */}
      <SnackbarProvider> {/* Provider do Snackbar */}
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              title: 'SIGA',
              headerLeft: () => (
                <Feather name="target" size={24} color="black" style={{ marginRight: 10 }} />
              ),
            }}
          />

          <Stack.Screen
            name="create-cliente"
            options={{
              title: 'Novo Cliente',
              headerLeft: () => (
                <AntDesign name="adduser" size={24} color="black" style={{ marginRight: 10 }} />
              ),
            }}
          />

          <Stack.Screen
            name="cliente/[id]"
            options={{
              title: 'Cliente',
              headerLeft: () => (
                <AntDesign name="user" size={24} color="black" style={{ marginRight: 10 }} />
              ),
            }}
          />

          <Stack.Screen
            name="cliente/editar"
            options={{
              title: 'Editar Cliente',
              headerLeft: () => (
                <AntDesign name="edit" size={24} color="black" style={{ marginRight: 10 }} />
              ),
            }}
          />
        </Stack>
      </SnackbarProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  loader: {
    marginTop: 20,
  },
});
