#!/bin/bash

# Supabase migration execution script

echo "Executing Bachelo database migrations..."

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo "psql is not installed. Please install PostgreSQL client tools."
    exit 1
fi

# Database connection details
DB_HOST="db.dleqvbspjouczytoukctv.supabase.co"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"

echo "Please enter your Supabase database password:"
read -s DB_PASSWORD

# Execute the migration
psql "postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME" -f ./supabase/execute-all-migrations-complete.sql

if [ $? -eq 0 ]; then
    echo "Migration completed successfully!"
else
    echo "Migration failed. Please check the error messages above."
fi