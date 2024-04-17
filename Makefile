default: build

build: src/* 
	npx tsc
	cp src/index.html build
	cp src/images/* build

clean:
	rm -rf build

deploy:
	#!/bin/sh

	git checkout gh-pages

	set -e # stop if error occurs

	# Checkout the main branch and pull the latest changes
	git merge main -m "Merge main into gh-pages"

	make

	# Add all changes to git
	git add .

	# Commit the changes
	git commit -m "Automated deployment: $(date)"

	# push changes
	git subtree push --prefix build origin gh-pages

	git checkout main
