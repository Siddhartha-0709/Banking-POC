CREATE OR REPLACE PROCEDURE transfer_money (
    p_from_account IN NUMBER,
    p_to_account   IN NUMBER,
    p_amount       IN NUMBER
) AS
    v_balance NUMBER;
BEGIN
    -- Check balance of sender
    SELECT balance INTO v_balance 
    FROM accounts 
    WHERE account_id = p_from_account;

    IF v_balance < p_amount THEN
        RAISE_APPLICATION_ERROR(-20002, 'Insufficient balance in source account');
    END IF;

    -- Deduct from sender
    UPDATE accounts 
    SET balance = balance - p_amount 
    WHERE account_id = p_from_account;

    -- Add to receiver
    UPDATE accounts 
    SET balance = balance + p_amount 
    WHERE account_id = p_to_account;

    -- Log sender transaction
    INSERT INTO transactions (account_id, type, amount, description)
    VALUES (p_from_account, 'TRANSFER_OUT', p_amount, 'Transfer to account ' || p_to_account);

    -- Log receiver transaction
    INSERT INTO transactions (account_id, type, amount, description)
    VALUES (p_to_account, 'TRANSFER_IN', p_amount, 'Transfer from account ' || p_from_account);

    -- Insert into transfers table
    INSERT INTO transfers (from_account_id, to_account_id, amount, status)
    VALUES (p_from_account, p_to_account, p_amount, 'SUCCESS');

    COMMIT;
END;
/

