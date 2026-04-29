import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { parseISO, format } from 'date-fns';

export interface Document {
    id: string;
    reference: string;
    type: string;
    client: string;
    clientEmail: string;
    amount: number;
    status: string;
    date: string;
    checkIn?: string;
    checkOut?: string;
    lineItems: any[];
    metadata?: any;
    currency: string;
    exchangeRate: number;
    createdBy?: string;
    createdByEmail?: string;
}

const PAGE_SIZE = 20;

const fetchDocumentsPage = async ({ pageParam = 0, typeFilter }: { pageParam: number, typeFilter: string | null }) => {
    let query = supabase
        .from('documents')
        .select('id, reference, type, client_name, client_email, amount, status, issue_date, created_at, check_in, check_out, currency, exchange_rate, metadata, profiles(full_name, email)')
        .order('created_at', { ascending: false })
        .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1);

    if (typeFilter) {
        query = query.eq('type', typeFilter);
    }

    const { data, error } = await query;
    if (error) throw error;

    const formattedDocs = data.map((doc: any) => {
        let dateStr = 'Unknown Date';
        if (doc.issue_date) {
            dateStr = format(parseISO(doc.issue_date), 'yyyy-MM-dd');
        } else if (doc.created_at) {
            dateStr = format(parseISO(doc.created_at), 'yyyy-MM-dd');
        }

        const profile = Array.isArray(doc.profiles) ? doc.profiles[0] : doc.profiles;

        return {
            id: doc.id,
            reference: doc.reference || 'N/A',
            type: doc.type || 'Unknown',
            client: doc.client_name || 'Unknown Client',
            clientEmail: doc.client_email || '',
            amount: Number(doc.amount) || 0,
            status: doc.status || 'pending',
            date: dateStr,
            checkIn: doc.check_in || '',
            checkOut: doc.check_out || '',
            lineItems: [], 
            metadata: doc.metadata || {},
            currency: doc.currency || 'KSH',
            exchangeRate: Number(doc.exchange_rate) || 1,
            createdBy: profile?.full_name || 'Unknown User',
            createdByEmail: profile?.email || ''
        } as Document;
    });

    return {
        data: formattedDocs,
        nextPage: data.length === PAGE_SIZE ? pageParam + 1 : undefined,
    };
};

export function useDocuments(typeFilter: string | null = null) {
    return useInfiniteQuery({
        queryKey: ['documents', typeFilter],
        queryFn: ({ pageParam }) => fetchDocumentsPage({ pageParam, typeFilter }),
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage.nextPage,
    });
}

export function useDocumentDetails(id: string | null) {
    return useQuery({
        queryKey: ['document', id],
        queryFn: async () => {
            if (!id) return null;
            const { data, error } = await supabase
                .from('documents')
                .select('*, profiles(full_name, email)')
                .eq('id', id)
                .single();

            if (error) throw error;
            return {
                id: data.id,
                reference: data.reference || 'N/A',
                type: data.type || 'Unknown',
                client: data.client_name || 'Unknown Client',
                clientEmail: data.client_email || '',
                amount: Number(data.amount) || 0,
                status: data.status || 'pending',
                date: data.issue_date || data.created_at,
                lineItems: data.line_items || [],
                metadata: data.metadata || {},
                currency: data.currency || 'KSH',
                exchangeRate: Number(data.exchange_rate) || 1,
                createdBy: data.profiles?.full_name || 'Unknown User',
                createdByEmail: data.profiles?.email || ''
            } as Document;
        },
        enabled: !!id,
    });
}

export function useCreateDocument() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (docData: any) => {
            const { data: { user } } = await supabase.auth.getUser();
            const payload = { ...docData, created_by: user?.id || null };
            const { data, error } = await supabase.from('documents').insert([payload]).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}

export function useUpdateDocument() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, docData }: { id: string, docData: any }) => {
            const { data, error } = await supabase.from('documents').update(docData).eq('id', id).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            queryClient.invalidateQueries({ queryKey: ['document', data.id] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}

export function useDeleteDocument() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('documents').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['propertyStats'] });
            queryClient.invalidateQueries({ queryKey: ['clientStats'] });
        },
    });
}

