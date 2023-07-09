#!/bin/bash -ex

cp tmp/* . -r
rm tmp/ -rf
npm install
cp .env.sample .env
