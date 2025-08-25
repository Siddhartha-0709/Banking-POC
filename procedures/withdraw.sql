CREATE OR REPLACE PROCEDURE withdraw_money (
    p_account_id IN NUMBER,
    p_amount     IN NUMBER
) AS
    v_balance NUMBER;
BEGIN
    -- Check balance
    SELECT balance INTO v_balance 
    FROM accounts 
    WHERE account_id = p_account_id;

    IF v_balance < p_amount THEN
        RAISE_APPLICATION_ERROR(-20001, 'Insufficient balance');
    END IF;

    -- Deduct balance
    UPDATE accounts 
    SET balance = balance - p_amount 
    WHERE account_id = p_account_id;

    -- Insert into transactions
    INSERT INTO transactions (account_id, type, amount, description)
    VALUES (p_account_id, 'WITHDRAW', p_amount, 'Withdrawal of funds');

    COMMIT;
END;
/