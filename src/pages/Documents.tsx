import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DocumentList } from '../components/documents/DocumentList';
import { DocumentForm } from '../components/documents/DocumentForm';
import type { Document } from '../hooks/useDocuments';

export function Documents() {
    const location = useLocation();

    // Map pathnames to internal document types
    const getPathType = () => {
        const path = location.pathname.split('/').pop();
        switch (path) {
            case 'invoice': return 'Invoice';
            case 'confirmation-voucher': return 'Voucher';
            case 'booking-voucher': return 'Booking';
            case 'quotation': return 'Quotation';
            default: return null;
        }
    };

    const typeFilter = getPathType();
    const [isCreating, setIsCreating] = useState(false);
    const [editingDoc, setEditingDoc] = useState<Document | null>(null);

    // Reset state when path changes (e.g. switching between invoice and quotation)
    useEffect(() => {
        setIsCreating(false);
        setEditingDoc(null);
    }, [location.pathname]);

    const handleCreate = () => {
        setIsCreating(true);
        setEditingDoc(null);
    };

    const handleEdit = (doc: Document) => {
        setIsCreating(true);
        setEditingDoc(doc);
    };

    const handleDiscard = () => {
        setIsCreating(false);
        setEditingDoc(null);
    };

    return (
        <div className="w-full">
            {isCreating ? (
                <DocumentForm
                    onDiscard={handleDiscard}
                    initialDoc={editingDoc}
                    typeFilter={typeFilter}
                />
            ) : (
                <DocumentList
                    onCreate={handleCreate}
                    onEdit={handleEdit}
                    typeFilter={typeFilter}
                />
            )}
        </div>
    );
}
