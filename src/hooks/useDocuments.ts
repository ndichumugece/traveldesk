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
    lineItems: any[];
    createdBy?: string;
    createdByEmail?: string;
}

export function useDocuments() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const { data, error: supabaseError } = await supabase
                .from('documents')
                .select('*, profiles(full_name, email)')
                .order('created_at', { ascending: false });

            if (supabaseError) throw supabaseError;

            if (data) {
                const formattedDocs = data.map(doc => {
                    let dateStr = 'Unknown Date';
                    if (doc.issue_date) {
                        dateStr = format(parseISO(doc.issue_date), 'yyyy-MM-dd');
                    } else if (doc.created_at) {
                        dateStr = format(parseISO(doc.created_at), 'yyyy-MM-dd');
                    }

                    return {
                        id: doc.id,
                        reference: doc.reference || 'N/A',
                        type: doc.type || 'Unknown',
                        client: doc.client_name || 'Unknown Client',
                        clientEmail: doc.client_email || '',
                        amount: Number(doc.amount) || 0,
                        status: doc.status || 'pending',
                        date: dateStr,
                        lineItems: doc.line_items || [],
                        createdBy: doc.profiles?.full_name || 'Unknown User',
                        createdByEmail: doc.profiles?.email || ''
                    };
                });
                setDocuments(formattedDocs);
            }
        } catch (err: any) {
            console.error('Error fetching documents:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const createDocument = async (docData: any) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const payload = {
                ...docData,
                created_by: user?.id || null
            };

            const { data, error } = await supabase
                .from('documents')
                .insert([payload])
                .select()
                .single();

            if (error) throw error;

            // Refresh list
            fetchDocuments();
            return { data, error: null };
        } catch (err: any) {
            console.error('Error creating document:', err);
            return { data: null, error: err.message };
        }
    };

    const updateDocument = async (id: string, docData: any) => {
        try {
            const { data, error } = await supabase
                .from('documents')
                .update(docData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            // Refresh list
            fetchDocuments();
            return { data, error: null };
        } catch (err: any) {
            console.error('Error updating document:', err);
            return { data: null, error: err.message };
        }
    };

    return { documents, loading, error, refetch: fetchDocuments, createDocument, updateDocument };
}
