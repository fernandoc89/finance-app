import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../../api/client';
import BalanceCard from '../../components/BalanceCard';
import Chart from '../../components/Chart';
import TransactionItem from '../../components/TransactionItem';

interface DashboardData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  recentTransactions: any[];
  expensesByCategory: any[];
}

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const [data, setData] = useState<DashboardData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  if (!data) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
      </View>

      <BalanceCard
        totalBalance={data.totalBalance}
        monthlyIncome={data.monthlyIncome}
        monthlyExpenses={data.monthlyExpenses}
      />

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('AddTransaction', { type: 'expense' })}
        >
          <Text style={styles.actionButtonText}>Nova Despesa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.incomeButton]}
          onPress={() => navigation.navigate('AddTransaction', { type: 'income' })}
        >
          <Text style={styles.actionButtonText}>Nova Receita</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Despesas por Categoria</Text>
        <Chart data={data.expensesByCategory} />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transações Recentes</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
            <Text style={styles.seeAll}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        {data.recentTransactions.map((transaction) => (
          <TransactionItem key={transaction.id} transaction={transaction} />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#6C63FF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  quickActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  incomeButton: {
    backgroundColor: '#4ECDC4',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  seeAll: {
    color: '#6C63FF',
    fontWeight: '600',
  },
});
