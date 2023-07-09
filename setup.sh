#!/bin/bash -ex

cp temp/* temp/.* . -r
rm temp/ -rf
npm install
cp .env.sample .env
