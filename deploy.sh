#!/bin/bash

set -e # Stop if any error occurs

echo -e "\nPushing local changes to the main branch..."
git push

echo -e "\nSwitching to gh-pages branch..."
git checkout gh-pages

echo -e "\nMerging main into gh-pages..."
git merge main -m "Merge main into gh-pages"

echo -e "\nCleaning and building new changes..."
rm -rf build
rm -rf demo/js/
make
cp -r demo build

echo -e "\nAdding all changes to git..."
git add .

echo -e "\nChecking for changes to commit..."
git diff --staged --quiet || (echo -e "Committing changes..." && git commit -m "Automated deployment: $(date)")

echo -e "\nPushing changes to gh-pages..."
git subtree push --prefix build origin gh-pages

echo -e "\nSwitching back to main branch..."
git checkout main

echo -e "\nDeployment complete."

