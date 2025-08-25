CREATE OR REPLACE PROCEDURE deposit_money (
    p_account_id IN NUMBER,
    p_amount     IN NUMBER
) AS
BEGIN
    -- Update balance
    UPDATE accounts 
    SET balance = balance + p_amount 
    WHERE account_id = p_account_id;

    -- Insert into transactions
    INSERT INTO transactions (account_id, type, amount, description)
    VALUES (p_account_id, 'DEPOSIT', p_amount, 'Deposit of funds');

    COMMIT;
END;
/