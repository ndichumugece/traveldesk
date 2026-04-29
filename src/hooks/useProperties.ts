import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export type OccupancyType = 'SGL' | 'DBL' | 'TWN' | 'TPL' | 'Quad' | 'Per Room' | 'Per Person';
export type RateType = 'per_room' | 'per_person';

export interface RoomType {
    id?: string;
    property_id?: string;
    name: string;
    capacity: number;
    price_modifier: number;   
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
    supplier_id?: string;
    status: 'active' | 'inactive';
    amenities: string[];
    room_types?: RoomType[];
    seasonal_pricing?: SeasonalPricing[];
}

const fetchProperties = async () => {
    const { data, error } = await supabase
        .from('properties')
        .select('id, name, location, base_price, rooms, property_type, bedrooms, bathrooms, max_guests, status, amenities, supplier_id, room_types(id, name, capacity, price_modifier, occupancy_type, rate_type, price_sgl, price_dbl, price_twn, price_tpl, price_quad, extra_adult_rate, child_rate, infants_free, property_id)')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
};

export const useProperties = () => {
    return useQuery({
        queryKey: ['properties'],
        queryFn: fetchProperties,
    });
};

export function usePropertyDetails(id: string | null) {
    return useQuery({
        queryKey: ['property', id],
        queryFn: async () => {
            if (!id) return null;
            const { data: prop, error: propError } = await supabase
                .from('properties')
                .select(`
                    id, name, location, base_price, rooms, property_type, bedrooms, bathrooms, max_guests, status, amenities, supplier_id,
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

            const { data: seasons, error: seasonsError } = await supabase
                .from('seasonal_pricing')
                .select(`
                    id, name, start_date, end_date, pricing_type, markup_percentage, 
                    price_sgl, price_dbl, price_twn, price_tpl, price_quad, property_id, room_type_id
                `)
                .eq('property_id', id);

            if (seasonsError) throw seasonsError;

            const property: Property = {
                ...prop,
                seasonal_pricing: seasons?.filter(s => !s.room_type_id) || [],
                room_types: (prop.room_types || []).map(rt => ({
                    ...rt,
                    seasonal_pricing: seasons?.filter(s => s.room_type_id === rt.id) || []
                }))
            };

            return property;
        },
        enabled: !!id,
    });
}

export function useAddProperty() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ property, roomTypes, seasonalPricing }: {
            property: Omit<Property, 'id' | 'room_types' | 'seasonal_pricing'>,
            roomTypes: RoomType[],
            seasonalPricing: SeasonalPricing[]
        }) => {
            const { data: propData, error: propError } = await supabase
                .from('properties')
                .insert([property])
                .select()
                .single();

            if (propError) throw propError;
            const propertyId = propData.id;

            if (roomTypes.length > 0) {
                for (const rt of roomTypes) {
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

            return propData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        },
    });
}

export function useUpdatePropertyFull() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, updates, roomTypes, seasonalPricing }: {
            id: string,
            updates: Partial<Property>,
            roomTypes: RoomType[],
            seasonalPricing: SeasonalPricing[]
        }) => {
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
                    amenities: updates.amenities,
                    supplier_id: updates.supplier_id
                })
                .eq('id', id)
                .select()
                .single();

            if (propError) throw propError;

            await supabase.from('room_types').delete().eq('property_id', id);
            if (roomTypes.length > 0) {
                for (const rt of roomTypes) {
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

            return propData;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['properties'] });
            queryClient.invalidateQueries({ queryKey: ['property', data.id] });
        },
    });
}

export function useUpdateProperty() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, updates }: { id: string, updates: Partial<Property> }) => {
            const { data, error } = await supabase.from('properties').update(updates).eq('id', id).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['properties'] });
            queryClient.invalidateQueries({ queryKey: ['property', data.id] });
        },
    });
}

export function useDeleteProperty() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('properties').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        },
    });
}

