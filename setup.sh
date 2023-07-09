#!/bin/bash -ex

# Directory
cp temp/* temp/.* . -r
rm temp/ -rf

# Env Variables
cp .env.sample .env

# Node Modules
npm install
