#!/bin/bash -exvu

# Cleanup if error
error_handler() {
    rm temp/ -rf
    echo "An error occurred."
    exit 1
}
trap 'error_handler' ERR

# Directory
cp temp/.* temp/* . -rf
rm temp/ -rf
rm tests/ -rf
mv dc -rf

# Env Variables
cp .env.sample .env

# Node Modules
npm install
