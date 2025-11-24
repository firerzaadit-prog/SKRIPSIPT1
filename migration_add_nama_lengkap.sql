-- Migration: Add nama_lengkap column to profiles table
-- Run this in Supabase SQL Editor if the column doesn't exist

-- Add nama_lengkap column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND column_name = 'nama_lengkap'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN nama_lengkap TEXT;
    END IF;
END $$;

-- Verify the column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name = 'nama_lengkap';