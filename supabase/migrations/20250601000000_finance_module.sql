-- Migration: Add Finance Module
-- Date: 2025-06-01

-- 1. Create Finance Accounts Table
CREATE TABLE IF NOT EXISTS public.finance_accounts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    type text NOT NULL CHECK (type IN ('M-Pesa', 'Bank', 'Cash')),
    balance numeric DEFAULT 0 NOT NULL,
    agency_id uuid REFERENCES public.agency_settings(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. Create Finance Invoices Table
CREATE TABLE IF NOT EXISTS public.finance_invoices (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
    invoice_number text NOT NULL,
    client_name text NOT NULL,
    amount numeric DEFAULT 0 NOT NULL,
    status text DEFAULT 'Unpaid' CHECK (status IN ('Unpaid', 'Partial', 'Paid')),
    issue_date date NOT NULL,
    due_date date,
    agency_id uuid REFERENCES public.agency_settings(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. Create Finance Payments Table (Money In)
CREATE TABLE IF NOT EXISTS public.finance_payments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id uuid REFERENCES public.finance_invoices(id) ON DELETE SET NULL,
    booking_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
    client_name text NOT NULL,
    amount numeric NOT NULL CHECK (amount > 0),
    method text NOT NULL CHECK (method IN ('M-Pesa', 'Bank', 'Cash')),
    payment_date date NOT NULL,
    reference_number text,
    notes text,
    account_id uuid REFERENCES public.finance_accounts(id) ON DELETE RESTRICT,
    agency_id uuid REFERENCES public.agency_settings(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 4. Create Finance Expenses Table (Money Out)
CREATE TABLE IF NOT EXISTS public.finance_expenses (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
    supplier_name text NOT NULL,
    category text DEFAULT 'General',
    amount numeric NOT NULL CHECK (amount > 0),
    status text DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid')),
    payment_method text,
    payment_date date,
    account_id uuid REFERENCES public.finance_accounts(id) ON DELETE RESTRICT,
    agency_id uuid REFERENCES public.agency_settings(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 5. Enable RLS
ALTER TABLE public.finance_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_expenses ENABLE ROW LEVEL SECURITY;

-- 6. Apply Multi-tenant RLS (Reusing the existing helper function)
SELECT public.apply_multi_tenant_rls('finance_accounts');
SELECT public.apply_multi_tenant_rls('finance_invoices');
SELECT public.apply_multi_tenant_rls('finance_payments');
SELECT public.apply_multi_tenant_rls('finance_expenses');

-- 7. Triggers to update account balances and invoice status
-- 7a. Payment updates Account Balance & Invoice Status
CREATE OR REPLACE FUNCTION public.handle_new_payment()
RETURNS trigger AS $$
DECLARE
    total_paid numeric;
    invoice_amount numeric;
BEGIN
    -- Increase Account Balance
    IF NEW.account_id IS NOT NULL THEN
        UPDATE public.finance_accounts
        SET balance = balance + NEW.amount
        WHERE id = NEW.account_id;
    END IF;

    -- Update Invoice Status
    IF NEW.invoice_id IS NOT NULL THEN
        SELECT amount INTO invoice_amount FROM public.finance_invoices WHERE id = NEW.invoice_id;
        SELECT COALESCE(SUM(amount), 0) INTO total_paid FROM public.finance_payments WHERE invoice_id = NEW.invoice_id;
        
        IF total_paid >= invoice_amount THEN
            UPDATE public.finance_invoices SET status = 'Paid' WHERE id = NEW.invoice_id;
        ELSIF total_paid > 0 THEN
            UPDATE public.finance_invoices SET status = 'Partial' WHERE id = NEW.invoice_id;
        ELSE
            UPDATE public.finance_invoices SET status = 'Unpaid' WHERE id = NEW.invoice_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_payment_created
    AFTER INSERT ON public.finance_payments
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_payment();

-- 7b. Expense updates Account Balance
CREATE OR REPLACE FUNCTION public.handle_new_expense()
RETURNS trigger AS $$
BEGIN
    -- Decrease Account Balance if Paid
    IF NEW.status = 'Paid' AND NEW.account_id IS NOT NULL THEN
        UPDATE public.finance_accounts
        SET balance = balance - NEW.amount
        WHERE id = NEW.account_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_expense_created
    AFTER INSERT ON public.finance_expenses
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_expense();

-- Note: We also need triggers for update/delete, but to keep it simple, we assume soft deletes or restricted deletes for financial records. For now, we only handle INSERT.
