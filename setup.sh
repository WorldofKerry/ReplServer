#!/bin/bash -exvu

# Project
cp temp/* temp/.* . -rf
rm temp/ -rf

# Remove Unnecessary
rm tests/ -rf
rm node_modules/ -rf

# Env Variables
cp .env.sample .env

# Node Modules
npm install
