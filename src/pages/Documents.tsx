import { useState } from 'react';
import { DocumentList } from '../components/documents/DocumentList';
import { DocumentForm } from '../components/documents/DocumentForm';
import type { Document } from '../hooks/useDocuments';

export function Documents() {
    const [isCreating, setIsCreating] = useState(false);
    const [editingDoc, setEditingDoc] = useState<Document | null>(null);

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
                <DocumentForm onDiscard={handleDiscard} initialDoc={editingDoc} />
            ) : (
                <DocumentList onCreate={handleCreate} onEdit={handleEdit} />
            )}
        </div>
    );
}
