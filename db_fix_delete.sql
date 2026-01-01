-- Add DELETE policy for events table
-- This allows event creators to delete their own events

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'events'
        AND policyname = 'Creators can delete their own events'
    ) THEN
        create policy "Creators can delete their own events"
          on events for delete
          using ( auth.uid() = created_by );
    END IF;
END
$$;
