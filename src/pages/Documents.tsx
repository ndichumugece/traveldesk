import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DocumentList } from '../components/documents/DocumentList';
import { DocumentForm } from '../components/documents/DocumentForm';
import type { Document } from '../hooks/useDocuments';

export function Documents() {
    const location = useLocation();
    const navigate = useNavigate();

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

    // Check for sync data in location state
    useEffect(() => {
        if (location.state?.syncFrom) {
            const sourceDoc = location.state.syncFrom;
            // Clean up the doc for conversion
            const syncData = { 
                ...sourceDoc,
                id: undefined, // Must be undefined to create new
                syncSourceId: sourceDoc.id, // Store source ID for fetching full details
                reference: `SYNC-${Math.floor(Math.random() * 1000)}`, // New reference
                type: typeFilter, // Target type
                date: new Date().toISOString().split('T')[0], // New date
                status: 'pending'
            };
            setEditingDoc(syncData);
            setIsCreating(true);
            
            // Clear the location state so back button or refresh doesn't re-trigger sync
            window.history.replaceState({}, document.title);
        }
    }, [location.state, typeFilter]);

    // Reset state when path changes (e.g. switching between invoice and quotation)
    useEffect(() => {
        // Only reset if we are not in the middle of a sync transition
        // We check location.state directly from the window history as we cleared it manually
        const state = window.history.state;
        if (!location.state?.syncFrom && !state?.syncFrom) {
            setIsCreating(false);
            setEditingDoc(null);
        }
    }, [location.pathname]);

    const handleSync = (doc: Document) => {
        let targetPath = '';
        switch (doc.type) {
            case 'Quotation': targetPath = '/booking-voucher'; break;
            case 'Booking': targetPath = '/confirmation-voucher'; break;
            case 'Voucher': targetPath = '/invoice'; break;
            case 'Invoice': targetPath = '/booking-voucher'; break; // User specifically asked for Invoice -> Booking too
            default: targetPath = '/invoice';
        }
        
        navigate(targetPath, { state: { syncFrom: doc } });
    };

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
                    key={editingDoc?.id || editingDoc?.reference || 'new'}
                    onDiscard={handleDiscard}
                    onSync={handleSync}
                    initialDoc={editingDoc}
                    typeFilter={typeFilter}
                />
            ) : (
                <DocumentList
                    onCreate={handleCreate}
                    onEdit={handleEdit}
                    onSync={handleSync}
                    typeFilter={typeFilter}
                />
            )}
        </div>
    );
}
