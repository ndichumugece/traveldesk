import { useState } from 'react';
import { ActivityList } from '../components/activities/ActivityList';
import { ActivityForm } from '../components/activities/ActivityForm';
import { type Activity } from '../hooks/useActivities';

export function Activities() {
    const [isAdding, setIsAdding] = useState(false);
    const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

    return (
        <div className="w-full">
            {isAdding || editingActivity ? (
                <ActivityForm
                    existingActivity={editingActivity}
                    onDiscard={() => {
                        setIsAdding(false);
                        setEditingActivity(null);
                    }}
                />
            ) : (
                <ActivityList
                    onAdd={() => setIsAdding(true)}
                    onEdit={(activity) => setEditingActivity(activity)}
                />
            )}
        </div>
    );
}
