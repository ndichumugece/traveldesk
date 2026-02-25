import { useState } from 'react';
import { TransportList } from '../components/transport/TransportList';
import { TransportForm } from '../components/transport/TransportForm';
import { type Transport } from '../hooks/useTransports';

export function Transport() {
    const [isAdding, setIsAdding] = useState(false);
    const [editingTransport, setEditingTransport] = useState<Transport | null>(null);

    return (
        <div className="w-full">
            {isAdding || editingTransport ? (
                <TransportForm
                    existingTransport={editingTransport}
                    onDiscard={() => {
                        setIsAdding(false);
                        setEditingTransport(null);
                    }}
                />
            ) : (
                <TransportList
                    onAdd={() => setIsAdding(true)}
                    onEdit={(transport) => setEditingTransport(transport)}
                />
            )}
        </div>
    );
}
