import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ueswvkitrkkkmemrxpir.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlc3d2a2l0cmtra21lbXJ4cGlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDY3Mjc0MSwiZXhwIjoyMDU2MjQ4NzQxfQ.ztffLGx_lBJ3ORU1RRR1ck1qYk7MdEZPKYRU-vQQh0A'
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
