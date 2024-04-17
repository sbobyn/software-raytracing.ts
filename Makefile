default: build

build: src/* 
	npx tsc
	cp src/index.html build
	cp src/images/* build

clean:
	rm -rf build

deploy:
	./deploy.sh
