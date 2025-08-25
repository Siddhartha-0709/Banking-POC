CREATE OR REPLACE FUNCTION get_balance (
    p_account_id IN NUMBER
) RETURN NUMBER AS
    v_balance NUMBER;
BEGIN
    SELECT balance INTO v_balance 
    FROM accounts 
    WHERE account_id = p_account_id;

    RETURN v_balance;
END;
/