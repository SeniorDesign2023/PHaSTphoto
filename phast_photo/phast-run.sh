#!/bin/bash

directory1="./backend"
directory2="./frontend"
run_npm_start() {
    cd "$1" || { echo "Error: $1 directory not found"; exit 1; }
    echo "Running npm start in $(pwd)"
    npm start
}
run_npm_start "$directory1" &
run_npm_start "$directory2" &
while true; 
directoryread -t 10 -n 1 key
if [$? = 0}; then]
echo -e "\nkey is pressed. PHaSt Photo Terminated"
exit
else
echo "Waiting for keypress"
fi
done
kill %1
kill %2