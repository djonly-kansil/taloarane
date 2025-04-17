import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://oicqdjfpyeerovcgwnys.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pY3FkamZweWVlcm92Y2d3bnlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3OTkyNTEsImV4cCI6MjA2MDM3NTI1MX0.SIlIKg1lzadT8yCp4b4to2goneNtK08VPvEuFYSndiM";

export const supabase = createClient(supabaseUrl, supabaseKey);