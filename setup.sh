#!/bin/bash -ex

# Directory
cp temp/.* temp/* . -rf
rm temp/ -rf
rm tests/ -rf

# Env Variables
cp .env.sample .env

# Node Modules
npm install
