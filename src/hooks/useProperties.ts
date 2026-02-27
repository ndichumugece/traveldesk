import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export type OccupancyType = 'SGL' | 'DBL' | 'TWN' | 'TPL' | 'Quad' | 'Per Room' | 'Per Person';
export type RateType = 'per_room' | 'per_person';

export interface RoomType {
    id?: string;
    property_id?: string;
    name: string;
    capacity: number;
    price_modifier: number;   // kept for backward-compat; prefer explicit prices below
    // New pricing fields
    occupancy_type: OccupancyType;
    rate_type: RateType;
    price_sgl?: number | null;
    price_dbl?: number | null;
    price_twn?: number | null;
    price_tpl?: number | null;
    price_quad?: number | null;
    extra_adult_rate: number;
    child_rate: number;
    infants_free: boolean;
    seasonal_pricing?: SeasonalPricing[];
}

export interface SeasonalPricing {
    id?: string;
    property_id?: string;
    room_type_id?: string;
    name: string;
    start_date: string;
    end_date: string;
    pricing_type: 'percentage' | 'fixed';
    markup_percentage: number;
    price_sgl?: number | null;
    price_dbl?: number | null;
    price_twn?: number | null;
    price_tpl?: number | null;
    price_quad?: number | null;
}

export interface Property {
    id: string;
    name: string;
    location: string;
    base_price: number;
    rooms: number;
    status: 'active' | 'inactive';
    amenities: string[];
    room_types?: RoomType[];
    seasonal_pricing?: SeasonalPricing[];
}

