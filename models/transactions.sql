CREATE TABLE xxkpmg_transactions_tbl_bnk (
    transaction_id   NUMBER PRIMARY KEY,
    account_id       NUMBER NOT NULL,
    transaction_type VARCHAR2(20),
    status           VARCHAR2(20) CHECK (status IN ('PENDING','COMPLETED','FAILED','SUCCESS')),
    amount           NUMBER(15,2) NOT NULL CHECK (amount > 0),
    description      VARCHAR2(255),
    created_at       TIMESTAMP DEFAULT SYSTIMESTAMP,
    related_account  NUMBER,
    CONSTRAINT fk_account FOREIGN KEY (account_id) REFERENCES xxkpmg_accounts_tbl_bnk(account_id)
);

-- Create sequence for transaction_id
CREATE SEQUENCE xxkpmg_transactions_seq START WITH 1000 INCREMENT BY 1 NOCACHE;