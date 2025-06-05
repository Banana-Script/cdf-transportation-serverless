#!/usr/bin/env bash
shopt -s dotglob
find ./apps/* -prune -type d | while IFS= read -r d; do 
    arrIN=(${d//// })
    echo "running  nest build ${arrIN[2]} --webpack"
    nest build ${arrIN[2]} --webpack
done