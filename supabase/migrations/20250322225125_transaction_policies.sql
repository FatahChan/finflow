-- Allow users to view transactions from accounts they own
CREATE POLICY "Users can view their account transactions" 
ON transaction
FOR SELECT 
TO authenticated
USING (
  account_id IN (
    SELECT id 
    FROM account 
    WHERE user_id = (SELECT auth.uid())
  )
);

-- Allow users to insert transactions into accounts they own
CREATE POLICY "Users can add transactions to their accounts" 
ON transaction
FOR INSERT 
TO authenticated
WITH CHECK (
  account_id IN (
    SELECT id 
    FROM account 
    WHERE user_id = (SELECT auth.uid())
  )
);

-- Allow users to update their own transactions
CREATE POLICY "Users can update their own transactions" 
ON transaction
FOR UPDATE 
TO authenticated
USING (
  account_id IN (
    SELECT id 
    FROM account 
    WHERE user_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  account_id IN (
    SELECT id 
    FROM account 
    WHERE user_id = (SELECT auth.uid())
  )
);

-- Allow users to delete their own transactions
CREATE POLICY "Users can delete their own transactions" 
ON transaction
FOR DELETE 
TO authenticated
USING (
  account_id IN (
    SELECT id 
    FROM account 
    WHERE user_id = (SELECT auth.uid())
  )
);