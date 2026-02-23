import { useState } from 'react';
import { PropertyList } from '../components/properties/PropertyList';
import { PropertyForm } from '../components/properties/PropertyForm';
import { type Property } from '../hooks/useProperties';

export function Properties() {
    const [isAdding, setIsAdding] = useState(false);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);

    return (
        <div className="w-full">
            {isAdding || editingProperty ? (
                <PropertyForm
                    existingProperty={editingProperty}
                    onDiscard={() => {
                        setIsAdding(false);
                        setEditingProperty(null);
                    }}
                />
            ) : (
                <PropertyList
                    onAdd={() => setIsAdding(true)}
                    onEdit={(property) => setEditingProperty(property)}
                />
            )}
        </div>
    );
}
