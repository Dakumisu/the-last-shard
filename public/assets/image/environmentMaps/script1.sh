#/bin/bash

for file in ./1/*
do
  basisu -ktx2 "$file" >> results.out
done
