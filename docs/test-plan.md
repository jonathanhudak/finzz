# Manual Test Plan

This document outlines the steps to manually test the finance tracker application's features.

## Data Import Testing

### CSV Import
1. **Basic CSV Import**
   - Create a test CSV file with columns: date, description, amount
   - Sample content:
     ```csv
     date,description,amount
     2024-02-20,Grocery Store,-50.25
     2024-02-21,Salary,1000.00
     ```
   - Expected: Both transactions should import correctly with proper types (debit/credit)

2. **Semicolon-Delimited CSV**
   - Create a test CSV using semicolons as delimiters
   - Sample content:
     ```csv
     date;description;amount
     2024-02-20;Grocery Store;-50.25
     ```
   - Expected: Transaction should import correctly despite different delimiter

3. **Different Column Names**
   - Test CSV with variant column names:
     ```csv
     Date,Description,Amount
     2024-02-20,Grocery Store,-50.25
     ```
   - Expected: Import should work with capitalized column names

### Excel Import
1. **Basic Excel Import**
   - Create test Excel file (.xlsx) with same columns as CSV
   - Include multiple rows of transactions
   - Expected: All transactions should import correctly

2. **Legacy Excel Format**
   - Save test file in .xls format
   - Expected: Import should work with older Excel format

3. **Multiple Sheets**
   - Create Excel file with multiple sheets
   - Put transaction data in first sheet
   - Expected: Only first sheet should be imported

### Error Cases
1. **Invalid File Types**
   - Try importing a .txt file
   - Expected: Should show error about unsupported file format

2. **Malformed Data**
   - Test CSV with missing columns
   - Test Excel with empty rows
   - Test with invalid dates
   - Expected: Should handle errors gracefully

## Database Operations

### Transaction Storage
1. **Basic Storage**
   - Import a file with transactions
   - Check database file exists
   - Expected: Database file should be created with correct schema

2. **Data Retrieval**
   - Import transactions for multiple accounts
   - Retrieve transactions for specific account
   - Expected: Should only get transactions for requested account

3. **Data Integrity**
   - Import same file twice
   - Expected: No duplicate transactions (unique IDs)

## Common Test Data

### Sample CSV 