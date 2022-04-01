#/bin/bash

for file in ./2/*
do
  basisu -ktx2 "$file" >> results.out
done
