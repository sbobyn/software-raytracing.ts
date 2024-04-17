default: build

build: src/* 
	npx tsc
	cp src/index.html build
	cp src/images/* build

clean:
	rm -rf build

deploy:
	set -e # stop if error occurs

	echo "Pushing local changes to the main branch..."
	git push

	echo "Switching to gh-pages branch..."
	git checkout gh-pages

	echo "Merging main into gh-pages..."
	git merge main -m "Merge main into gh-pages"

	echo "Cleaning and building new changes..."
	make clean && make build

	echo "Adding changes to git..."
	git add .

	# Commit the changes only if there are changes to commit
	echo "Checking for changes to commit..."
	git diff --staged --quiet || (echo "Committing changes..." && git commit -m "Automated deployment: $(date)")

	echo "Pushing changes to gh-pages..."
	git subtree push --prefix build origin gh-pages

	echo "Switching back to main branch..."
	git checkout main

	echo "Deployment complete."
