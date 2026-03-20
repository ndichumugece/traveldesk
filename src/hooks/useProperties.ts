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
    property_type?: 'Hotel' | 'Villa' | 'Apartment';
    bedrooms?: number;
    bathrooms?: number;
    max_guests?: number;
    status: 'active' | 'inactive';
    amenities: string[];
    room_types?: RoomType[];
    seasonal_pricing?: SeasonalPricing[];
}

export const useProperties = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProperties = async () => {
        try {
            setLoading(true);
            // Only fetch baseline property data for list view
            const { data, error } = await supabase
                .from('properties')
                .select('id, name, location, base_price, rooms, property_type, bedrooms, bathrooms, max_guests, status, amenities, room_types(id, name, capacity, price_modifier, occupancy_type, rate_type, price_sgl, price_dbl, price_twn, price_tpl, price_quad, extra_adult_rate, child_rate, infants_free, property_id)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProperties(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchPropertyDetails = async (id: string): Promise<Property | null> => {
        try {
            // 1. Fetch Property + Room Types
            const { data: prop, error: propError } = await supabase
                .from('properties')
                .select(`
                    id, name, location, base_price, rooms, property_type, bedrooms, bathrooms, max_guests, status, amenities,
                    room_types (
                        id, name, capacity, price_modifier, occupancy_type, rate_type, 
                        price_sgl, price_dbl, price_twn, price_tpl, price_quad, 
                        extra_adult_rate, child_rate, infants_free, property_id
                    )
                `)
                .eq('id', id)
                .single();

            if (propError) throw propError;
            if (!prop) return null;

            // 2. Fetch ALL Seasonal Pricing for this property
            const { data: seasons, error: seasonsError } = await supabase
                .from('seasonal_pricing')
                .select(`
                    id, name, start_date, end_date, pricing_type, markup_percentage, 
                    price_sgl, price_dbl, price_twn, price_tpl, price_quad, property_id, room_type_id
                `)
                .eq('property_id', id);

            if (seasonsError) throw seasonsError;

            // 3. Merge them
            const property: Property = {
                ...prop,
                seasonal_pricing: seasons?.filter(s => !s.room_type_id) || [],
                room_types: (prop.room_types || []).map(rt => ({
                    ...rt,
                    seasonal_pricing: seasons?.filter(s => s.room_type_id === rt.id) || []
                }))
            };

            return property;
        } catch (err) {
            console.error('Error fetching property details:', err);
            // If the error is specific to seasonal_pricing column, the user will see it here
            // but let's re-throw so any higher-level handler (like an alert) catches it
            throw err; 
        }
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    const addProperty = async (
        property: Omit<Property, 'id' | 'room_types' | 'seasonal_pricing'>,
        roomTypes: RoomType[],
        seasonalPricing: SeasonalPricing[]
    ) => {
        try {
            const { data: propData, error: propError } = await supabase
                .from('properties')
                .insert([property])
                .select()
                .single();

            if (propError) throw propError;
            const propertyId = propData.id;

            if (roomTypes.length > 0) {
                for (const rt of roomTypes) {
                    // Strictly exclude seasonal_pricing from the room_types table insert
                    const { seasonal_pricing: rtSeasons, ...rtData } = rt;
                    const { data: rtRecord, error: rtError } = await supabase
                        .from('room_types')
                        .insert([{ ...rtData, property_id: propertyId }])
                        .select()
                        .single();

                    if (rtError) throw rtError;

                    if (rtSeasons && rtSeasons.length > 0) {
                        const spToInsert = rtSeasons.map(sp => ({
                            ...sp,
                            property_id: propertyId,
                            room_type_id: rtRecord.id
                        }));
                        const { error: spError } = await supabase.from('seasonal_pricing').insert(spToInsert);
                        if (spError) throw spError;
                    }
                }
            }

            if (seasonalPricing.length > 0) {
                const spToInsert = seasonalPricing.map(sp => ({ ...sp, property_id: propertyId }));
                const { error: spError } = await supabase.from('seasonal_pricing').insert(spToInsert);
                if (spError) throw spError;
            }

            fetchProperties();
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
            const { data: propData, error: propError } = await supabase
                .from('properties')
                .update({
                    name: updates.name,
                    location: updates.location,
                    base_price: updates.base_price,
                    rooms: updates.rooms,
                    property_type: updates.property_type,
                    bedrooms: updates.bedrooms,
                    bathrooms: updates.bathrooms,
                    max_guests: updates.max_guests,
                    status: updates.status,
                    amenities: updates.amenities
                })
                .eq('id', id)
                .select()
                .single();

            if (propError) throw propError;

            await supabase.from('room_types').delete().eq('property_id', id);
            if (roomTypes.length > 0) {
                for (const rt of roomTypes) {
                    // Strictly exclude seasonal_pricing from the room_types table insert
                    const { seasonal_pricing: rtSeasons, ...rtData } = rt;
                    const { data: rtRecord, error: rtError } = await supabase
                        .from('room_types')
                        .insert([{ ...rtData, property_id: id }])
                        .select()
                        .single();

                    if (rtError) throw rtError;

                    if (rtSeasons && rtSeasons.length > 0) {
                        const spToInsert = rtSeasons.map(sp => ({
                            ...sp,
                            property_id: id,
                            room_type_id: rtRecord.id
                        }));
                        const { error: spError } = await supabase.from('seasonal_pricing').insert(spToInsert);
                        if (spError) throw spError;
                    }
                }
            }

            await supabase.from('seasonal_pricing').delete().eq('property_id', id).is('room_type_id', null);
            if (seasonalPricing.length > 0) {
                const spToInsert = seasonalPricing.map(sp => ({
                    ...sp,
                    property_id: id
                }));
                const { error: spError } = await supabase.from('seasonal_pricing').insert(spToInsert);
                if (spError) throw spError;
            }

            fetchProperties();
            return { data: propData, error: null };
        } catch (err: any) {
            return { data: null, error: err.message };
        }
    };

    const updateProperty = async (id: string, updates: Partial<Property>) => {
        try {
            const { data, error } = await supabase.from('properties').update(updates).eq('id', id).select().single();
            if (error) throw error;
            fetchProperties();
            return { data, error: null };
        } catch (err: any) {
            return { data: null, error: err.message };
        }
    };

    const deleteProperty = async (id: string) => {
        try {
            const { error } = await supabase.from('properties').delete().eq('id', id);
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
        fetchPropertyDetails,
        addProperty,
        updateProperty,
        updatePropertyFull,
        deleteProperty
    };
};
