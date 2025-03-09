import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ueswvkitrkkkmemrxpir.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlc3d2a2l0cmtra21lbXJ4cGlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NzI3NDEsImV4cCI6MjA1NjI0ODc0MX0.21_qSMwhFGgXx4k6VnI5BUkSsD1eFKzQmAAzR9pHrX4';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
