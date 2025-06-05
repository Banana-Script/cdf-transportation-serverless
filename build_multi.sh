#!/bin/bash
root_folder="$(pwd)/apps"
folders=()
batch_size=5

# Collect all folder names
for folder in "$root_folder"/*; do
    if [ -d "$folder" ]; then
        folders+=("$folder")
    fi
done

# Print all folders
echo "Folders to be built:"

for folder in $(find "$root_folder" -mindepth 1 -maxdepth 1 -type d)
do
    folder_name=$(basename "$folder")
    echo "- :: $folder_name"
done

start_time=$(date +%s)
echo "🚀 Get ready for liftoff, developers! Process started at $(date)."

# Build folders in batches
for ((i = 0; i < ${#folders[@]}; i+=batch_size)); do
    for ((j = 0; j < batch_size && (i + j) < ${#folders[@]}; j++)); do
        folder_name=$(basename "${folders[i + j]}")
        echo "Building $folder_name..."
        nest build "$folder_name" --webpack &
    done
    wait
done

end_time=$(date +%s)
total_time=$((end_time - start_time))

echo "🎉 Touchdown! Process ended at $(date). Total time: $total_time seconds."
