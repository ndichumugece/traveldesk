import { useState } from 'react';
import { ArrowLeft, Save, Plus, Trash2, Loader2, Download, Eye } from 'lucide-react';
import { useDocuments } from '../../hooks/useDocuments';
import type { Document } from '../../hooks/useDocuments';
import { pdf } from '@react-pdf/renderer';
import { DocumentPDF } from '../../lib/pdfEngine/DocumentPDF';
import { useSettings } from '../../hooks/useSettings';
import { useProperties } from '../../hooks/useProperties';
import { useActivities } from '../../hooks/useActivities';
import { useTransports } from '../../hooks/useTransports';
import { differenceInDays, parseISO } from 'date-fns';

const NATIONALITIES = ['Resident', 'East Africa Resident', 'Non-resident'];
const PACKAGE_TYPES = ['Bed & Breakfast', 'Half Board', 'Full Board', 'All Inclusive', 'Room Only'];
const MEAL_PLANS = ['Standard', 'Silver', 'Gold', 'Platinum', 'Chef Ferdinand'];
const BED_TYPES = ['Single', 'Double', 'Twin', 'King', 'Queen'];
const ROOM_TYPES = ['Standard Room', 'Deluxe Room', 'Suite', 'Penthouse', 'Villa 2Bedroom', 'Villa 3Bedroom'];
const TRANSPORT_MODES = ['Self Drive', 'Train', 'Flying', 'Road Package'];

