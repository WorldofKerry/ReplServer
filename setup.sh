#!/bin/bash -ex

# Directory
cp temp/.* temp/* . -r
rm temp/ -rf
rm tests/ -rf

# Env Variables
mv .env.sample .env

# Node Modules
npm install
