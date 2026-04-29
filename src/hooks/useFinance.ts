import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface Account {
    id: string;
    name: string;
    type: 'M-Pesa' | 'Bank' | 'Cash';
    balance: number;
    created_at: string;
}

export interface Invoice {
    id: string;
    booking_id?: string;
    invoice_number: string;
    client_name: string;
    amount: number;
    status: 'Unpaid' | 'Partial' | 'Paid';
    issue_date: string;
    due_date?: string;
    created_at: string;
}

export interface Payment {
    id: string;
    invoice_id?: string;
    booking_id?: string;
    client_name: string;
    amount: number;
    method: 'M-Pesa' | 'Bank' | 'Cash';
    payment_date: string;
    reference_number?: string;
    notes?: string;
    account_id?: string;
    created_at: string;
}

export interface Expense {
    id: string;
    booking_id?: string;
    supplier_name: string;
    category: string;
    amount: number;
    status: 'Pending' | 'Paid';
    payment_method?: string;
    payment_date?: string;
    account_id?: string;
    created_at: string;
}

// --- Query Functions ---

const fetchInvoices = async () => {
    const { data, error } = await supabase.from('finance_invoices').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as Invoice[];
};

const fetchPayments = async () => {
    const { data, error } = await supabase.from('finance_payments').select('*').order('payment_date', { ascending: false });
    if (error) throw error;
    return data as Payment[];
};

const fetchExpenses = async () => {
    const { data, error } = await supabase.from('finance_expenses').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as Expense[];
};

const fetchAccounts = async () => {
    const { data, error } = await supabase.from('finance_accounts').select('*').order('created_at', { ascending: true });
    if (error) throw error;
    return data as Account[];
};

const fetchBookingFinance = async (bookingId: string) => {
    const [payRes, expRes] = await Promise.all([
        supabase.from('finance_payments').select('*').eq('booking_id', bookingId),
        supabase.from('finance_expenses').select('*').eq('booking_id', bookingId)
    ]);
    if (payRes.error) throw payRes.error;
    if (expRes.error) throw expRes.error;
    return {
        payments: payRes.data as Payment[],
        expenses: expRes.data as Expense[]
    };
};

// --- Hooks ---

export const useInvoices = () => {
    return useQuery({
        queryKey: ['finance', 'invoices'],
        queryFn: fetchInvoices,
    });
};

export const usePayments = () => {
    return useQuery({
        queryKey: ['finance', 'payments'],
        queryFn: fetchPayments,
    });
};

export const useExpenses = () => {
    return useQuery({
        queryKey: ['finance', 'expenses'],
        queryFn: fetchExpenses,
    });
};

export const useAccounts = () => {
    return useQuery({
        queryKey: ['finance', 'accounts'],
        queryFn: fetchAccounts,
    });
};

export const useFinance = () => {
    const invoicesQuery = useInvoices();
    const paymentsQuery = usePayments();
    const expensesQuery = useExpenses();
    const accountsQuery = useAccounts();

    return {
        invoices: invoicesQuery.data || [],
        payments: paymentsQuery.data || [],
        expenses: expensesQuery.data || [],
        accounts: accountsQuery.data || [],
        loading: invoicesQuery.isLoading || paymentsQuery.isLoading || expensesQuery.isLoading || accountsQuery.isLoading,
        isFetching: invoicesQuery.isFetching || paymentsQuery.isFetching || expensesQuery.isFetching || accountsQuery.isFetching,
        refetch: () => {
            invoicesQuery.refetch();
            paymentsQuery.refetch();
            expensesQuery.refetch();
            accountsQuery.refetch();
        }
    };
};

export const useBookingFinance = (bookingId: string) => {
    const { data, isLoading, isFetching, refetch } = useQuery({
        queryKey: ['finance', 'booking', bookingId],
        queryFn: () => fetchBookingFinance(bookingId),
        enabled: !!bookingId,
    });

    const payments = data?.payments || [];
    const expenses = data?.expenses || [];

    const totalPayments = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const profit = totalPayments - totalExpenses;

    return {
        payments,
        expenses,
        totalPayments,
        totalExpenses,
        profit,
        loading: isLoading,
        isFetching,
        refetch
    };
};

export const useMarkInvoicePaid = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (invoiceId: string) => {
            const { error } = await supabase
                .from('finance_invoices')
                .update({ status: 'Paid' })
                .eq('id', invoiceId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['finance', 'invoices'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};

export const useDeleteInvoice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (invoiceId: string) => {
            const { error } = await supabase
                .from('finance_invoices')
                .delete()
                .eq('id', invoiceId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['finance', 'invoices'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};

