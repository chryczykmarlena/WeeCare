-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Extends auth.users)
-- Note: We generally just use auth.users, but for app-specific user data like "Parent Name", we might want a table. 
-- For simplicity as per PRD "easy", we'll just check auth.uid().

-- 2. CHILDREN
create table public.children (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  dob date not null,
  allergies text[] default '{}',
  photo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.children enable row level security;

create policy "Users can view their own children"
  on public.children for select
  using (auth.uid() = user_id);

create policy "Users can insert their own children"
  on public.children for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own children"
  on public.children for update
  using (auth.uid() = user_id);

create policy "Users can delete their own children"
  on public.children for delete
  using (auth.uid() = user_id);


-- 3. DOCTORS
create table public.doctors (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  specialty text,
  phone text,
  email text,
  address text,
  notes text, -- "My own opinions about doctors"
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.doctors enable row level security;

create policy "Users can view their own doctors"
  on public.doctors for select
  using (auth.uid() = user_id);

create policy "Users can insert their own doctors"
  on public.doctors for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own doctors"
  on public.doctors for update
  using (auth.uid() = user_id);

create policy "Users can delete their own doctors"
  on public.doctors for delete
  using (auth.uid() = user_id);


-- 4. MEDICATIONS
create table public.medications (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references public.children(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null, -- Denormalized for easier RLS
  name text not null,
  dosage text,
  frequency text,
  start_date date not null,
  end_date date,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.medications enable row level security;

create policy "Users can view medications for their children"
  on public.medications for select
  using (auth.uid() = user_id);

create policy "Users can insert medications for their children"
  on public.medications for insert
  with check (auth.uid() = user_id);

create policy "Users can update medications for their children"
  on public.medications for update
  using (auth.uid() = user_id);

create policy "Users can delete medications for their children"
  on public.medications for delete
  using (auth.uid() = user_id);


-- 5. VISITS
create table public.visits (
  id uuid default uuid_generate_v4() primary key,
  child_id uuid references public.children(id) on delete cascade not null,
  doctor_id uuid references public.doctors(id) on delete set null,
  user_id uuid references auth.users(id) on delete cascade not null, -- Denormalized for easier RLS
  date date not null,
  reason text,
  diagnosis text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.visits enable row level security;

create policy "Users can view visits for their children"
  on public.visits for select
  using (auth.uid() = user_id);

create policy "Users can insert visits for their children"
  on public.visits for insert
  with check (auth.uid() = user_id);

create policy "Users can update visits for their children"
  on public.visits for update
  using (auth.uid() = user_id);

create policy "Users can delete visits for their children"
  on public.visits for delete
  using (auth.uid() = user_id);


-- 6. STORAGE BUCKETS
-- Note: You generally create these in the UI, but here is the SQL to policy them if buckets exist.
-- Assuming buckets 'avatars' and 'medical-records' are created.

-- Avatar Policies
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar"
  on storage.objects for insert
  with check ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

-- Medical Records Policies (Private)
create policy "Medical records are private"
  on storage.objects for select
  using ( bucket_id = 'medical-records' AND auth.uid() = owner );

create policy "Users can upload medical records"
  on storage.objects for insert
  with check ( bucket_id = 'medical-records' AND auth.uid() = owner );