export const useProperties = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('properties')
                .select('*, room_types(*, seasonal_pricing(*)), seasonal_pricing(*)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProperties(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addProperty = async (
        property: Omit<Property, 'id' | 'room_types' | 'seasonal_pricing'>,
        roomTypes: RoomType[],
        seasonalPricing: SeasonalPricing[]
    ) => {
        try {
            // 1. Insert main property
            const { data: propData, error: propError } = await supabase
                .from('properties')
                .insert([property])
                .select()
                .single();

            if (propError) throw propError;

            const propertyId = propData.id;

            // 2. Insert room types and their seasonal pricing
            if (roomTypes.length > 0) {
                for (const rt of roomTypes) {
                    const { data: rtData, error: rtError } = await supabase
                        .from('room_types')
                        .insert([{ ...rt, property_id: propertyId, seasonal_pricing: undefined }]) // Don't try to insert nested JSON
                        .select()
                        .single();

                    if (rtError) throw rtError;

                    if (rt.seasonal_pricing && rt.seasonal_pricing.length > 0) {
                        const spToInsert = rt.seasonal_pricing.map(sp => ({
                            name: sp.name,
                            start_date: sp.start_date,
                            end_date: sp.end_date,
                            pricing_type: sp.pricing_type || 'percentage',
                            markup_percentage: sp.markup_percentage || 0,
                            price_sgl: sp.price_sgl ?? null,
                            price_dbl: sp.price_dbl ?? null,
                            price_twn: sp.price_twn ?? null,
                            price_tpl: sp.price_tpl ?? null,
                            price_quad: sp.price_quad ?? null,
                            property_id: propertyId,
                            room_type_id: rtData.id
                        }));
                        const { error: spError } = await supabase.from('seasonal_pricing').insert(spToInsert);
                        if (spError) throw spError;
                    }
                }
            }

            // 3. Insert global seasonal pricing (if still used)
            if (seasonalPricing.length > 0) {
                const spToInsert = seasonalPricing.map(sp => ({ ...sp, property_id: propertyId }));
                const { error: spError } = await supabase.from('seasonal_pricing').insert(spToInsert);
                if (spError) throw spError;
            }

            fetchProperties(); // Refresh to get the fully joined object
            return { data: propData, error: null };
        } catch (err: any) {
            return { data: null, error: err.message };
        }
    };

    const updatePropertyFull = async (
        id: string,
        updates: Partial<Property>,
        roomTypes: RoomType[],
        seasonalPricing: SeasonalPricing[]
    ) => {
        try {
            // 1. Update main property
            const { data: propData, error: propError } = await supabase
                .from('properties')
                .update({
                    name: updates.name,
                    location: updates.location,
                    base_price: updates.base_price,
                    rooms: updates.rooms,
                    status: updates.status,
                    amenities: updates.amenities
                })
                .eq('id', id)
                .select()
                .single();

            if (propError) throw propError;

            // 2. Replace room types (delete existing, insert new ones)
            // Note: deleting room types will cascade delete their associated seasonal pricing
            await supabase.from('room_types').delete().eq('property_id', id);
            if (roomTypes.length > 0) {
                for (const rt of roomTypes) {
                    const { data: rtData, error: rtError } = await supabase
                        .from('room_types')
                        .insert([{
                            name: rt.name,
                            capacity: rt.capacity,
                            price_modifier: rt.price_modifier,
                            occupancy_type: rt.occupancy_type,
                            rate_type: rt.rate_type,
                            price_sgl: rt.price_sgl ?? null,
                            price_dbl: rt.price_dbl ?? null,
                            price_twn: rt.price_twn ?? null,
                            price_tpl: rt.price_tpl ?? null,
                            price_quad: rt.price_quad ?? null,
                            extra_adult_rate: rt.extra_adult_rate,
                            child_rate: rt.child_rate,
                            infants_free: rt.infants_free,
                            property_id: id
                        }])
                        .select()
                        .single();

                    if (rtError) throw rtError;

                    if (rt.seasonal_pricing && rt.seasonal_pricing.length > 0) {
                        const spToInsert = rt.seasonal_pricing.map(sp => ({
                            name: sp.name,
                            start_date: sp.start_date,
                            end_date: sp.end_date,
                            pricing_type: sp.pricing_type || 'percentage',
                            markup_percentage: sp.markup_percentage || 0,
                            price_sgl: sp.price_sgl ?? null,
                            price_dbl: sp.price_dbl ?? null,
                            price_twn: sp.price_twn ?? null,
                            price_tpl: sp.price_tpl ?? null,
                            price_quad: sp.price_quad ?? null,
                            property_id: id,
                            room_type_id: rtData.id
                        }));
                        const { error: spError } = await supabase.from('seasonal_pricing').insert(spToInsert);
                        if (spError) throw spError;
                    }
                }
            }

            // 3. Replace global seasonal pricing
            // Also delete top-level ones that don't belong to a room type
            await supabase.from('seasonal_pricing').delete().eq('property_id', id).is('room_type_id', null);
            if (seasonalPricing.length > 0) {
                const spToInsert = seasonalPricing.map(sp => ({
                    name: sp.name,
                    start_date: sp.start_date,
                    end_date: sp.end_date,
                    markup_percentage: sp.markup_percentage,
                    property_id: id
                }));
                const { error: spError } = await supabase.from('seasonal_pricing').insert(spToInsert);
                if (spError) throw spError;
            }

            fetchProperties(); // Refresh to get joined data
            return { data: propData, error: null };
        } catch (err: any) {
            return { data: null, error: err.message };
        }
    };

    const updateProperty = async (id: string, updates: Partial<Property>) => {
        try {
            const { data, error } = await supabase
                .from('properties')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            fetchProperties(); // Refresh to get joined data if needed
            return { data, error: null };
        } catch (err: any) {
            return { data: null, error: err.message };
        }
    };

    const deleteProperty = async (id: string) => {
        try {
            const { error } = await supabase
                .from('properties')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setProperties(properties.filter(p => p.id !== id));
            return { error: null };
        } catch (err: any) {
            return { error: err.message };
        }
    };

    return {
        properties,
        loading,
        error,
        refetch: fetchProperties,
        addProperty,
        updateProperty,
        updatePropertyFull,
        deleteProperty
    };
};
