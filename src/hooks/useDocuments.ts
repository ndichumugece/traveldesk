import { useState, useEffect } from 'react';
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

export function useDocuments(typeFilter: string | null = null) {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const PAGE_SIZE = 20;

    const fetchDocuments = async (page = 0, isLoadMore = false) => {
        try {
            if (isLoadMore) setLoadingMore(true);
            else setLoading(true);

            let query = supabase
                .from('documents')
                .select('id, reference, type, client_name, client_email, amount, status, issue_date, created_at, check_in, check_out, currency, exchange_rate, profiles(full_name, email)')
                .order('created_at', { ascending: false })
                .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

            if (typeFilter) {
                query = query.eq('type', typeFilter);
            }

            const { data, error: supabaseError } = await query;

            if (supabaseError) throw supabaseError;

            if (data) {
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
                        lineItems: [], // Excluded for performance in list
                        metadata: {}, // Excluded
                        currency: doc.currency || 'KSH',
                        exchangeRate: Number(doc.exchange_rate) || 1,
                        createdBy: profile?.full_name || 'Unknown User',
                        createdByEmail: profile?.email || ''
                    } as Document;
                });

                if (isLoadMore) {
                    setDocuments(prev => [...prev, ...formattedDocs]);
                } else {
                    setDocuments(formattedDocs);
                }
                
                setHasMore(data.length === PAGE_SIZE);
            }
        } catch (err: any) {
            console.error('Error fetching documents:', err);
            setError(err.message);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const fetchDocumentById = async (id: string): Promise<Document | null> => {
        try {
            const { data, error } = await supabase
                .from('documents')
                .select('*, profiles(full_name, email)')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (data) {
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
                };
            }
            return null;
        } catch (err) {
            console.error('Error fetching document details:', err);
            return null;
        }
    };

    useEffect(() => {
        fetchDocuments(0, false);
    }, [typeFilter]);

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            const nextPage = Math.floor(documents.length / PAGE_SIZE);
            fetchDocuments(nextPage, true);
        }
    };

    const createDocument = async (docData: any) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const payload = { ...docData, created_by: user?.id || null };
            const { data, error } = await supabase.from('documents').insert([payload]).select().single();
            if (error) throw error;
            fetchDocuments(0, false);
            return { data, error: null };
        } catch (err: any) {
            return { data: null, error: err.message };
        }
    };

    const updateDocument = async (id: string, docData: any) => {
        try {
            const { data, error } = await supabase.from('documents').update(docData).eq('id', id).select().single();
            if (error) throw error;
            fetchDocuments(0, false);
            return { data, error: null };
        } catch (err: any) {
            return { data: null, error: err.message };
        }
    };

    return { documents, loading, loadingMore, error, hasMore, loadMore, refetch: () => fetchDocuments(0, false), fetchDocumentById, createDocument, updateDocument };
}
