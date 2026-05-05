-- Add INSERT policy for users table (needed when client creates profile)
CREATE POLICY "Users can create their own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);
