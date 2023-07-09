#!/bin/bash -exvu

# Directory
cp temp/* . -rf
rm temp/ -rf
rm tests/ -rf

# Env Variables
cp .env.sample .env

# Node Modules
npm install