export function DocumentForm({ onDiscard, initialDoc, typeFilter }: { onDiscard: () => void, initialDoc?: Document | null, typeFilter?: string | null }) {
    const { createDocument, updateDocument } = useDocuments();
    const { settings } = useSettings();
    const [isSaving, setIsSaving] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    // Form State
    const today = new Date().toISOString().split('T')[0];
    const [clientName, setClientName] = useState(initialDoc?.client || '');
    const [clientEmail, setClientEmail] = useState(initialDoc?.clientEmail || '');
    const [reference] = useState(initialDoc?.reference || `Q-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
    const [issueDate, setIssueDate] = useState(initialDoc?.date || new Date().toISOString().split('T')[0]);
    const [checkIn, setCheckIn] = useState(initialDoc?.checkIn || '');
    const [checkOut, setCheckOut] = useState(initialDoc?.checkOut || '');
    const [documentType] = useState<string>(initialDoc?.type || typeFilter || 'Quotation');

    // Voucher Metadata State
    const [unitName, setUnitName] = useState(initialDoc?.metadata?.unitName || '');
    const [numGuests, setNumGuests] = useState(initialDoc?.metadata?.numGuests || '');
    const [guestName, setGuestName] = useState(initialDoc?.metadata?.guestName || '');
    const [guestPhone, setGuestPhone] = useState(initialDoc?.metadata?.guestPhone || '');
    const [guestEmail, setGuestEmail] = useState(initialDoc?.metadata?.guestEmail || '');
    const [roomType, setRoomType] = useState(initialDoc?.metadata?.roomType || '');
    const [mealPlan, setMealPlan] = useState(initialDoc?.metadata?.mealPlan || '');
    const [paymentMethod, setPaymentMethod] = useState(initialDoc?.metadata?.paymentMethod || 'Mobile Money');
    const [checkInTime, setCheckInTime] = useState(initialDoc?.metadata?.checkInTime || '2:00pm');
    const [checkOutTime, setCheckOutTime] = useState(initialDoc?.metadata?.checkOutTime || '10:00am');
    const [propertyAddress, setPropertyAddress] = useState(initialDoc?.metadata?.propertyAddress || 'Diani, Kenya');
    const [googleMapsLink, setGoogleMapsLink] = useState(initialDoc?.metadata?.googleMapsLink || 'https://maps.google.com/');
    const [hostContact, setHostContact] = useState(initialDoc?.metadata?.hostContact || 'Coastal Soul Kenya');
    const [contactPerson, setContactPerson] = useState(initialDoc?.metadata?.contactPerson || 'Simulizi : +254794 703583');
    const [welcomeMessage, setWelcomeMessage] = useState(initialDoc?.metadata?.welcomeMessage || "We're delighted to host you along Kenya's beautiful coast. Your accommodation is ready for you to unwind, explore, and indulge in a slice of coastal charm.");
    const [directorName, setDirectorName] = useState(initialDoc?.metadata?.directorName || 'Fredrick Lorent');
    const [directorPhone, setDirectorPhone] = useState(initialDoc?.metadata?.directorPhone || '+254722605329');
    const [directorEmail, setDirectorEmail] = useState(initialDoc?.metadata?.directorEmail || 'lorent@coastalsoul.co.ke');
    const [directorWebsite, setDirectorWebsite] = useState(initialDoc?.metadata?.directorWebsite || 'https://coastalsoul.co.ke/');
    const [servedBy, setServedBy] = useState(initialDoc?.metadata?.servedBy || 'Fredrick');
    const [whatsIncluded, setWhatsIncluded] = useState<string[]>(initialDoc?.metadata?.whatsIncluded || ['Accommodation', 'Housekeeping', 'Towels and linen', 'Access to pool', 'Exclusive House use', 'Wi-Fi', 'Chef']);
    const [needToKnow, setNeedToKnow] = useState<string[]>(initialDoc?.metadata?.needToKnow || ['Please carry valid identification for check-in.', 'Any damages will be assessed at check-out.', 'Additional services (excursions, transfers) are available on request.', 'Restaurant bills, tips, and personal purchases are not included in your stay.']);

    // Booking Voucher Specific State
    const [nationality, setNationality] = useState(initialDoc?.metadata?.nationality || '');
    const [additionalGuestInfo, setAdditionalGuestInfo] = useState(initialDoc?.metadata?.additionalGuestInfo || '');
    const [packageType, setPackageType] = useState(initialDoc?.metadata?.packageType || '');
    const [rooms, setRooms] = useState<any[]>(
        initialDoc?.metadata?.rooms || [{ roomType: '', adults: 2, children: 0, childAges: [], bedType: '' }]
    );
    const [arrivalTransport, setArrivalTransport] = useState(initialDoc?.metadata?.arrivalTransport || '');
    const [departureTransport, setDepartureTransport] = useState(initialDoc?.metadata?.departureTransport || '');
    const [transportNote, setTransportNote] = useState(initialDoc?.metadata?.transportNote || '');
    const [dietaryRequests, setDietaryRequests] = useState(initialDoc?.metadata?.dietaryRequests || '');
    const [specialRequests, setSpecialRequests] = useState(initialDoc?.metadata?.specialRequests || '');

    const { properties } = useProperties();
    const { activities } = useActivities();
    const { transports } = useTransports();
    const [activeSelection, setActiveSelection] = useState<{ id: number, type: 'category' | 'hotel' | 'activity' | 'transport' } | null>(null);

    const nights = (checkIn && checkOut) ? Math.max(0, differenceInDays(parseISO(checkOut), parseISO(checkIn))) : 0;

    const handleAddRoom = () => {
        setRooms([...rooms, { roomType: '', adults: 2, children: 0, childAges: [], bedType: '' }]);
    };

    const handleRemoveRoom = (index: number) => {
        if (rooms.length > 1) {
            setRooms(rooms.filter((_, i) => i !== index));
        }
    };

    const updateRoom = (index: number, updates: any) => {
        setRooms(prevRooms => {
            const nextRooms = [...prevRooms];
            nextRooms[index] = { ...nextRooms[index], ...updates };
            return nextRooms;
        });
    };

    const [lineItems, setLineItems] = useState<any[]>(
        initialDoc?.lineItems && initialDoc.lineItems.length > 0
            ? initialDoc.lineItems
            : [{ id: 1, description: '', quantity: 1, unitPrice: 0 }]
    );

    const addLineItem = () => {
        setLineItems([...lineItems, { id: Date.now(), description: '', quantity: 1, unitPrice: 0 }]);
    };

    const removeLineItem = (id: number) => {
        if (lineItems.length === 1) return; // Prevent removing the last item
        setLineItems(lineItems.filter(item => item.id !== id));
    };

    const updateLineItem = (id: number, field: string, value: string | number) => {
        setLineItems(lineItems.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handlePreview = async () => {
        setIsGeneratingPDF(true);
        try {
            const doc = (
                <DocumentPDF
                    documentType={documentType}
                    reference={reference}
                    clientName={clientName}
                    clientEmail={clientEmail}
                    date={issueDate}
                    checkIn={checkIn}
                    checkOut={checkOut}
                    lineItems={lineItems}
                    metadata={(documentType === 'Voucher' || documentType === 'Booking') ? {
                        unitName, numGuests, guestName, guestPhone, guestEmail,
                        roomType, mealPlan, paymentMethod,
                        checkInTime, checkOutTime, propertyAddress, googleMapsLink,
                        hostContact, contactPerson, welcomeMessage,
                        directorName, directorPhone, directorEmail, directorWebsite,
                        servedBy, whatsIncluded, needToKnow,
                        // Booking specific
                        nationality, additionalGuestInfo, packageType, rooms,
                        arrivalTransport, departureTransport, transportNote,
                        dietaryRequests, specialRequests
                    } : {}}
                    settings={settings}
                />
            );
            const blob = await pdf(doc).toBlob();
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            console.error('Error generating preview:', error);
            alert('Could not generate PDF preview. Please try again.');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const handleDownload = async () => {
        setIsGeneratingPDF(true);
        try {
            const fileName = `${clientName.replace(/[^a-zA-Z0-9 -]/g, '')}-${(lineItems?.[0]?.description || 'Document').replace(/[^a-zA-Z0-9 -]/g, '')}-${reference.replace(/[^a-zA-Z0-9 -]/g, '')}.pdf`;

            const doc = (
                <DocumentPDF
                    documentType={documentType}
                    reference={reference}
                    clientName={clientName}
                    clientEmail={clientEmail}
                    date={issueDate}
                    checkIn={checkIn}
                    checkOut={checkOut}
                    lineItems={lineItems}
                    metadata={documentType === 'Voucher' || documentType === 'Booking' ? {
                        unitName, numGuests, guestName, guestPhone, guestEmail,
                        roomType, mealPlan, paymentMethod,
                        checkInTime, checkOutTime, propertyAddress, googleMapsLink,
                        hostContact, contactPerson, welcomeMessage,
                        directorName, directorPhone, directorEmail, directorWebsite,
                        servedBy, whatsIncluded, needToKnow,
                        nationality, additionalGuestInfo, packageType, rooms,
                        arrivalTransport, departureTransport, transportNote,
                        dietaryRequests, specialRequests
                    } : {}}
                    settings={settings}
                />
            );

            const blob = await pdf(doc).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert('Could not download PDF. Please try again.');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const subtotal = lineItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

    const handleSave = async () => {
        const finalClientName = (documentType === 'Booking' || documentType === 'Voucher') ? (guestName || clientName) : clientName;
        // Use guestPhone as backup for email for Bookings if email is empty
        const finalClientEmail = (documentType === 'Booking' || documentType === 'Voucher') ? (guestEmail || guestPhone || clientEmail) : clientEmail;

        if (!finalClientName || !finalClientEmail || !reference || !issueDate) {
            alert('Please fill in all document details (Client Name, Email, Reference, Date).');
            return;
        }

        if (documentType !== 'Voucher' && documentType !== 'Booking' && (lineItems.length === 0 || !lineItems[0].description)) {
            alert('Please provide a description for your line items.');
            return;
        }

        setIsSaving(true);

        const metadata = (documentType === 'Voucher' || documentType === 'Booking') ? {
            unitName, numGuests, guestName, guestPhone, guestEmail,
            roomType, mealPlan, paymentMethod,
            checkInTime, checkOutTime, propertyAddress, googleMapsLink,
            hostContact, contactPerson, welcomeMessage,
            directorName, directorPhone, directorEmail, directorWebsite,
            servedBy, whatsIncluded, needToKnow,
            // Booking specific
            nationality, additionalGuestInfo, packageType, rooms,
            arrivalTransport, departureTransport, transportNote,
            dietaryRequests, specialRequests
        } : {};

        let errorMsg = null;
        if (initialDoc?.id) {
            const { error } = await updateDocument(initialDoc.id, {
                reference,
                client_name: finalClientName,
                client_email: finalClientEmail,
                amount: subtotal,
                issue_date: issueDate,
                check_in: checkIn || null,
                check_out: checkOut || null,
                line_items: lineItems,
                metadata: metadata
            });
            errorMsg = error;
        } else {
            const { error } = await createDocument({
                reference,
                type: documentType,
                client_name: finalClientName,
                client_email: finalClientEmail,
                amount: subtotal,
                status: 'pending',
                issue_date: issueDate,
                check_in: checkIn || null,
                check_out: checkOut || null,
                line_items: lineItems,
                metadata: metadata
            });
            errorMsg = error;
        }

        setIsSaving(false);
        if (errorMsg) {
            alert('Error saving document: ' + errorMsg);
        } else {
            onDiscard();
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onDiscard}
                        disabled={isSaving}
                        className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors disabled:opacity-50"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            {initialDoc ? 'Edit ' : 'New '}
                            {documentType === 'Voucher' ? 'Confirmation' : documentType === 'Booking' ? 'Booking' : documentType}
                        </h1>
                        <p className="text-slate-500 text-sm mt-0.5">
                            {documentType === 'Booking' ? 'Create a new reservation voucher' :
                                documentType === 'Voucher' ? 'Create a new confirmation voucher' :
                                    documentType === 'Invoice' ? 'Generate a new tax invoice for your client' :
                                        documentType === 'Quotation' ? 'Generate a new travel quotation for your client' :
                                            'Generate a new branded document for your client.'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handlePreview}
                        disabled={isGeneratingPDF}
                        className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl transition-all duration-150 shadow-sm font-medium disabled:opacity-50"
                        title="Preview PDF"
                    >
                        {isGeneratingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                        Preview PDF
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={isGeneratingPDF}
                        className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl transition-all duration-150 shadow-sm font-medium disabled:opacity-50"
                    >
                        {isGeneratingPDF ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-4 h-4" />}
                        Download PDF
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl transition-all duration-150 shadow-sm hover:shadow active:scale-95 font-medium disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {initialDoc ? 'Save Changes' : `Save ${documentType === 'Voucher' || documentType === 'Booking' ? 'Voucher' : documentType}`}
                    </button>
                </div>
            </div>

            {documentType !== 'Booking' && documentType !== 'Voucher' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Client Details */}
                            <div className="space-y-4">
                                <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">Client Details</h3>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Client Name</label>
                                        <input
                                            type="text"
                                            value={clientName}
                                            onChange={(e) => setClientName(e.target.value)}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                                            placeholder="e.g. Sarah Jenkins"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Email Address</label>
                                        <input
                                            type="email"
                                            value={clientEmail}
                                            onChange={(e) => setClientEmail(e.target.value)}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                                            placeholder="sarah@example.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Document Details (Quotation/Invoice) or Reservation Details (Voucher) */}
                            <div className="space-y-4">
                                {documentType !== 'Voucher' ? (
                                    <>
                                        <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">Document Details</h3>
                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-slate-700">Issue Date</label>
                                                <input
                                                    type="date"
                                                    value={issueDate}
                                                    onChange={(e) => setIssueDate(e.target.value)}
                                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900 cursor-pointer"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-medium text-slate-700">Check-in Date</label>
                                                    <input
                                                        type="date"
                                                        value={checkIn}
                                                        onChange={(e) => setCheckIn(e.target.value)}
                                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900 cursor-pointer"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-medium text-slate-700">Check-out Date</label>
                                                    <input
                                                        type="date"
                                                        value={checkOut}
                                                        onChange={(e) => setCheckOut(e.target.value)}
                                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900 cursor-pointer"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">Reservation Details</h3>
                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-slate-700">Name of Unit</label>
                                                <input
                                                    type="text"
                                                    value={unitName}
                                                    onChange={(e) => setUnitName(e.target.value)}
                                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                                                    placeholder="e.g. VILLA SIMULIZI"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-slate-700">Number of Guests</label>
                                                <input
                                                    type="text"
                                                    value={numGuests}
                                                    onChange={(e) => setNumGuests(e.target.value)}
                                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                                                    placeholder="e.g. 4"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-medium text-slate-700">Check-in Time</label>
                                                    <input
                                                        type="text"
                                                        value={checkInTime}
                                                        onChange={(e) => setCheckInTime(e.target.value)}
                                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                                                        placeholder="2:00pm"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-medium text-slate-700">Check-out Time</label>
                                                    <input
                                                        type="text"
                                                        value={checkOutTime}
                                                        onChange={(e) => setCheckOutTime(e.target.value)}
                                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                                                        placeholder="10:00am"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Sign-off & Director Details (Standard for all) */}
                            {documentType !== 'Quotation' && documentType !== 'Booking' && (
                                <div className="space-y-4">
                                    <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">Sign-off & Agency Info</h3>
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700">Served By</label>
                                            <input
                                                type="text"
                                                value={servedBy}
                                                onChange={(e) => setServedBy(e.target.value)}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700">Director Name</label>
                                            <input
                                                type="text"
                                                value={directorName}
                                                onChange={(e) => setDirectorName(e.target.value)}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700">Director Email</label>
                                            <input
                                                type="email"
                                                value={directorEmail}
                                                onChange={(e) => setDirectorEmail(e.target.value)}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-slate-700">Director Phone</label>
                                                <input
                                                    type="text"
                                                    value={directorPhone}
                                                    onChange={(e) => setDirectorPhone(e.target.value)}
                                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-slate-700">Director Website</label>
                                                <input
                                                    type="text"
                                                    value={directorWebsite}
                                                    onChange={(e) => setDirectorWebsite(e.target.value)}
                                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Extended Confirmation Voucher Sections */}
            {documentType === 'Voucher' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-8">
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">Guest Details</h3>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Guest Name</label>
                                        <input
                                            type="text"
                                            value={guestName}
                                            onChange={(e) => setGuestName(e.target.value)}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                                            placeholder="Main guest name"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Guest Phone</label>
                                        <input
                                            type="text"
                                            value={guestPhone}
                                            onChange={(e) => setGuestPhone(e.target.value)}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                                            placeholder="+254..."
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Guest Email</label>
                                        <input
                                            type="email"
                                            value={guestEmail}
                                            onChange={(e) => setGuestEmail(e.target.value)}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                                            placeholder="guest@example.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Rate & Finance */}
                            <div className="space-y-4">
                                <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">Rate & Finance</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700">Room Type</label>
                                            <input
                                                type="text"
                                                value={roomType}
                                                onChange={(e) => setRoomType(e.target.value)}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                                                placeholder="e.g. 2Bedroom"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700">Meal Plan</label>
                                            <input
                                                type="text"
                                                value={mealPlan}
                                                onChange={(e) => setMealPlan(e.target.value)}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                                                placeholder="e.g. Chef Ferdinand"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5 col-span-2">
                                            <label className="text-sm font-medium text-slate-700">Payment Method</label>
                                            <input
                                                type="text"
                                                value={paymentMethod}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div >

                            {/* Location & Host */}
                            <div className="space-y-4">
                                <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">Location & Host</h3>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Property Address</label>
                                        <input
                                            type="text"
                                            value={propertyAddress}
                                            onChange={(e) => setPropertyAddress(e.target.value)}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Google Maps Link</label>
                                        <input
                                            type="text"
                                            value={googleMapsLink}
                                            onChange={(e) => setGoogleMapsLink(e.target.value)}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Host Contact</label>
                                        <input
                                            type="text"
                                            value={hostContact}
                                            onChange={(e) => setHostContact(e.target.value)}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                                            placeholder="Host phone/email"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Contact Person</label>
                                        <input
                                            type="text"
                                            value={contactPerson}
                                            onChange={(e) => setContactPerson(e.target.value)}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                                        />
                                    </div>
                                </div>
                            </div >

                            {/* Additional Info Lists */}
                            <div className="space-y-4 lg:col-span-2">
                                <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">Lists & Notes</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-slate-700 flex justify-between">
                                            What's Included
                                            <button
                                                onClick={() => setWhatsIncluded([...whatsIncluded, ''])}
                                                className="text-[10px] text-brand-600 hover:text-brand-700 font-bold uppercase"
                                            >+ Add Item</button>
                                        </label>
                                        <div className="space-y-2">
                                            {whatsIncluded.map((item, idx) => (
                                                <div key={idx} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={item}
                                                        onChange={(e) => {
                                                            const newItems = [...whatsIncluded];
                                                            newItems[idx] = e.target.value;
                                                            setWhatsIncluded(newItems);
                                                        }}
                                                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium"
                                                    />
                                                    <button
                                                        onClick={() => setWhatsIncluded(whatsIncluded.filter((_, i) => i !== idx))}
                                                        className="text-slate-400 hover:text-rose-500"
                                                    >×</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-slate-700 flex justify-between">
                                            Need to Know
                                            <button
                                                onClick={() => setNeedToKnow([...needToKnow, ''])}
                                                className="text-[10px] text-brand-600 hover:text-brand-700 font-bold uppercase"
                                            >+ Add Item</button>
                                        </label>
                                        <div className="space-y-2">
                                            {needToKnow.map((item, idx) => (
                                                <div key={idx} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={item}
                                                        onChange={(e) => {
                                                            const newItems = [...needToKnow];
                                                            newItems[idx] = e.target.value;
                                                            setNeedToKnow(newItems);
                                                        }}
                                                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium"
                                                    />
                                                    <button
                                                        onClick={() => setNeedToKnow(needToKnow.filter((_, i) => i !== idx))}
                                                        className="text-slate-400 hover:text-rose-500"
                                                    >×</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1.5 pt-4">
                                    <label className="text-sm font-medium text-slate-700">Welcome Message</label>
                                    <textarea
                                        value={welcomeMessage}
                                        onChange={(e) => setWelcomeMessage(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Booking Voucher Specific Sections */}
            {
                documentType === 'Booking' && (
                    <div className="space-y-12 pt-12 mt-12 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* Guest Information & Stay Details Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* Guest Information */}
                            <div className="bg-slate-50/30 p-8 rounded-3xl border border-slate-100/80 shadow-sm space-y-6">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                    <h3 className="text-base font-semibold text-slate-900">Guest Information</h3>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Step 1</span>
                                </div>
                                <p className="text-slate-500 text-xs -mt-2">Primary contact details for the reservation.</p>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Guest Name</label>
                                        <input
                                            type="text"
                                            value={guestName}
                                            onChange={(e) => setGuestName(e.target.value)}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                                            placeholder="e.g. John Doe"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700">Nationality</label>
                                            <select
                                                value={nationality}
                                                onChange={(e) => setNationality(e.target.value)}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                                            >
                                                <option value="">Select Nationality</option>
                                                {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700">Contact Info</label>
                                            <input
                                                type="text"
                                                value={guestPhone}
                                                onChange={(e) => setGuestPhone(e.target.value)}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                                                placeholder="Phone or Email"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Additional Guest Information</label>
                                        <textarea
                                            value={additionalGuestInfo}
                                            onChange={(e) => setAdditionalGuestInfo(e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                                            placeholder="Any additional details about the guest..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Stay Details */}
                            <div className="bg-slate-50/30 p-8 rounded-3xl border border-slate-100/80 shadow-sm space-y-6">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                    <h3 className="text-base font-semibold text-slate-900">Stay Details</h3>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Step 2</span>
                                </div>
                                <p className="text-slate-500 text-xs -mt-2">Property, dates, and room configuration.</p>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700">Property</label>
                                            <div className="flex gap-2">
                                                <select
                                                    value={unitName}
                                                    onChange={(e) => setUnitName(e.target.value)}
                                                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                                                >
                                                    <option value="">Select a property</option>
                                                    {properties.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700">Issue Date</label>
                                            <input
                                                type="date"
                                                value={issueDate}
                                                onChange={(e) => setIssueDate(e.target.value)}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700">Check In</label>
                                            <input
                                                type="date"
                                                value={checkIn}
                                                min={today}
                                                onChange={(e) => setCheckIn(e.target.value)}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900 cursor-pointer"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700">Check Out</label>
                                            <input
                                                type="date"
                                                value={checkOut}
                                                min={checkIn || today}
                                                onChange={(e) => setCheckOut(e.target.value)}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700">Package Type</label>
                                            <select
                                                value={packageType}
                                                onChange={(e) => setPackageType(e.target.value)}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                                            >
                                                <option value="">Select Package Type</option>
                                                {PACKAGE_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700">Meal Plan</label>
                                            <select
                                                value={mealPlan}
                                                onChange={(e) => setMealPlan(e.target.value)}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-900"
                                            >
                                                <option value="">Select Meal Plan</option>
                                                {MEAL_PLANS.map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* Room Configuration Section */}
                        <div className="bg-slate-50/30 p-8 rounded-3xl border border-slate-100/80 shadow-sm space-y-8">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <h3 className="text-lg font-bold text-slate-900">Room Configuration</h3>
                                <button
                                    onClick={handleAddRoom}
                                    className="flex items-center gap-2 bg-brand-50 hover:bg-brand-100 text-brand-600 px-4 py-2 rounded-xl transition-all duration-150 font-bold text-[11px] uppercase tracking-wider"
                                >
                                    <Plus className="w-4 h-4" /> Add Room
                                </button>
                            </div>
                            <div className="space-y-4">

                                <div className="grid grid-cols-1 gap-6">
                                    {rooms.map((room, idx) => (
                                        <div key={idx} className="relative p-8 bg-white border border-slate-200 rounded-2xl group transition-all hover:shadow-md hover:border-brand-200">
                                            <div className="absolute top-6 right-8 text-[11px] font-black text-slate-300 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full uppercase tracking-tighter">
                                                ROOM {idx + 1}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Room Type</label>
                                                    <select
                                                        value={room.roomType}
                                                        onChange={(e) => updateRoom(idx, { roomType: e.target.value })}
                                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium text-sm"
                                                    >
                                                        <option value="">Select Room</option>
                                                        {unitName && (properties.find(p => p.name === unitName)?.room_types?.map(rt => rt.name) || ROOM_TYPES).map(r => (
                                                            <option key={r} value={r}>{r}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Adults</label>
                                                    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-2 py-1">
                                                        <button
                                                            onClick={() => updateRoom(idx, { adults: Math.max(1, room.adults - 1) })}
                                                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-all text-xl"
                                                        >-</button>
                                                        <span className="flex-1 text-center font-bold text-slate-900">{room.adults}</span>
                                                        <button
                                                            onClick={() => updateRoom(idx, { adults: room.adults + 1 })}
                                                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-all text-xl"
                                                        >+</button>
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Children</label>
                                                    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-2 py-1">
                                                        <button
                                                            onClick={() => {
                                                                const count = Math.max(0, room.children - 1);
                                                                const ages = [...(room.childAges || [])];
                                                                if (ages.length > count) ages.pop();
                                                                updateRoom(idx, { children: count, childAges: ages });
                                                            }}
                                                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-all text-xl"
                                                        >-</button>
                                                        <span className="flex-1 text-center font-bold text-slate-900">{room.children}</span>
                                                        <button
                                                            onClick={() => {
                                                                const count = room.children + 1;
                                                                const ages = [...(room.childAges || [])];
                                                                ages.push("");
                                                                updateRoom(idx, { children: count, childAges: ages });
                                                            }}
                                                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-all text-xl"
                                                        >+</button>
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bed Type</label>
                                                    <select
                                                        value={room.bedType}
                                                        onChange={(e) => updateRoom(idx, { bedType: e.target.value })}
                                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium text-sm"
                                                    >
                                                        <option value="">Select Bed Type</option>
                                                        {BED_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Child Ages Section */}
                                            {room.children > 0 && (
                                                <div className="mt-8 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                                                    <div className="flex flex-col gap-4">
                                                        <label className="text-sm font-italic text-slate-400 italic">Child age at time of travel</label>
                                                        <div className="flex flex-wrap gap-4">
                                                            {Array.from({ length: room.children }).map((_, cIdx) => (
                                                                <div key={cIdx} className="space-y-1.5 flex-1 min-w-[200px]">
                                                                    <select
                                                                        value={room.childAges?.[cIdx] || ""}
                                                                        onChange={(e) => {
                                                                            const newAges = [...(room.childAges || [])];
                                                                            newAges[cIdx] = e.target.value;
                                                                            updateRoom(idx, { childAges: newAges });
                                                                        }}
                                                                        className="w-full px-4 py-2.5 bg-white border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium text-sm text-slate-700 shadow-sm"
                                                                    >
                                                                        <option value="">Select Child {cIdx + 1} Age</option>
                                                                        {[...Array(10)].map((_, i) => (
                                                                            <option key={i + 1} value={i + 1}>{i + 1} {i + 1 === 1 ? 'Year' : 'Years'}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {rooms.length > 1 && (
                                                <button
                                                    onClick={() => handleRemoveRoom(idx)}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-slate-200 rounded-full text-rose-500 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 hover:bg-rose-50 transition-all"
                                                >×</button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Transport Details & Additional Information Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* Transport Details */}
                            <div className="bg-slate-50/30 p-8 rounded-3xl border border-slate-100/80 shadow-sm space-y-6">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                    <h3 className="text-lg font-bold text-slate-900">Transport Details</h3>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Step 3</span>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Arrival Transfer</label>
                                        <select
                                            value={arrivalTransport}
                                            onChange={(e) => setArrivalTransport(e.target.value)}
                                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium text-slate-900"
                                        >
                                            <option value="">Select Mode</option>
                                            {TRANSPORT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Departure Transfer</label>
                                        <select
                                            value={departureTransport}
                                            onChange={(e) => setDepartureTransport(e.target.value)}
                                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium text-slate-900"
                                        >
                                            <option value="">Select Mode</option>
                                            {TRANSPORT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Transport Notes</label>
                                    <textarea
                                        value={transportNote}
                                        onChange={(e) => setTransportNote(e.target.value)}
                                        rows={2}
                                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all font-medium text-slate-900"
                                        placeholder="e.g. Flight numbers, specific timings..."
                                    />
                                </div>
                            </div>

                            {/* Additional Information */}
                            <div className="bg-slate-50/30 p-8 rounded-3xl border border-slate-100/80 shadow-sm space-y-6">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                    <h3 className="text-lg font-bold text-slate-900">Additional Information</h3>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Step 4</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Dietary Requirements</label>
                                        <textarea
                                            value={dietaryRequests}
                                            onChange={(e) => setDietaryRequests(e.target.value)}
                                            rows={2}
                                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all font-medium text-slate-900"
                                            placeholder="e.g. Allergic to peanuts, Vegetarian..."
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-700">Special Notes</label>
                                        <textarea
                                            value={specialRequests}
                                            onChange={(e) => setSpecialRequests(e.target.value)}
                                            rows={2}
                                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all font-medium text-slate-900"
                                            placeholder="e.g. Booking for a Honeymoon, late arrival..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div >
                )
            }
            {
                documentType === 'Invoice' && (
                    <div className="mt-10 space-y-4">
                        <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">Line Items</h3>
                        <div className="space-y-3">
                            <div className="grid grid-cols-12 gap-3 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                <div className="col-span-6">Description</div>
                                <div className="col-span-2">Quantity</div>
                                <div className="col-span-2">Unit Price</div>
                                <div className="col-span-2 text-right">Amount</div>
                            </div>

                            {lineItems.map((item) => (
                                <div key={item.id} className="relative bg-slate-50 p-2 pl-4 rounded-xl border border-slate-100">
                                    <div className="grid grid-cols-12 gap-3 items-center">
                                        <div className="col-span-6 relative">
                                            <input
                                                type="text"
                                                value={item.description}
                                                onFocus={() => setActiveSelection({ id: item.id, type: 'category' })}
                                                onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                                                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 p-0 font-medium text-slate-900 placeholder:text-slate-400 text-sm"
                                                placeholder="Enter description"
                                            />

                                            {/* Category Selection Dropdown */}
                                            {activeSelection?.id === item.id && activeSelection?.type === 'category' && (
                                                <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                    <div className="p-2 border-b border-slate-50">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">Select Category</span>
                                                    </div>
                                                    <div className="p-1">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveSelection({ id: item.id, type: 'hotel' });
                                                            }}
                                                            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 group transition-colors"
                                                        >
                                                            <span className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center text-xs group-hover:bg-amber-100 italic font-serif">H</span>
                                                            Hotels
                                                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-slate-200" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveSelection({ id: item.id, type: 'transport' });
                                                            }}
                                                            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 group transition-colors"
                                                        >
                                                            <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-xs group-hover:bg-blue-100">🚗</span>
                                                            Transport
                                                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-slate-200" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveSelection({ id: item.id, type: 'activity' });
                                                            }}
                                                            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 group transition-colors"
                                                        >
                                                            <span className="w-6 h-6 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center text-xs group-hover:bg-rose-100">🧗</span>
                                                            Activities
                                                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-slate-200" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Hotel Selection Dropdown */}
                                            {activeSelection?.id === item.id && activeSelection?.type === 'hotel' && (
                                                <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                    <div className="p-2 border-b border-slate-50 flex items-center justify-between">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">Pick a Hotel</span>
                                                        <button onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveSelection({ id: item.id, type: 'category' });
                                                        }} className="text-[10px] text-brand-600 hover:underline px-2">Back</button>
                                                    </div>
                                                    <div className="p-1 max-h-64 overflow-y-auto">
                                                        {properties.length === 0 ? (
                                                            <div className="p-4 text-center text-slate-400 text-xs italic">No hotels found. Add some in Properties first.</div>
                                                        ) : (
                                                            properties.map(hotel => (
                                                                <button
                                                                    key={hotel.id}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const desc = `${hotel.name} (${nights} nights)`;
                                                                        setLineItems(lineItems.map(li =>
                                                                            li.id === item.id
                                                                                ? { ...li, description: desc, quantity: nights || 1, unitPrice: hotel.base_price }
                                                                                : li
                                                                        ));
                                                                        setActiveSelection(null);
                                                                    }}
                                                                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                                                >
                                                                    <div className="font-semibold text-slate-900">{hotel.name}</div>
                                                                    <div className="text-[10px] text-slate-500 font-normal">{hotel.location} • ${hotel.base_price}/night</div>
                                                                </button>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Activity Selection Dropdown */}
                                            {activeSelection?.id === item.id && activeSelection?.type === 'activity' && (
                                                <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                    <div className="p-2 border-b border-slate-50 flex items-center justify-between">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">Pick an Activity</span>
                                                        <button onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveSelection({ id: item.id, type: 'category' });
                                                        }} className="text-[10px] text-brand-600 hover:underline px-2">Back</button>
                                                    </div>
                                                    <div className="p-1 max-h-64 overflow-y-auto">
                                                        {activities.length === 0 ? (
                                                            <div className="p-4 text-center text-slate-400 text-xs italic">No activities found. Add some in Activities first.</div>
                                                        ) : (
                                                            activities.map(activity => (
                                                                <button
                                                                    key={activity.id}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const desc = `Activity: ${activity.name}`;
                                                                        setLineItems(lineItems.map(li =>
                                                                            li.id === item.id
                                                                                ? { ...li, description: desc, quantity: 1, unitPrice: activity.price }
                                                                                : li
                                                                        ));
                                                                        setActiveSelection(null);
                                                                    }}
                                                                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                                                >
                                                                    <div className="font-semibold text-slate-900">{activity.name}</div>
                                                                    <div className="text-[10px] text-slate-500 font-normal">{activity.location} • ${activity.price}</div>
                                                                </button>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Transport Selection Dropdown */}
                                            {activeSelection?.id === item.id && activeSelection?.type === 'transport' && (
                                                <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                    <div className="p-2 border-b border-slate-50 flex items-center justify-between">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">Pick Transport</span>
                                                        <button onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveSelection({ id: item.id, type: 'category' });
                                                        }} className="text-[10px] text-brand-600 hover:underline px-2">Back</button>
                                                    </div>
                                                    <div className="p-1 max-h-64 overflow-y-auto">
                                                        {transports.length === 0 ? (
                                                            <div className="p-4 text-center text-slate-400 text-xs italic">No transport options found. Add some in Transport first.</div>
                                                        ) : (
                                                            transports.map(transport => (
                                                                <button
                                                                    key={transport.id}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const desc = `Transport: ${transport.name} (${transport.vehicle_type})`;
                                                                        setLineItems(lineItems.map(li =>
                                                                            li.id === item.id
                                                                                ? { ...li, description: desc, quantity: 1, unitPrice: transport.price_per_way }
                                                                                : li
                                                                        ));
                                                                        setActiveSelection(null);
                                                                    }}
                                                                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                                                >
                                                                    <div className="font-semibold text-slate-900">{transport.name}</div>
                                                                    <div className="text-[10px] text-slate-500 font-normal">{transport.vehicle_type} • ${transport.price_per_way}</div>
                                                                </button>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateLineItem(item.id, 'quantity', Number(e.target.value))}
                                                className="w-20 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">$</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.unitPrice}
                                                    onChange={(e) => updateLineItem(item.id, 'unitPrice', Number(e.target.value))}
                                                    className="w-full bg-white border border-slate-200 rounded-lg pl-6 pr-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-span-2 flex items-center justify-end gap-3 pr-2">
                                            <span className="font-semibold text-slate-900 text-sm">
                                                ${(item.quantity * item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                            <button
                                                onClick={() => removeLineItem(item.id)}
                                                disabled={lineItems.length === 1}
                                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button onClick={addLineItem} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-brand-600 hover:border-brand-300 hover:bg-brand-50 transition-all flex items-center justify-center gap-2 font-medium text-sm mt-4">
                                <Plus className="w-4 h-4" />
                                Add Line Item
                            </button>
                        </div>

                        <div className="flex justify-end pt-6">
                            <div className="w-64 space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex justify-between text-sm font-medium text-slate-600">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-200 pt-3">
                                    <span>Total Amount</span>
                                    <span>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
