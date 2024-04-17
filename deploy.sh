#!/bin/bash

set -e # stop if error occurs

echo "\nPushing local changes to the main branch..."
git push

echo "\nSwitching to gh-pages branch..."
git checkout gh-pages

echo "\nMerging main into gh-pages..."
git merge main -m "Merge main into gh-pages"

echo "\nCleaning and building new changes..."
make clean && make build

echo "\nAdding all changes to git..."
git add .

# Commit the changes only if there are changes to commit
echo "\nChecking for changes to commit..."
git diff --staged --quiet || (echo "Committing changes..." && git commit -m "Automated deployment: $(date)")

echo "\nPushing changes to gh-pages..."
git subtree push --prefix build origin gh-pages

echo "\nSwitching back to main branch..."
git checkout main

echo "\nDeployment complete."
